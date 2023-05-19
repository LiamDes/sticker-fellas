from rest_framework import serializers
from products.models import ListItem
from django.contrib.auth import get_user_model

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListItem
        fields = ['id', 'name', 'description', 'image', 
                  'price', 'type', 'price_id', 'artist', 'list_date']