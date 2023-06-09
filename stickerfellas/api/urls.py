from django.urls import path
from .views import *

appname = 'api'
urlpatterns = [
    path('all/', AllInventory.as_view()),
    path('current/', current_user, name='current_user'),
    path('inventory/new/', ItemCreate.as_view()),
    path('inventory/delete/<int:pk>/', ItemDelete.as_view()),
    path('orders/', OrderHistories.as_view()),
    path('orders/new/', CreateOrder.as_view()),
    path('purchases/', PurchaseHistories.as_view()),
    path('purchases/new/', NewPurchase.as_view()),
    path('purchases/<int:order>/', PurchasesByOrder.as_view()),
    path('product/<int:pk>/', ItemDetail.as_view()),
    path('reviews/<int:product_id>/', Reviews.as_view()),
    path('reviews/new/', CreateReview.as_view()),
    path('<int:reply_to_id>/replies/', Replies.as_view()),
    path('replies/new/', CreateReply.as_view()),
    path('type/', AllCategory.as_view()),
    path('getkey/', get_stripe_key),
    path('stripe/checkoutsession/', checkout_session),
]