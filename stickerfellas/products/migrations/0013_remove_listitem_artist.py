# Generated by Django 4.2.1 on 2023-05-31 22:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0012_reviewreply_secondary_reply'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='listitem',
            name='artist',
        ),
    ]
