from django.urls import path
from .views import *

app_name = 'complete'
urlpatterns = [
    path('', order_success)
]