from django.urls import path
from .views import *

appname = 'api'
urlpatterns = [
    path('all/', AllInventory.as_view()),
    path('product/<int:pk>/', ItemDetail.as_view()),
    path('reviews/<int:product_id>', Reviews.as_view()),
    path('reviews/new/', CreateReview.as_view()),
    path('type/', AllCategory.as_view()),
    path('getkey/', get_stripe_key),
    path('stripe/checkoutsession/', checkout_session),
]