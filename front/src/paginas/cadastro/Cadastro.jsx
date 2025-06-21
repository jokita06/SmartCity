import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/Api';
import { z } from "zod";
import '../login/Login.css'
import pessoa from '../../assets/cidade-pessoa.svg';
import { Link } from 'react-router-dom';

// Validação do formulário com Zod
const registerSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().regex(/^\(\d{2}\)\d{5}-\d{4}$/, 'Formato inválido. Use: (00)00000-0000'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

export function Cadastro() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Atualiza campos e aplica máscara no telefone
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 0) {
        formattedValue = formattedValue.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        formattedValue = 
          (formattedValue[1] ? '(' + formattedValue[1] : '') + 
          (formattedValue[2] ? ')' + formattedValue[2] : '') + 
          (formattedValue[3] ? '-' + formattedValue[3] : '');
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Envia dados, valida e trata erros
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      registerSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap = {};
        error.errors.forEach(err => {
          errorMap[err.path[0]] = err.message;
        });
        setErrors(errorMap);
        return;
      }
    }

    try {
      const { confirmPassword, ...userData } = formData;
      const response = await api.post('/registro/', userData);

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_id', response.data.usuario.user_id);
      localStorage.setItem('user_name', response.data.usuario.username);

      navigate('/sensores');
    } catch (error) {
      if (error.response) {
        const backendErrors = error.response.data;
        const errorMap = {};
        for (const key in backendErrors) {
          errorMap[key] = Array.isArray(backendErrors[key]) 
              ? backendErrors[key].join(' ') 
              : backendErrors[key];
        }
        setErrors(errorMap);
      } else {
        setErrors({ submit: 'Erro ao cadastrar. Tente novamente.' });
      }
    }
  };

  return (
    <main className="pagina-login">
      <form className='formulario-login' onSubmit={handleSubmit}>
        <h1 className='login-titulo'>Crie sua conta!</h1>
        
        {/* Campos do formulário com exibição de erros */}
        <div className="input-container">
          <input
            className={`login-input ${errors.username ? 'error' : ''}`}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        <div className="input-container">
          <input
            className={`login-input ${errors.email ? 'error' : ''}`}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="input-container">
          <input
            className={`login-input ${errors.telefone ? 'error' : ''}`}
            type="text"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="Telefone (00)00000-0000"
            maxLength={14}
          />
          {errors.telefone && <span className="error-message">{errors.telefone}</span>}
        </div>

        <div className="input-container">
          <input
            className={`login-input ${errors.password ? 'error' : ''}`}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Senha"
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="input-container">
          <input
            className={`login-input ${errors.confirmPassword ? 'error' : ''}`}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirme sua senha"
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        {errors.submit && <span className="mensagem-erro enviar-erro">{errors.submit}</span>}

        <button className="botao-logar" type="submit">Cadastrar</button>
        <p>Não tem conta? <Link to='/login' className='nav-link'>Entre!</Link></p>
      </form>

      <div className='login-imagem-container'>
        <img src={pessoa} alt="Pessoa em uma cidade" />
      </div>
    </main>
  );
}