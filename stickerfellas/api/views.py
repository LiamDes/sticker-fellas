from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FileUploadParser
from products.models import *
from accounts.models import *
from .serializers import *
from django.conf import settings
import stripe

stripe.api_key = 'sk_test_51N9EumJgrzFtfn7GNSxzdC7QO5dPdtMxsIq3CYtmJk6KX67JaN54eNGkmmKCElRGnsdoCtZ1Ejedk9pdgfoQUjM500V6U9uiHc'

class AllInventory(generics.ListAPIView):
    serializer_class = ItemSerializer
    queryset = ListItem.objects.all().reverse()


class ItemDetail(generics.RetrieveUpdateAPIView):
    serializer_class = ItemSerializer

    def get_queryset(self):
        return ListItem.objects.filter(pk=self.kwargs['pk'])


class ItemCreate(generics.CreateAPIView):
    parser_classes = [MultiPartParser]
    serializer_class = ItemSerializer
    queryset = ListItem.objects.all()
    def post(self, request, format=None, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Extract the image file from the request
        image_file = request.data['image']
        # Create a new instance of ListItem with the validated data
        list_item = ListItem(**serializer.validated_data)
        # Set the image field with the image file
        list_item.image = image_file
        # Save the ListItem instance
        list_item.save()
        return Response(serializer.data)


class ItemDelete(generics.DestroyAPIView):
    serializer_class = ItemSerializer
    def get_queryset(self):
        return ListItem.objects.filter(pk=self.kwargs['pk'])


class AllCategory(generics.ListAPIView):
    serializer_class = ItemSerializer
    def get_queryset(self):
        type = self.request.GET.get('type')
        return ListItem.objects.filter(type=type)


class Reviews(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        product = self.kwargs.get("product_id")
        return ProductReview.objects.filter(product=product)
    

class CreateReview(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    def get_queryset(self):
        return ProductReview.objects.all()
    

class Replies(generics.ListAPIView):
    serializer_class = ReplySerializer

    def get_queryset(self):
        reply = self.kwargs.get("reply_to_id")
        thread = self.kwargs.get("secondary_reply")
        print(thread)
        return ReviewReply.objects.filter(reply_to=reply)
    

class CreateReply(generics.CreateAPIView):
    serializer_class = ReplyWriteSerializer
    def get_queryset(self):
        return ReviewReply.objects.all()
    

@api_view(['GET'])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class OrderHistories(generics.ListAPIView):
    serializer_class = FullOrderSerializer
    def get_queryset(self):
        return FullOrder.objects.filter(ordered_by=self.request.user)


class CreateOrder(generics.ListCreateAPIView):
    serializer_class = OrderWriteSerializer
    def get_queryset(self):
        return FullOrder.objects.filter(
            ordered_by=self.request.user
        ).order_by('-order_date')[:1]


class PurchaseHistories(generics.ListAPIView):
    serializer_class = PurchaseSerializer
    queryset = Purchase.objects.all()


class NewPurchase(generics.ListCreateAPIView):
    serializer_class = PurchaseWriteSerializer
    queryset = Purchase.objects.all()


class PurchasesByOrder(generics.ListAPIView):
    serializer_class = PurchaseSerializer
    def get_queryset(self):
        return Purchase.objects.filter(order=self.kwargs['order'])


@api_view(['GET'])
def get_stripe_key(request):
    pub_key = settings.STRIPE_PUB_KEY
    return Response({'pub_key': pub_key})


@api_view(['POST'])
def checkout_session(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    data = request.data
    items = data['items']
    full_cart = []

    for index in range(len(items)):
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
    