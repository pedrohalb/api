import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (!token) return false;

  try {
    const decoded = JSON.parse(atob(token.split('.')[1])); // Decodifica o token JWT
    const exp = decoded.exp * 1000; // Converte a expiração para milissegundos

    if (Date.now() >= exp) {
      // Se o token expirou, remove do armazenamento e retorna falso
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    return false;
  }
};

const PrivateRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Sua sessão expirou');
      navigate('/login', { replace: true });
    }
  }, [location, navigate]); // Dispara a verificação ao mudar de rota

  return isAuthenticated() ? <Outlet /> : null;
};

export default PrivateRoute;
