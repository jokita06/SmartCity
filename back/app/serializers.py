
from rest_framework import serializers
from .models import Usuario, Ambiente, Sensor, Historico
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Serializador para criação e visualização de usuários.
class UsuarioSerializer(serializers.ModelSerializer):

    # Define o campo 'telefone' como CharField com restrição de tamanho fixo
    telefone = serializers.CharField(
        max_length=14,
        min_length=14,
        help_text="Formato: (00)00000-0000"
    )

    class Meta:
        model = Usuario
        # Lista os campos que serão serializados
        fields = ['id', 'username', 'email', 'telefone', 'password']
        # Configura o campo 'password' para ser somente de escrita
        extra_kwargs = {
            'password': {'write_only': True}
        }

    # Validação customizada para o campo 'telefone'
    def validate_telefone(self, value):
        import re
        # Verifica se o valor corresponde ao padrão (00)00000-0000
        if not re.match(r'^\(\d{2}\)\d{5}-\d{4}$', value):
            # Se não corresponder, lança um erro de validação
            raise serializers.ValidationError("Formato inválido. Use: (00)00000-0000")
        # Retorna o valor validado se estiver correto
        return value

    # Método para criar uma nova instância de usuário
    def create(self, validated_data):
        # Cria o usuário usando o método create_user do modelo Usuario
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            telefone=validated_data['telefone'],
            email=validated_data['email'],
            password=validated_data['password'],
        )

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
        fields = ['ambiente', 'sensor', 'valor', 'timestamp']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['ambiente'] = f"{Ambiente.objects.get(id=representation['ambiente'])}"
        representation['sensor'] = f"{Sensor.objects.get(id=representation['sensor'])}"

        return representation