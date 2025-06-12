from django.urls import path
from .views import (
    Login, Ambiente_GET_POST, Ambiente_GET_PUT_PATCH_DELETE, 
    Sensor_GET_POST, Sensor_GET_PUT_PATCH_DELETE, 
    Historico_GET_POST, Historico_GET_PUT_PATCH_DELETE
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Login e token
    path('login/', Login.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),

    # Ambientes
    path('ambientes/', Ambiente_GET_POST.as_view()),
    path('ambientes/<int:pk>/', Ambiente_GET_PUT_PATCH_DELETE.as_view()),

    # Sensores
    path('sensores/', Sensor_GET_POST.as_view(), name='sensor_list_create'),
    path('sensores/<int:pk>/', Sensor_GET_PUT_PATCH_DELETE.as_view()),

    # Histórico
    path('historico/', Historico_GET_POST.as_view()),
    path('historico/<int:pk>/', Historico_GET_PUT_PATCH_DELETE.as_view()),
]