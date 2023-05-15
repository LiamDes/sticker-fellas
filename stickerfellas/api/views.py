from rest_framework import generics
from django.shortcuts import render, HttpResponse, get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from products.models import *
from django.contrib.auth import get_user_model
from .serializers import *


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