from django.urls import path
from .views import ListCompaniesView, CompanyDetailView

urlpatterns = [
    path("", ListCompaniesView.as_view(), name="companies-list"),
    path("<str:company_id>", CompanyDetailView.as_view(), name="companies-detail"),
]
