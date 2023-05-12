from rest_framework import generics
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
        return ListItem.objects.get(pk=self.kwargs['pk'])