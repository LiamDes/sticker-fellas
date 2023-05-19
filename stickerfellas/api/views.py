from rest_framework import generics
from django.shortcuts import render, HttpResponse, get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from products.models import *
from django.contrib.auth import get_user_model
from .serializers import *

import json
from django.conf import settings
import os
import stripe

stripe.api_key = 'sk_test_51N9EumJgrzFtfn7GNSxzdC7QO5dPdtMxsIq3CYtmJk6KX67JaN54eNGkmmKCElRGnsdoCtZ1Ejedk9pdgfoQUjM500V6U9uiHc'

class AllInventory(generics.ListAPIView):
    serializer_class = ItemSerializer
    queryset = ListItem.objects.all().reverse()


class ItemDetail(generics.RetrieveAPIView):
    serializer_class = ItemSerializer

    def get_queryset(self):
        return ListItem.objects.filter(pk=self.kwargs['pk'])
    

class AllCategory(generics.ListAPIView):
    serializer_class = ItemSerializer
    def get_queryset(self):
        type = self.request.GET.get('type')
        return ListItem.objects.filter(type=type)
    

@api_view(['GET'])
def get_stripe_key(request):
    pub_key = settings.STRIPE_PUB_KEY
    return Response({'pub_key': pub_key})


@api_view(['POST'])
def checkout_session(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    # data = json.loads(request.body)
    data = request.data
    items = data['items']
    full_cart = []

    for index in range(len(items)):
        print(f'This order is for {items[index]["quantity"]} of {items[index]["product"]["name"]}')
        full_cart.append({"price":items[index]["product"]["price_id"], "quantity":items[index]["quantity"]})

    if request.user.id:
        client_id = request.user.id
    else:
        client_id = 0

    try:
        checkout_session = stripe.checkout.Session.create(
            client_reference_id = client_id,
            currency='usd',
            success_url = '%s?session_id={CHECKOUT_SESSION_ID}' % settings.PAYMENT_SUCCESS_URL,
            cancel_url = '%s' % settings.PAYMENT_CANCEL_URL,
            payment_method_types = ['card'],
            mode = 'payment',
            line_items = full_cart
        )
        return Response({'sessionId': checkout_session['id']})
    except Exception as e:
        return Response({'error': str(e)})
    