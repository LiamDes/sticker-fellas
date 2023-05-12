from django.urls import include, path
from .views import *
from . import views
from django.views.generic.base import TemplateView

appname = 'products'
urlpatterns = [
    path('<int:pk>/', TemplateView.as_view(template_name='listing.html'), name='listing'),
]