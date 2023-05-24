from rest_framework import serializers
from products.models import ListItem, ProductReview
from django.contrib.auth import get_user_model

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListItem
        fields = ['id', 'name', 'description', 'image', 
                  'price', 'type', 'price_id', 'artist', 'inventory',
                  'list_date', 'average_rating']
        

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.CharField()
    class Meta:
        model = ProductReview
        fields = ['user', 'product', 'title', 'description', 'rating']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['username', 'id']