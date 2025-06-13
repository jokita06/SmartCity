from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LoginSerializer, AmbienteSerializer, SensorSerializer, HistoricoSerializer
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Ambiente, Sensor, Historico
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
import pandas as pd
from django.http import HttpResponse
from io import BytesIO

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
    
# Importar dados

# Importar sensores
class ImportarSensores(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            if not request.FILES:
                return Response(
                    {"error": "Nenhum arquivo enviado"}, 
                )
            
            results = {}
            
            for file_name, file_obj in request.FILES.items():
                try:
                    df = pd.read_excel(file_obj)
                    count = 0
                    
                    for _, row in df.iterrows():

                        sensor_value = row['sensor'].strip().lower()

                        Sensor.objects.create(
                            sensor=sensor_value,
                            mac_address=row['mac_address'],
                            unidade_med=row['unidade_medida'],
                            latitude=row['latitude'],
                            longitude=row['longitude'],
                            status=row['status'] if isinstance(row['status'], bool)
                                    else row['status'].lower() == 'ativo'
                        )
                        count += 1
                    
                    results[file_name] = {
                        "created": count,
                        "message": f"{count} sensores criados"
                    }
                
                except Exception as e:
                    results[file_name] = f"Erro: {str(e)}"
            
            return Response({
                "message": "Importação concluída",
                "results": results
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
            )

# Importar ambiente
class ImportarAmbientes(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if not request.FILES:
                return Response(
                    {'error': 'Nenhum arquivo enviado'}
                )
            
            results = {}

            for file_name, file_obj in request.FILES.items():
                try:
                    df = pd.read_excel(file_obj)  
                    count = 0
                    
                    for _, row in df.iterrows():   
                        
                        try:
                            Ambiente.objects.create(
                                sig=row['sig'],
                                descricao=row['descricao'],
                                ni=row['ni'],
                                responsavel=row['responsavel']
                            )
                            count += 1
                        except Exception as e:
                            errors += 1
                            continue
                    
                    results[file_name] = {
                        "created": count,
                        "message": f"{count} ambientes criados"
                    }
                
                except Exception as e:
                    results[file_name] = f"Erro ao processar arquivo: {str(e)}"
            
            return Response({
                "message": "Importação concluída",  
                "results": results
            })
        
        except Exception as e:
            return Response(
                {'error': str(e)},
            )

# Importar histórico
class ImportarHistoricos(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if not request.FILES:
                return Response(
                    {'error': 'Nenhum arquivo enviado'}
                )
            
            results = {}

            for file_name, file_obj in request.FILES.items():
                try:
                    df = pd.read_excel(file_obj)
                    count = 0
                    errors = 0
                    
                    for _, row in df.iterrows():
                        
                        try:
                            # Verifica se o sensor existe
                            sensor = Sensor.objects.get(pk=row['sensor_id'])
                            
                            # Cria o histórico
                            Historico.objects.create(
                                sensor=sensor,
                                valor=row['valor'],
                                timestamp=row['timestamp'] if pd.notna(row['timestamp']) else now()
                            )
                            count += 1
                        except Sensor.DoesNotExist:
                            errors += 1
                        except Exception as e:
                            errors += 1
                    
                    results[file_name] = {
                        "created": count,
                        "errors": errors,
                        "message": f"{count} históricos criados"
                    }
                
                except Exception as e:
                    results[file_name] = f"Erro ao processar arquivo: {str(e)}"
            
            return Response({
                "message": "Importação concluída",
                "results": results
            })
        
        except Exception as e:
            return Response(
                {'error': str(e)}
            )

# Exportar dados

# Exportar sensores
class ExportarSensores(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request): 
        try:
            
            # Informações que eu quero que seja exportado
            queryset = Sensor.objects.all().values(
                'id',
                'sensor',
                'mac_address',
                'unidade_med',
                'latitude',
                'longitude',
                'status'
            )
            
            df = pd.DataFrame.from_records(queryset)
            
            # Renomeando o nome das colunas
            df = df.rename(columns={
                'unidade_med': 'unidade_medida',
                'id': 'sensor_id'
            })
            
            # Ordem que eu quero que apareça as informações
            df = df[['sensor_id', 'sensor', 'mac_address', 'unidade_medida', 
                    'latitude', 'longitude', 'status']]
            
            # Criação do Arquivo Excel
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Sensores', index=False)
            
            # Configura a resposta HTTP
            output.seek(0)
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename=sensores_exportados.xlsx'
            
            return response
            
        except Exception as e:
            return Response(
                {'error': str(e)}
            )

# Exportar ambientes
class ExportarAmbientes(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            queryset = Ambiente.objects.all().values(
                'sig',
                'descricao',
                'ni',
                'responsavel'
            )

            df = pd.DataFrame.from_records(queryset)

            df = df[['sig', 'ni', 'descricao', 'responsavel']]

            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Ambientes', index=False)

            output.seek(0)
            response = HttpResponse (
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachement; filename=ambientes_exportados.xlsx'

            return response
        
        except Exception as e:
            return Response (
                {'error': str(e)}
            )