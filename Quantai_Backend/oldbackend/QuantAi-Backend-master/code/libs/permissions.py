
from rest_framework.permissions import BasePermission

class AllowAdminOnly(BasePermission):
    """
    Allow only admin access permission class 
    only allows request.user.profile.profile_type == "AD" users
    """

    def has_permission(self, request, view):
        if request.user.profile.profile_type == "AD":
            return True
        else:
            return False
        
class AllowClientOnly(BasePermission):
    """
    Allow only client access permission class 
    only allows request.user.profile.profile_type == "CL" users
    """

    def has_permission(self, request, view):
        if request.user.profile.profile_type == "CL":
            return True
        else:
            return False
        
class AllowAudianceOnly(BasePermission):
    """
   Allow only audiance access permission class 
    only allows request.user.profile.profile_type == "AU" users
    """

    def has_permission(self, request, view):
        if request.user.profile.profile_type == "AU":
            return True
        else:
            return False
        
class AllowAdminAndAudianceOnly(BasePermission):
    """
    Allow only admin access permission class 
    only allows request.user.profile.profile_type == "AD" users
    """

    def has_permission(self, request, view):
        if request.user.profile.profile_type == "AD" or request.user.profile.profile_type == "AU":
            return True
        else:
            return False