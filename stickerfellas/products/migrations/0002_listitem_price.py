# Generated by Django 4.2.1 on 2023-05-14 14:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='listitem',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0.99, max_digits=5),
        ),
    ]
