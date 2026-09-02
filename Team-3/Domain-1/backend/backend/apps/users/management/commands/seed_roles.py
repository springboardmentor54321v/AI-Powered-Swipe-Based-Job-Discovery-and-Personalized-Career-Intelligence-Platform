from django.core.management.base import BaseCommand
from apps.users.models import Role, RoleEnum

class Command(BaseCommand):
    help = "Seed the three default Milestone 1 roles: JOB_SEEKER, RECRUITER, ADMIN."

    def handle(self, *args, **options):
        roles_data = [
            {
                "name": RoleEnum.JOB_SEEKER,
                "description": "Job seeker exploring jobs, swiping, uploading resumes, and tracking applications."
            },
            {
                "name": RoleEnum.RECRUITER,
                "description": "Recruiter posting jobs, reviewing candidate applications, and managing hiring pipeline."
            },
            {
                "name": RoleEnum.ADMIN,
                "description": "System administrator managing users, platform settings, and audit logs."
            },
        ]

        created_count = 0
        for r_data in roles_data:
            role, created = Role.objects.get_or_create(
                name=r_data["name"],
                defaults={"description": r_data["description"]}
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created role: {role.name}"))
            else:
                self.stdout.write(f"Role already exists: {role.name}")

        self.stdout.write(self.style.SUCCESS(f"Role seeding finished. ({created_count} newly created)"))
