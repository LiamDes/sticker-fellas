# Generated by Django 4.2.1 on 2023-05-22 19:27

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_listitem_price_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='listitem',
            name='inventory',
            field=models.IntegerField(default=50, validators=[django.core.validators.MaxValueValidator(99), django.core.validators.MinValueValidator(0)], verbose_name='Items Available'),
        ),
    ]
