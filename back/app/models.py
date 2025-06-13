
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator, RegexValidator
from django.utils.timezone import now

class Usuario(AbstractUser):
    telefone = models.CharField(
        max_length=14,
        validators=[
            MinLengthValidator(13),  
            RegexValidator(
                # Validação do formato do telefone
                regex=r'^\(\d{2}\)\d{5}-\d{4}$',
                message='Formato inválido. Use: (00)00000-0000'
            )
        ],
        help_text="O telefone deve seguir o formato (00)00000-0000"
    )

class Ambiente(models.Model):  
    sig = models.IntegerField(unique=True)
    descricao = models.CharField(max_length=255)
    ni = models.CharField(max_length=100)
    responsavel = models.CharField(max_length=100)  

    def __str__(self):
        return str(self.sig)  

class Sensor(models.Model):  
    sensores_tipo = [
        ('temperatura', 'Temperatura'), 
        ('luminosidade', 'Luminosidade'),
        ('umidade', 'Umidade'),
        ('contador', 'Contador'),
    ]

    sensor = models.CharField(choices=sensores_tipo)
    mac_address = models.CharField(max_length=255)  
    unidade_med = models.CharField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    status = models.CharField(max_length=20) 

    def __str__(self):
        return self.sensor

class Historico(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    valor = models.FloatField()
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.sensor.sensor} - {self.timestamp}"