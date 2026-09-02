from django.contrib import admin
from .models import Role, User

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "created_at")
    search_fields = ("name",)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "name", "role", "oauth_provider", "is_active", "created_at")
    list_filter = ("role", "oauth_provider", "is_active")
    search_fields = ("email", "name")
