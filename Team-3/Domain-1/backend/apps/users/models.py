from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class RoleEnum(models.TextChoices):
    JOB_SEEKER = "JOB_SEEKER", "Job Seeker"
    RECRUITER = "RECRUITER", "Recruiter"
    ADMIN = "ADMIN", "Admin"

class Role(models.Model):
    """
    Roles Model (Milestone 1 - Day 2 Foundation)
    Defines the system roles: JOB_SEEKER, RECRUITER, ADMIN.
    """
    name = models.CharField(
        max_length=50,
        unique=True,
        choices=RoleEnum.choices,
        help_text="Unique name of the role"
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Role responsibilities description"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "roles"
        verbose_name = "Role"
        verbose_name_plural = "Roles"

    def __str__(self) -> str:
        return self.name

class UserManager(BaseUserManager):
    """Custom user manager using email as unique identifier."""

    def create_user(self, email, name, password=None, role=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)

        # Default to JOB_SEEKER if no role explicitly provided
        if role is None:
            role, _ = Role.objects.get_or_create(
                name=RoleEnum.JOB_SEEKER,
                defaults={"description": "Candidate exploring and applying for jobs."}
            )

        user = self.model(email=email, name=name, role=role, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        admin_role, _ = Role.objects.get_or_create(
            name=RoleEnum.ADMIN,
            defaults={"description": "Platform administrator."}
        )
        return self.create_user(email, name, password, role=admin_role, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """
    Users Model (Milestone 1 - Day 2 Foundation)
    Stores identity, Django password hashes, external OAuth data, and role relationship.
    """
    name = models.CharField(max_length=255, help_text="Full name of user")
    email = models.EmailField(unique=True, db_index=True, help_text="Login email address")
    # password is provided by AbstractBaseUser using secure password hashing
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="users",
        help_text="Primary assigned role (1-to-many relationship: One role to many users)"
    )
    oauth_provider = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="External OAuth provider (e.g. 'google')"
    )
    oauth_provider_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="External provider unique subject ID"
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self) -> str:
        return f"{self.email} ({self.role.name if self.role else 'No Role'})"
