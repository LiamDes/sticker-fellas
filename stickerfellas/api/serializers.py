from rest_framework import serializers
from products.models import *
from django.contrib.auth import get_user_model

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListItem
        fields = ['id', 'name', 'description', 'image', 
                  'price', 'type', 'price_id','inventory',
                  'list_date', 'average_rating']
        

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = ['id','user','product','title','description',
                  'rating','posted']


class ReplySerializer(serializers.ModelSerializer):
    user = serializers.CharField()
    class Meta:
        model = ReviewReply
        fields = ['id','user','reply_to','secondary_reply',
                  'comment_text','posted']


class ReplyWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReply
        fields = ['user','reply_to','secondary_reply','comment_text']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['username', 'id', 'is_staff']


class PurchaseSerializer(serializers.ModelSerializer):
    product = ItemSerializer()
    class Meta:
        model = Purchase
        fields = ['product','quantity']


class PurchaseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = ['order','product','quantity']


class FullOrderSerializer(serializers.ModelSerializer):
    product_ordered = PurchaseSerializer(many=True,source='purchase_set')

    class Meta:
        model = FullOrder
        fields = ['id','ordered_by','order_date','product_ordered']



class OrderWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FullOrder
        fields = ['id','ordered_by','order_date','product_ordered']
