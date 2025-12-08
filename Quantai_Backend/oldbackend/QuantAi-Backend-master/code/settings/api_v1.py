from django.urls import path, include, re_path

urlpatterns = [
    path('auth/', include('apps.Authentication.urls')),
    path('profile/', include('apps.Profiles.urls')),
    path('transactions/', include('apps.Transactions.urls')),
    path('projects/', include('apps.Projects.urls')),
    path('questions/', include('apps.Questions.urls')),
    path('groups/', include('apps.QuestionGroups.urls')),
    path('variables/', include('apps.Variables.urls')),

    # logs
    path('logs/', include('apps.AuditLog.urls')),
    path('settings/', include('apps.SystemSettings.urls')),
]