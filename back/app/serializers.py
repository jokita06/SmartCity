
from rest_framework import serializers
from .models import Usuario, Ambiente, Sensor, Historico
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Serializador para criação e visualização de usuários.
class UsuarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # Criação de usuário com senha criptografada
        user = Usuario.objects.create_user(**validated_data)
        return user

# Serializador de login JWT.
class LoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        # Adiciona dados extras do usuário à resposta do token
        data['usuario'] = {
            'username': self.user.username,
            'email': self.user.email,
        }

        return data

# Serializador completo para sensores.
class SensorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Sensor
        fields = '__all__'

# Serializador completo para ambientes.
class AmbienteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ambiente
        fields = '__all__'

# Serializador dos registros históricos dos sensores.
class HistoricoSerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(format='%d/%m/%Y %H:%M')

    class Meta:
        model = Historico
        fields = '__all__'