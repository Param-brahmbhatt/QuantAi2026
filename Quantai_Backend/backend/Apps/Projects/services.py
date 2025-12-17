from django.db.models import Q
from .models import Project, ProjectQuota, ProjectFilter, GlobalFilter
from Apps.Survey.models import Answer
from Apps.Users.models import Profile


class QuotaFilterService:
    """Service to handle quota and filter logic"""

    @staticmethod
    def check_quota_availability(project_id, user_country):
        """
        Check if quota is available for a user's country

        Args:
            project_id: Project ID
            user_country: Can be Country object, ISO code string, or None

        Returns:
            dict: {
                'available': bool,
                'message': str,
                'action': str  # 'ALLOW', 'BLOCK_SEGMENT', 'CLOSE_SURVEY'
            }
        """
        project = Project.objects.get(id=project_id)

        # Check if project has any quotas defined
        quotas = ProjectQuota.objects.filter(project=project)

        if not quotas.exists():
            # No quotas defined - allow all
            return {
                'available': True,
                'message': 'No quotas configured',
                'action': 'ALLOW'
            }

        # Handle None or empty country
        if not user_country:
            return {
                'available': False,
                'message': 'Country not specified',
                'action': 'BLOCK_SEGMENT'
            }

        # Convert country to ISO code if needed
        if hasattr(user_country, 'code'):
            # It's a Country object
            country_code = user_country.code
            country_name = user_country.name
        else:
            # It's already a string (ISO code)
            country_code = str(user_country)
            # Get name from django_countries
            from django_countries import countries
            country_name = dict(countries).get(country_code, country_code)

        # Check country-specific quota
        try:
            quota = ProjectQuota.objects.get(
                project=project,
                country=country_code
            )

            if quota.status == 'PAUSED':
                return {
                    'available': False,
                    'message': 'Quota temporarily paused',
                    'action': 'BLOCK_SEGMENT'
                }

            if quota.is_full:
                if quota.action_on_full == 'CLOSE':
                    # Mark project as quota full
                    project.is_quota_full = True
                    project.save()

                    return {
                        'available': False,
                        'message': project.quotafull_message or 'Survey is now closed',
                        'action': 'CLOSE_SURVEY'
                    }
                else:
                    return {
                        'available': False,
                        'message': f'Quota full for {country_name}',
                        'action': 'BLOCK_SEGMENT'
                    }

            return {
                'available': True,
                'message': f'{quota.remaining} slots remaining',
                'action': 'ALLOW',
                'remaining': quota.remaining
            }

        except ProjectQuota.DoesNotExist:
            # Country not in quota list
            return {
                'available': False,
                'message': f'Survey not available in {country_name}',
                'action': 'BLOCK_SEGMENT'
            }

    @staticmethod
    def evaluate_filter_condition(filter_obj, profile):
        """
        Evaluate a single filter condition against user profile

        Args:
            filter_obj: ProjectFilter or GlobalFilter instance
            profile: User Profile instance

        Returns:
            bool: True if condition matches
        """
        variable = filter_obj.variable

        # Get user's answer for this variable
        # First check profiling projects
        try:
            answer = Answer.objects.filter(
                profile=profile,
                question__variable=variable,
                project__isnull=True  # Profiling answers don't belong to a project
            ).latest('created_at')

            user_value = answer.value

        except Answer.DoesNotExist:
            # Check if it's a direct profile field
            if variable.name == 'country':
                user_value = str(profile.citizen)
            elif variable.name == 'email':
                user_value = profile.email
            else:
                # No data available
                return False

        # Evaluate based on operator
        operator = filter_obj.operator

        if operator == 'EQ':
            return str(user_value) == str(filter_obj.value)

        elif operator == 'NEQ':
            return str(user_value) != str(filter_obj.value)

        elif operator in ['GT', 'LT', 'GTE', 'LTE']:
            try:
                user_num = float(user_value)
                filter_num = float(filter_obj.value)

                if operator == 'GT':
                    return user_num > filter_num
                elif operator == 'LT':
                    return user_num < filter_num
                elif operator == 'GTE':
                    return user_num >= filter_num
                elif operator == 'LTE':
                    return user_num <= filter_num
            except (ValueError, TypeError):
                return False

        elif operator == 'CONTAINS':
            return str(filter_obj.value).lower() in str(user_value).lower()

        elif operator == 'IN':
            # Check if user selected any of the filter options
            selected_options = filter_obj.options.values_list('id', flat=True)
            # Parse user_value as list if it's stored as JSON
            try:
                import json
                user_selections = json.loads(user_value) if isinstance(user_value, str) else user_value
                return any(opt in selected_options for opt in user_selections)
            except:
                return False

        elif operator == 'NOT_IN':
            selected_options = filter_obj.options.values_list('id', flat=True)
            try:
                import json
                user_selections = json.loads(user_value) if isinstance(user_value, str) else user_value
                return not any(opt in selected_options for opt in user_selections)
            except:
                return True

        return False

    @staticmethod
    def check_global_filters(profile):
        """
        Check if user passes ALL global filters (AND logic)

        Returns:
            dict: {
                'passed': bool,
                'failed_filters': list,
                'message': str
            }
        """
        global_filters = GlobalFilter.objects.filter(is_active=True)

        if not global_filters.exists():
            return {
                'passed': True,
                'failed_filters': [],
                'message': 'No global filters configured'
            }

        failed_filters = []

        for gf in global_filters:
            matches = QuotaFilterService.evaluate_filter_condition(gf, profile)

            if gf.filter_type == 'INCLUDE':
                # User must match this filter
                if not matches:
                    failed_filters.append(gf.name)

            elif gf.filter_type == 'EXCLUDE':
                # User must NOT match this filter
                if matches:
                    failed_filters.append(gf.name)

        if failed_filters:
            return {
                'passed': False,
                'failed_filters': failed_filters,
                'message': f'Does not meet requirements: {", ".join(failed_filters)}'
            }

        return {
            'passed': True,
            'failed_filters': [],
            'message': 'All global filters passed'
        }

    @staticmethod
    def check_project_filters(project_id, profile):
        """
        Check if user passes survey-specific filters (AND logic)

        Returns:
            dict: {
                'passed': bool,
                'failed_filters': list,
                'message': str
            }
        """
        project_filters = ProjectFilter.objects.filter(
            project_id=project_id,
            is_active=True
        )

        if not project_filters.exists():
            return {
                'passed': True,
                'failed_filters': [],
                'message': 'No project filters configured'
            }

        failed_filters = []

        for pf in project_filters:
            matches = QuotaFilterService.evaluate_filter_condition(pf, profile)

            if pf.filter_type == 'INCLUDE':
                if not matches:
                    failed_filters.append(f"Filter {pf.id}")

            elif pf.filter_type == 'EXCLUDE':
                if matches:
                    failed_filters.append(f"Filter {pf.id}")

        if failed_filters:
            return {
                'passed': False,
                'failed_filters': failed_filters,
                'message': 'Does not meet survey requirements'
            }

        return {
            'passed': True,
            'failed_filters': [],
            'message': 'All project filters passed'
        }

    @staticmethod
    def can_user_access_survey(project_id, profile):
        """
        Master check: quota + global filters + project filters

        Returns:
            dict: {
                'allowed': bool,
                'reason': str,
                'details': dict
            }
        """
        # Step 0: Super Admin / Staff Bypass
        # Superusers and Staff (Creators) bypass all filters and quotas
        if profile.user.is_superuser or profile.user.is_staff:
            return {
                'allowed': True,
                'reason': 'admin_bypass',
                'message': 'Access granted (Admin/Staff Bypass)',
                'details': {'bypass': True}
            }

        # Step 1: Check global filters first
        global_check = QuotaFilterService.check_global_filters(profile)
        if not global_check['passed']:
            return {
                'allowed': False,
                'reason': 'global_filter_failed',
                'message': global_check['message'],
                'details': global_check
            }

        # Step 2: Check project-specific filters
        project_check = QuotaFilterService.check_project_filters(project_id, profile)
        if not project_check['passed']:
            return {
                'allowed': False,
                'reason': 'project_filter_failed',
                'message': project_check['message'],
                'details': project_check
            }

        # Step 3: Check quota availability
        quota_check = QuotaFilterService.check_quota_availability(
            project_id,
            profile.citizen
        )

        if not quota_check['available']:
            return {
                'allowed': False,
                'reason': 'quota_full',
                'message': quota_check['message'],
                'details': quota_check
            }

        # All checks passed
        return {
            'allowed': True,
            'reason': 'all_checks_passed',
            'message': 'User can access survey',
            'details': {
                'global_filters': global_check,
                'project_filters': project_check,
                'quota': quota_check
            }
        }