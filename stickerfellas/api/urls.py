from django.urls import include, path
from .views import *
from . import views

appname = 'api'
urlpatterns = [
    path('all/', AllInventory.as_view()),
    path('product/<int:pk>/', ItemDetail.as_view()),
    path('type/', AllCategory.as_view()),
]