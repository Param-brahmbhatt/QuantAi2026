from django.db import models
from django.apps import apps
from django.utils.timezone import datetime, timedelta
from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save

from model_utils import FieldTracker

from libs.models import AbstractLoggingModel
from libs.uuid import (
    Get10DigitUUIDHex
)

from libs.email import (
    QuestionairAssignedEmail
)

def GetDefaultEnglish():
    try:
        return [
            apps.get_model('SystemSettings.Language').objects.get( code = "EN" ),
        ]
    except Exception as e:
        return [
            apps.get_model('SystemSettings.Language').objects.create(
                code = "EN",
                full_name = "English",
            ),
        ]

class Project(AbstractLoggingModel):
    '''
    keeps basic details related to survey 
    '''

    # basic info
    uuid = models.CharField(
        max_length=10,
        default=Get10DigitUUIDHex
    )
    code = models.CharField(
        max_length=50,
        verbose_name="Survey/Profilling Code",
        unique=True,
    )
    title = models.CharField(
        max_length=200,
        verbose_name="Title"
    )
    description = models.TextField(
        verbose_name="Project Description",
        null=True,
    )
    languages = models.ManyToManyField(
        'SystemSettings.Language',
        related_name='projects',
        default=GetDefaultEnglish,
        db_constraint=False,
    )
    project_type = models.CharField(
        max_length=2,
        choices=(
            ("SU", "Survey"),
            ("PR", "Profile"),
        ),
        verbose_name="Project Type"
    )
    # only if survey 
    # project_mode = ( "" )
    mode = models.CharField(
        max_length=2,
        choices=(
            ("DE", "Development"),
            ("PR", "Preview"),
            ("DM", "Demo"),
            ("LI", "Live"),
            ("CO", "Complete"),
        ),
        verbose_name="Mode",
        default="DE",
    )
    active = models.BooleanField(
        default=True,
    )

    # time conditions
    start_time = models.DateTimeField(
        verbose_name="Start On ?"
    )
    end_time = models.DateTimeField(
        verbose_name="End On ?",
        null=True,
        blank=True,
    )

    # LOGO 
    logo_location = models.CharField(
        max_length=2,
        choices=(
            ("CE", "Center"),
            ("LT", "Left"),
            ("RT", "Right"),
        ),
        default="CE",
    )

    logo = models.ImageField(
        upload_to='survey/logos/',
        null=True,
        blank=True,
    )

    logo_css_width = models.PositiveIntegerField(
        default=100,
    )

    logo_css_height = models.PositiveIntegerField(
        default=100,
    )

    logo_fit = models.CharField(
        max_length=2,
        choices=(
            ("NO", "None"),
            ("CN", "Contain"),
            ("CO", "Cover"),
            ("FI", "Fill"),
        ),
        verbose_name="Logo Fit",
        default="NO",
    )

    # Navigation Parameter
    welcome_message = models.TextField(
        null=True,
        blank=True,
    )
    display_welcome_message = models.BooleanField(
        default=False,
    )
    thankyou_message = models.TextField(
        null=True,
        blank=True,
    )
    display_thankyou_message = models.BooleanField(
        default=False,
    )
    quota_message = models.TextField(
        null=True,
        blank=True,
    )
    terminate_message = models.TextField(
        null=True,
        blank=True,
    )
    start_button_text = models.CharField(
        max_length=50,
        default="Start"
    )
    complete_button_text = models.CharField(
        max_length=50,
        default="Complete"
    )
    previous_button_text = models.CharField(
        max_length=50,
        default="Previous"
    )
    next_button_text = models.CharField(
        max_length=50,
        default="Next"
    )
    previous_ans_button_text = models.CharField(
        max_length=50,
        default="Previous Answer"
    )
    edit_previous_ans_button_text = models.CharField(
        max_length=50,
        default="Previous Answer"
    )
    show_progress_bar = models.BooleanField(
        default=False,
    )
    answer_preview = models.BooleanField(
        verbose_name="Show answer preview after survey ?",
        default=False,
    )
    filter_and_or = models.SmallIntegerField(
        choices=(
            (0, "And"),
            (1, "Or")
        ),
        default=1, # OR
    )
    filter_ask_all = models.BooleanField(
        default=True,
    )
    reward_points = models.FloatField(
        default=1.0
    )

    tracker = FieldTracker()
    
    def __str__(self):
        return self.uuid
    
    def FilterAndAssignProject(self, profile):
        if profile.profile_type == "AU":
            if self.filter_ask_all:
                try:
                    pad = profile.my_projects.get(
                        project = self,
                    )
                    if pad.status == "RE":
                        pad.status = pad.last_status
                        pad.save()
                        return True
                    return False
                except apps.get_model('Projects.ProjectAudianceDetails').DoesNotExist as e:
                    pad = profile.my_projects.create(
                        project = self,
                        next_question = self.questions.get(is_initial_question = True)
                    )
                    pad.next_options.set(pad.next_question.options.all())
                    pad.next_rows.set(pad.next_question.rows.all())
                    pad.next_columns.set(pad.next_question.columns.all())
                    pad.save()
                    return True
                except Exception as e:
                    print ("Error (500) --> ",e)
                    return False
            else:
                try:
                    pad = profile.my_projects.get(
                        project = self,
                    )
                except apps.get_model('Projects.ProjectAudianceDetails').DoesNotExist as e:
                    pad = None
                except Exception as e:
                    pad = None
                    print ("Error (500) --> ",e)
                    return False
                match_counter = 0
                for filter in self.filters.all():
                    if profile.answers.filter( variable = filter.variable, option__in = filter.variable.question.options.all(), is_last = True).count() > 0:
                        if self.filter_and_or:
                            match_counter += 1
                            break
                        else:
                            match_counter += 1
                if match_counter > 0 :
                    if self.filter_and_or and match_counter != self.filters.count():
                        if not pad:
                            try:
                                x = profile.my_projects.get(
                                    project = self,
                                )
                                return True
                            except apps.get_model('Projects.ProjectAudianceDetails').DoesNotExist as e:
                                x = profile.my_projects.create(
                                    project = self,
                                    next_question = self.questions.get(is_initial_question = True)
                                )
                                x.next_options.set(x.next_question.options.all())
                                x.next_rows.set(x.next_question.rows.all())
                                x.next_columns.set(x.next_question.columns.all())
                                x.save()
                                return True
                            except Exception as e:
                                print ("Error (500) --> ",e)
                                return False
                        else:
                            if pad.status == "RE":
                                pad.status = pad.last_status
                                pad.save()
                            return False
                    elif not self.filter_and_or and match_counter == self.filters.count():
                        if not pad:
                            try:
                                x = profile.my_projects.get(
                                    project = self,
                                )
                                return True
                            except apps.get_model('Projects.ProjectAudianceDetails').DoesNotExist as e:
                                x = profile.my_projects.create(
                                    project = self,
                                    next_question = self.questions.get(is_initial_question = True)
                                )
                                x.next_options.set(x.next_question.options.all())
                                x.next_rows.set(x.next_question.rows.all())
                                x.next_columns.set(x.next_question.columns.all())
                                x.save()
                                return True
                            except Exception as e:
                                print ("Error (500) --> ",e)
                                return False
                        else:
                            if pad.status == "RE":
                                pad.status = pad.last_status
                                pad.save()
                            return False
                    else:
                        if not pad:
                            try:
                                x = profile.my_projects.get(
                                    project = self,
                                )
                                return False
                            except apps.get_model('Projects.ProjectAudianceDetails').DoesNotExist as e:
                                x = profile.my_projects.create(
                                    project = self,
                                    next_question = self.questions.get(is_initial_question = True),
                                    status = "RE",
                                    last_status = "PE",
                                )
                                x.next_options.set(x.next_question.options.all())
                                x.next_rows.set(x.next_question.rows.all())
                                x.next_columns.set(x.next_question.columns.all())
                                x.save()
                                return False
                            except Exception as e:
                                print ("Error (500) --> ",e)
                                return False
                        else:
                            return False
                else:
                    if not pad:
                        try:
                            x = profile.my_projects.get(
                                project = self,
                            )
                            return True
                        except apps.get_model('Projects.ProjectAudianceDetails').DoesNotExist as e:
                            x = profile.my_projects.create(
                                project = self,
                                next_question = self.questions.get(is_initial_question = True),
                                status = "RE",
                                last_status = "PE",
                            )
                            x.next_options.set(x.next_question.options.all())
                            x.next_rows.set(x.next_question.rows.all())
                            x.next_columns.set(x.next_question.columns.all())
                            x.save()
                            return True
                        except Exception as e:
                            print ("Error (500) --> ",e)
                            return False
                    else:
                        if pad.status in ["PE", "PF"]:
                            pad.last_status = pad.status
                            pad.status == "RE"
                            pad.save()
                        return False
                    # if pad:
                    #     pad.last_status = pad.status
                    #     pad.status == "RE"
                    #     pad.save()
                    return False
                
    @property
    def audiance_counter(self):
        return self.audiance_statuses.filter(
            status__in = ["PF","CO","TE","QF"]
        ).count()

    @property
    def total_time_consumed(self):
        x = timedelta(seconds=0)
        for obj in self.audiance_statuses.all():
            if x == 0:
                x = obj.updated_on - obj.created_on
            else:
                x += obj.updated_on - obj.created_on
        return x
    
    @property
    def avg_time_consumed(self):
        try:
            time_consumed  = self.total_time_consumed / self.audiance_statuses.count()
            totalSeconds = time_consumed.seconds
            hours, remainder = divmod(totalSeconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            return '%s H:%s M:%s S' % (hours, minutes, seconds)
        except ZeroDivisionError:
            return '%s H:%s M:%s S' % (0, 0, 0)

    class Meta:
        db_table = 'project'
        managed = True
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

# @receiver(post_save, sender=Project)
# def UpdateAudianceProjectStatus(sender, instance, *args, **kwargs):
#     if instance.tracker.previous('mode') != instance.mode and instance.mode == "LI":
#         audiances = apps.get_model('Profiles.Profile').objects.filter(profile_type="AU")
#         for audiance in audiances:
#             if instance.FilterAndAssignProject(audiance):
#                 QuestionairAssignedEmail(
#                     project=instance,
#                     profile=audiance,
#                 )
                

class ProjectFilter(AbstractLoggingModel):
    project = models.ForeignKey(
        'Projects.Project',
        on_delete=models.CASCADE,
        related_name='filters'
    )
    variable = models.ForeignKey(
        'Variables.Variable',
        on_delete=models.CASCADE,
    )
    options = models.ManyToManyField(
        'Questions.QuestionChoices',
        related_name='filter_options',
    )

class ProjectAudianceDetails(AbstractLoggingModel):
    project = models.ForeignKey(
        'Projects.Project',
        on_delete=models.CASCADE,
        related_name='audiance_statuses'
    )
    profile = models.ForeignKey(
        'Profiles.Profile',
        on_delete=models.CASCADE,
        related_name='my_projects'
    )
    answered_questions = models.PositiveIntegerField(
        default=0
    )
    total_rewards = models.PositiveIntegerField(
        default=0
    )
    status = models.CharField(
        max_length=3,
        choices=(
            ("PE", "Pending"),
            ("PF", "Partially Filled"),
            ("CO", "Completed"),
            ("TE", "Terminated"),
            ("QF", "Quota Full"),
            ("RE", "Removed From Porfolio"),
            ("EN", "Ended"),
        ),
        default="PE"
    )
    last_status = models.CharField(
        max_length=3,
        choices=(
            ("PE", "Pending"),
            ("PF", "Partially Filled"),
            ("CO", "Completed"),
            ("TE", "Terminated"),
            ("QF", "Quota Full"),
            ("RE", "Removed From Porfolio"),
            ("EN", "Ended"),
        ),
        default="PE"
    )
    last_answered_question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='last_answered_audiance',
    )
    next_question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='next_to_answer_audiance',
    )
    next_options = models.ManyToManyField(
        'Questions.QuestionChoices',
        null=True,
        blank=True,
        related_name='next_to_answer_audiance',
    )
    next_rows = models.ManyToManyField(
        'Questions.QuestionRow',
        null=True,
        blank=True,
        related_name='next_to_answer_audiance',
    )
    next_columns = models.ManyToManyField(
        'Questions.QuestionColumn',
        null=True,
        blank=True,
        related_name='next_to_answer_audiance',
    )
    report_id = models.JSONField(
        null=True,
        blank=True,
        default = None,
    )
    report_value = models.JSONField(
        null=True,
        blank=True,
        default = None,
    )
    
    tracker = FieldTracker()

    def ProcessAnswer(self, question_option, others, others_row):
        # set current answer to answer object
        status_mapper = {
            'QUE' : "PF",
            'TER' : "TE",
            'QUO' : "QF",
            'COM' : "CO",
        }
        answer = self.profile.answers.create(
            question = self.next_question,
            project = self.project,
            variable = self.next_question.variable,
            input = others,
            input_row = others_row,
            is_demo = True if self.project.mode == "DM" else False,
        )
        for option in question_option:
            answer.option.add(option)
            if option.question.question_type in ["RDO", "RAT", "DRP", "BOL", "SIG", "COM"]:
                if option.question.question_type not in ["SIG", "COM"]:
                    if not option.is_other:
                        self.report_value[f"{option.question.variable_name}"] = option.label
                        self.report_id[f"{option.question.variable_name}"] = option.value
                    else:
                        self.report_value[f"{option.question.variable_name}"] = others[str(option.id)]
                        self.report_id[f"{option.question.variable_name}"] = others[str(option.id)]
                else:
                    self.report_value[f"{option.question.variable_name}"] = others[str(option.id)]
                    self.report_id[f"{option.question.variable_name}"] = others[str(option.id)]
            if option.question.question_type in ["MUT"]:
                self.report_value[f"{option.variable_name}"] = others[str(option.id)]
                self.report_id[f"{option.variable_name}"] = others[str(option.id)]
            if option.question.question_type in ["CHB", "TAB"]:
                if not option.is_other:
                    self.report_value[f"{option.variable_name}"] = option.label
                    self.report_id[f"{option.variable_name}"] = 1
                else:
                    self.report_value[f"{option.variable_name}"] = others[str(option.id)]
                    self.report_id[f"{option.variable_name}"] = others[str(option.id)]
            elif option.question.question_type in ["SCM", "MCM"]: 
                if option.column.column_type in ["RDO", "RAT", "DRP", "BOL", "SIG", "COM"]:
                    if not option.is_other:
                        self.report_value[f"{option.question.variable_name}_{option.row.label.replace(' ', '_')}_{option.column.label.replace(' ', '_')}".upper()] = option.label
                        self.report_id[f"{option.question.variable_name}_{option.row.label.replace(' ', '_')}_{option.column.label.replace(' ', '_')}".upper()] = option.value
                    else:
                        self.report_value[f"{option.question.variable_name}_{option.row.label.replace(' ', '_')}_{option.column.label.replace(' ', '_')}".upper()] = others[str(option.id)]
                        self.report_id[f"{option.question.variable_name}_{option.row.label.replace(' ', '_')}_{option.column.label.replace(' ', '_')}".upper()] = others[str(option.id)]
                else:
                    if not option.is_other:
                        self.report_value[f"{option.variable_name}"] = option.label
                        self.report_id[f"{option.variable_name}"] = 1
                    else:
                        self.report_value[f"{option.variable_name}"] = others[str(option.id)]
                        self.report_id[f"{option.variable_name}"] = others[str(option.id)]
                    
        

        # find next question 
        self.last_answered_question = self.next_question
        self.next_question = None
        self.next_options.clear()
        self.next_rows.clear()
        self.next_columns.clear()
        is_next, next_question, options, rows, columns, status = self.last_answered_question.FindNextQuestion( 
            profile = self.profile
        )
        if is_next:
            self.next_question = next_question
            self.next_options.set(options)
            self.next_rows.set(rows)
            self.next_columns.set(columns)
            self.status = status_mapper[status]
        else:
            self.status = status_mapper[status]
        self.answered_questions += 1 
        self.total_rewards += self.project.reward_points
        tx = self.profile.transactions.create(
            project = self.project,
            question = self.last_answered_question,
            total_amount = self.project.reward_points,
            t_type = "DEP",
        )
        tx.status = "SU"
        tx.save()

        # check for report json 
        # if self.report is None:
        #     initial_dir = {}

        # else:
        #     for 
        #     self.report[self.last_answered_question.variable_name] = 
        self.save()


    @property
    def time_consumed(self):
        return str(self.updated_on - self.created_on)
    
    @property
    def total_questions(self):
        """
        status = models.CharField(
        max_length=3,
        choices=(
            ("PE", "Pending"),
            ("PF", "Partially Filled"),
            ("CO", "Completed"),
            ("TE", "Terminated"),
            ("QF", "Quota Full"),
            ("RE", "Removed From Porfolio"),
            ("EN", "Ended"),
        ),
        default="PE"
        )
        """
        if self.status in ["CO", "TE", "QF", "EN"]:
            return self.answered_questions
        else:
            return self.project.questions.count()
    
    
@receiver(pre_save, sender=ProjectAudianceDetails)
def AddBlankReportJSON(sender, instance, *args ,**kwargs):
    if not instance.id:
        json_to_add_value = {}
        json_to_add_id = {}
        json_to_add_value['Respodent ID'] = instance.profile.uuid
        json_to_add_id['Respodent ID'] = instance.profile.uuid
        if not instance.project.filter_ask_all:
            for filt in instance.project.filters.all():
                try:
                    answer = instance.profile.answers.get(variable__name = filt.variable.name) 
                    json_to_add_value[f"{filt.variable.name}_{option.label}"] = option.value
                    json_to_add_id[f"{filt.variable.name}_{option.label}"] = option.value
                except Exception as e:
                    json_to_add_value[f"{filt.variable.name}"] = ""
                    json_to_add_id[f"{filt.variable.name}"] = ""
        for question in instance.project.questions.all().order_by('display_index'):
            if question.question_type in ["RDO", "RAT", "DRP", "BOL", "SIG", "COM"]:
                json_to_add_value[f"{question.variable_name}"] = ""
                json_to_add_id[f"{question.variable_name}"] = ""
            if question.question_type in ["CHB", "TAB", "MUT"]:
                for option in question.options.all():
                    json_to_add_value[f"{option.variable_name}"] = ""
                    json_to_add_id[f"{option.variable_name}"] = 0
            elif question.question_type in ["SCM", "MCM"]: 
                for row in question.rows.all():
                    for column in question.columns.all():
                        if column.column_type in ["RDO", "RAT", "DRP", "BOL", "SIG", "COM"]:
                            json_to_add_value[f"{question.variable_name}_{row.label.replace(' ', '_')}_{column.label.replace(' ', '_')}".upper()] = ""
                            json_to_add_id[f"{question.variable_name}_{row.label.replace(' ', '_')}_{column.label.replace(' ', '_')}".upper()] = ""
                        else:
                            for option in column.options.filter( row = row ):
                                json_to_add_value[f"{option.variable_name}"] = ""
                                json_to_add_id[f"{option.variable_name}"] = ""
        instance.report_value = json_to_add_value
        instance.report_id = json_to_add_id
    else:
        if instance.tracker.previous('status') == "RE" and instance.status != "RE":
            if not instance.project.filter_ask_all:
                for filt in instance.project.filters.all():
                    try:
                        answer = instance.profile.answers.get(variable__name = filt.variable.name) 
                        instance.report_value[f"{filt.variable.name}_{option.label}"] = option.label
                        instance.report_id[f"{filt.variable.name}_{option.label}"] = option.value
                    except Exception as e:
                        instance.report_value[f"{filt.variable.name}"] = ""
                        instance.report_id[f"{filt.variable.name}"] = ""
