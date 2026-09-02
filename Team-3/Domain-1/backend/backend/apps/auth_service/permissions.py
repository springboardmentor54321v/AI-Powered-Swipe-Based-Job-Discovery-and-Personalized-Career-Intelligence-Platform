from rest_framework.permissions import BasePermission
from apps.users.models import RoleEnum

class IsAuthenticated(BasePermission):
    """Allows access only to authenticated users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class HasRole(BasePermission):
    """
    Reusable Role-Based Access Control (RBAC) permission.
    Verifies that the authenticated user possesses one of the allowed roles.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        user_role = getattr(request.user, "role", None)
        if not user_role:
            return False

        # Compare role name against allowed roles
        return user_role.name in [r.value if hasattr(r, "value") else str(r) for r in self.allowed_roles]

class IsJobSeeker(HasRole):
    """Allows access strictly to users with the JOB_SEEKER role."""
    allowed_roles = [RoleEnum.JOB_SEEKER]
    message = "Permission denied: Requires JOB_SEEKER role."

class IsRecruiter(HasRole):
    """Allows access strictly to users with the RECRUITER role."""
    allowed_roles = [RoleEnum.RECRUITER]
    message = "Permission denied: Requires RECRUITER role."

class IsAdmin(HasRole):
    """Allows access strictly to users with the ADMIN role."""
    allowed_roles = [RoleEnum.ADMIN]
    message = "Permission denied: Requires ADMIN role."

class IsJobSeekerOrRecruiter(HasRole):
    """Allows access to users with either JOB_SEEKER or RECRUITER role."""
    allowed_roles = [RoleEnum.JOB_SEEKER, RoleEnum.RECRUITER]
    message = "Permission denied: Requires JOB_SEEKER or RECRUITER role."
