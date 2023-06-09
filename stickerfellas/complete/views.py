from rest_framework.decorators import api_view
from django.shortcuts import render
import stripe

stripe.api_key = 'sk_test_51N9EumJgrzFtfn7GNSxzdC7QO5dPdtMxsIq3CYtmJk6KX67JaN54eNGkmmKCElRGnsdoCtZ1Ejedk9pdgfoQUjM500V6U9uiHc'

# Create your views here.
@api_view(['GET'])
def order_success(request):
    session = stripe.checkout.Session.retrieve(request.GET.get('session_id'), expand=['line_items'])
    return render(request, 'order_complete.html', {'info': session})