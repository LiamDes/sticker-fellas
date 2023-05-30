from django.contrib import admin
from .models import *

admin.site.register(ListItem)
admin.site.register(ProductReview)
admin.site.register(ReviewReply)
admin.site.register(FullOrder)
admin.site.register(Purchase)