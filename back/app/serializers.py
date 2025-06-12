
from rest_framework import serializers
from .models import Usuario, Ambiente, Sensor, Historico
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password'] 

class LoginSerializer(TokenObtainPairSerializer): 
    def validate(self, attrs):
        data = super().validate(attrs)

        data['usuario'] = {
            'username': self.user.username,
            'email': self.user.email
        }
        return data

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'

class AmbienteSerializer(serializers.ModelSerializer):
    sensores = SensorSerializer(many=True, read_only=True)  

    class Meta:
        model = Ambiente
        fields = '__all__'

class HistoricoSerializer(serializers.ModelSerializer):
    ambiente = serializers.StringRelatedField()
    sensor = serializers.StringRelatedField()

    class Meta:
        model = Historico
        fields = '__all__'
