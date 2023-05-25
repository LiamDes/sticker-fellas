from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import Avg

class ListItem(models.Model):
    PRODUCT_TYPES=(('S','sticker'),('P','pin'),('H','hat'))

    name = models.CharField(max_length=30)
    description = models.CharField(max_length=1000)
    image = models.ImageField()
    price = models.DecimalField(max_digits=5,decimal_places=2,default=0.99)
    type = models.CharField(choices=PRODUCT_TYPES,max_length=1,default="s")
    artist = models.ForeignKey(get_user_model(),on_delete=models.PROTECT)
    price_id = models.CharField(max_length=300)
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

    def __str__(self) -> str:
        return f'{self.product}: {self.rating}/5'


class FullOrder(models.Model):
    ordered_by = models.ForeignKey(get_user_model(),on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'Order by {self.ordered_by} on {self.order_date}'
    

class Purchase(models.Model):
    product = models.ForeignKey(ListItem,on_delete=models.CASCADE)
    quantity = models.IntegerField()
    order = models.ForeignKey(FullOrder,on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f'{self.order}: {self.quantity} of {self.product}'