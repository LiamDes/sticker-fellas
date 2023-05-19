from django.urls import path
# from django_paypal import views
from .views import *

appname = 'api'
urlpatterns = [
    path('all/', AllInventory.as_view()),
    path('product/<int:pk>/', ItemDetail.as_view()),
    path('type/', AllCategory.as_view()),
    path('getkey/', get_stripe_key),
    path('stripe/checkoutsession/', checkout_session)
]