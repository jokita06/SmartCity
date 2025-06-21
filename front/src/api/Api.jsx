import axios from 'axios';

// Função para limpar tokens e redirecionar para login
const handleLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_cargo');
  localStorage.removeItem('user_id');
  window.location.href = '/login';
};

// Cria a instância base do axios com a URL da API
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Adiciona o token de acesso em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Tenta renovar o token se a resposta for 401 (não autorizado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verifica se é erro 401 e se ainda não tentou renovar
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        // Requisita um novo token de acesso
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken
        });

        // Salva o novo token e repete a requisição original
        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (error) {
        // Se não conseguir renovar, faz logout
        handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;