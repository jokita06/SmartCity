from django.contrib import admin
from .models import Usuario, Ambiente, Sensor, Historico
from django.contrib.auth.admin import UserAdmin

# Registro dos modelos
admin.site.register(Usuario)  
admin.site.register(Ambiente)  
admin.site.register(Sensor)  
admin.site.register(Historico)