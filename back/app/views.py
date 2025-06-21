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
from datetime import datetime

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

    def get_queryset(self):
        queryset = super().get_queryset()  
        
        # Filtros 
        sensor = self.request.query_params.get('sensor')
        sig = self.request.query_params.get('sig')
        data = self.request.query_params.get('data')

        if sensor:
            # /historico/?sensor=temperatura
            queryset = queryset.filter(sensor__sensor__iexact=sensor)
        
        if sig:
            # /historico/?sig=20400001
            queryset = queryset.filter(ambiente__sig=sig)
        
        if data:
            try:
                # Converte a data "2023-05-15"
                data_obj = datetime.strptime(data, "%Y-%m-%d").date()
                
                # /historico/?data=2023-05-15
                queryset = queryset.filter(timestamp__date=data_obj)
            except ValueError:
                pass  # Ignora se a data for inválida 
        
        return queryset

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
                return Response({"error": "Nenhum arquivo enviado"}, status=400)
            
            results = {}
            
            for file_name, file_obj in request.FILES.items():
                try:
                    df = pd.read_excel(file_obj)
                    count = 0
                    
                    for _, row in df.iterrows():
                        # Converte o status para booleano de forma robusta
                        status_value = row['status']
                        
                        if isinstance(status_value, bool):
                            status_bool = status_value
                        else:
                            # Converte strings como 'ativo', 'inativo', 'true', 'false' 
                            status_str = str(status_value).strip().lower()
                            status_bool = status_str in ('ativo', 'true', 't', '1', 'sim', 'yes', 'y')
                        
                        Sensor.objects.create(
                            sensor=row['sensor'].strip().lower(),
                            mac_address=row['mac_address'],
                            unidade_med=row['unidade_medida'],
                            latitude=row['latitude'],
                            longitude=row['longitude'],
                            status=status_bool  # Valor já convertido
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
            return Response({"error": str(e)}, status=500)

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
                            sensor = Sensor.objects.get(pk=row['sensor'])
                            ambiente = Ambiente.objects.get(pk=row['ambiente'])
                            # Cria o histórico
                            Historico.objects.create(
                                ambiente=ambiente,
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
            })
            
            # Ordem que eu quero que apareça as informações
            df = df[['sensor', 'mac_address', 'unidade_medida', 
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

# Exportar histórico
class ExportarHistoricos(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            queryset = Historico.objects.all().values(
                'sensor__id',
                'ambiente__id',
                'valor',
                'timestamp'
            )

            df = pd.DataFrame.from_records(queryset)
            
            if not df.empty and 'timestamp' in df.columns:

                # Formata para dd/mm/yyyy hh:mm
                df['timestamp'] = df['timestamp'].dt.strftime('%d/%m/%Y %H:%M')
            
            df = df.rename(columns={
                'sensor__id': 'sensor',
                'ambiente__id': 'ambiente'
            })

            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Historicos', index=False)
            
            output.seek(0)
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename=historicos_exportados.xlsx'
            
            return response

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )