from django.urls import path
from .views import NotificationListView, UnreadCountView, MarkReadView, AlertPreferenceView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications-list'),
    path('unread-count', UnreadCountView.as_view(), name='notifications-unread'),
    path('<uuid:pk>/read', MarkReadView.as_view(), name='notifications-read'),
    path('preferences', AlertPreferenceView.as_view(), name='notifications-prefs'),
]