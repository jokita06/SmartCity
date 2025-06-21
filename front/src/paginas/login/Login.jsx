import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/Api';
import { z } from "zod";
import './Login.css';
import pessoa from '../../assets/cidade-pessoa.svg'
import { Link } from 'react-router-dom';

const schemaResolver = z.object({
  username: z.string().min(1, 'Informe o username'),
  password: z.string().min(1, 'Informe a senha')
});

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação simples com Zod
    try {
      schemaResolver.parse({ username, password });
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
      // Requisição de login
      const response = await api.post('/login/', { username, password });

      // Armazena tokens e dados do usuário
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_id', response.data.usuario.user_id);
      localStorage.setItem('user_name', response.data.usuario.username);

      navigate('/sensores');

    } catch (error) {
      setErrors({ submit: 'Credenciais inválidas. Tente novamente.' });
    }
  };

  return (
    <main className="pagina-login">
      <form className='formulario-login' onSubmit={handleSubmit}>
        <h1 className='login-titulo'>Bem vindo de volta!</h1>

        {/* Usuário */}
        <div className="input-container">
          <input
            className={`login-input ${errors.username ? 'error' : ''}`}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuário"
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        {/* Senha */}
        <div className="input-container">
          <input
            className={`login-input ${errors.password ? 'error' : ''}`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        {errors.submit && <span className="mensagem-erro enviar-erro">{errors.submit}</span>}

        <button className="botao-logar" type="submit">Entrar</button>
        <p>Não tem conta? <Link to='/cadastro' className='nav-link'>Cadastre-se!</Link></p>
      </form>

      <div className='login-imagem-container'>
        <img src={pessoa} alt="Pessoa em uma cidade" />
      </div>
    </main>
  );
}