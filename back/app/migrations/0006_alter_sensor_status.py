# Generated by Django 5.2.2 on 2025-06-16 00:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_historico_ambiente'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sensor',
            name='status',
            field=models.BooleanField(default=True),
        ),
    ]
