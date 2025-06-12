from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LoginSerializer, AmbienteSerializer, SensorSerializer, HistoricoSerializer
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Ambiente, Sensor, Historico
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
import pandas as pd
from rest_framework import status

# Efetuar login
class Login(TokenObtainPairView):
    serializer_class = LoginSerializer

# Ambientes

# Listar e criar ambientes
class Ambiente_GET_POST(ListCreateAPIView):
    queryset = Ambiente.objects.all()
    serializer_class = AmbienteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        return serializer.save()

# Buscar por id, atualizar e deletar ambiente
class Ambiente_GET_PUT_PATCH_DELETE(RetrieveUpdateDestroyAPIView):
    queryset = Ambiente.objects.all()
    serializer_class = AmbienteSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    
    def perform_create(self, serializer):
        return serializer.save()

# Sensores

# Listar e criar sensores
class Sensor_GET_POST(ListCreateAPIView):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        return serializer.save()

# Buscar id, atualizer e deletar sensores
class Sensor_GET_PUT_PATCH_DELETE(RetrieveUpdateDestroyAPIView):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def perform_create(self, serializer):
        return serializer.save()

# Histórico

# Listar e criar histórico
class Historico_GET_POST(ListCreateAPIView):
    queryset = Historico.objects.all()
    serializer_class = HistoricoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        return serializer.save()

# Buscar por id, atualizar e deletar histórico
class Historico_GET_PUT_PATCH_DELETE(RetrieveUpdateDestroyAPIView):
    queryset = Historico.objects.all()
    serializer_class = HistoricoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def perform_create(self, serializer):
        return serializer.save()
    