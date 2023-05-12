from django.contrib import admin
from django.urls import include, path
from django.views.generic.base import TemplateView


app_name = "StickerFellas"
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path("accounts/", include("django.contrib.auth.urls")),
    path('accounts/', include('accounts.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]
