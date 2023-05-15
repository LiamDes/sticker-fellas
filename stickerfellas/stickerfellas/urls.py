from django.contrib import admin
from django.urls import include, path
from django.views.generic.base import TemplateView
from django.conf import settings
from django.conf.urls.static import static


app_name = "stickerfellas"
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path("accounts/", include("django.contrib.auth.urls")),
    path('accounts/', include('accounts.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('complete/', TemplateView.as_view(template_name='order_complete.html'), name='complete'),
    path('error/', TemplateView.as_view(template_name='order_error.html'), name='error'),
]

if settings.DEBUG: 
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)