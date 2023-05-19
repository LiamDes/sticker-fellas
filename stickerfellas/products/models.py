from django.db import models
from django.contrib.auth import get_user_model

class ListItem(models.Model):
    PRODUCT_TYPES=(('S','sticker'),('P','pin'),('H','hat'))

    name = models.CharField(max_length=30)
    description = models.CharField(max_length=1000)
    image = models.ImageField()
    price = models.DecimalField(max_digits=5,decimal_places=2,default=0.99)
    type = models.CharField(choices=PRODUCT_TYPES,max_length=1,default="s")
    artist = models.ForeignKey(get_user_model(), on_delete=models.PROTECT)
    price_id = models.CharField(max_length=300)
    list_date = models.DateField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name
