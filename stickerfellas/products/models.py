from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.db.models import Avg

stripe_validator = RegexValidator(r'price_([a-zA-Z0-9_]){24}', 'Stripe Price ID must start with "price_" and contain 24 digits/numbers.')

class ListItem(models.Model):
    PRODUCT_TYPES=(('S','sticker'),('P','pin'),('H','hat'))

    name = models.CharField(max_length=30)
    description = models.CharField(max_length=1000)
    image = models.ImageField()
    price = models.DecimalField(max_digits=5,decimal_places=2,default=0.99)
    type = models.CharField(choices=PRODUCT_TYPES,max_length=1,default="s")
    price_id = models.CharField(max_length=300, validators=[stripe_validator])
    list_date = models.DateField(auto_now_add=True)
    inventory = models.IntegerField(verbose_name="Items Available",default=50,
                                    validators=[MaxValueValidator(99),MinValueValidator(0)])
    
    def average_rating(self) -> float:
        return ProductReview.objects.filter(product=self).aggregate(Avg("rating"))["rating__avg"] or 0

    def __str__(self) -> str:
        return self.name
    

class ProductReview(models.Model):
    user = models.CharField(max_length=30)
    product = models.ForeignKey(ListItem, on_delete=models.CASCADE)
    title = models.CharField(max_length=55)
    description = models.CharField(max_length=1000,null=True,blank=True)
    rating = models.IntegerField(default=0,validators=[MaxValueValidator(5),MinValueValidator(0)])
    posted = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.product}: {self.rating}/5 by {self.user}'


class ReviewReply(models.Model):
    user = models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    reply_to = models.ForeignKey(ProductReview, on_delete=models.CASCADE)
    comment_text = models.CharField(max_length=400)
    posted = models.DateTimeField(auto_now_add=True)
    secondary_reply = models.ForeignKey('self',on_delete=models.CASCADE,blank=True,null=True)

    def __str__(self) -> str:
        return f'Reply to {self.reply_to}: {self.comment_text}'


class FullOrder(models.Model):
    ordered_by = models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)
    product_ordered = models.ManyToManyField(ListItem,through="Purchase")

    def __str__(self) -> str:
        return f'Order by {self.ordered_by}'


class Purchase(models.Model):
    product = models.ForeignKey(ListItem,on_delete=models.CASCADE)
    quantity = models.IntegerField()
    order = models.ForeignKey(FullOrder,on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f'{self.order}: {self.quantity} of {self.product}'