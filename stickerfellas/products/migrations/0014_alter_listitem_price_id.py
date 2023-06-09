# Generated by Django 4.2.1 on 2023-06-06 19:26

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0013_remove_listitem_artist'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listitem',
            name='price_id',
            field=models.CharField(max_length=300, validators=[django.core.validators.RegexValidator('price_([a-zA-Z0-9_]){24}', 'Stripe Price ID must start with "price_"')]),
        ),
    ]
