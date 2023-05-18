from django.urls import include, path, re_path
# from django_paypal import views
from .views import *
from . import views

appname = 'api'
urlpatterns = [
    path('all/', AllInventory.as_view()),
    path('product/<int:pk>/', ItemDetail.as_view()),
    path('type/', AllCategory.as_view()),
]