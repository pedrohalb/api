import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_AUTH = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
});

export const loginUser = async (email, password) => {
  const response = await API_AUTH.post('/login', { email, password });

  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('role', response.data.role);
  }

  return response.data;
};

export const forgotPassword = (email) => API_AUTH.post('/forgot-password', { email });

export const resetPassword = (token, newPassword) => API_AUTH.post('/reset-password', { token, newPassword });

const API_PROTECTED = axios.create({
  baseURL: API_BASE_URL,
});

// Adiciona automaticamente o token nas requisições protegidas
API_PROTECTED.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚀 Interceptor para lidar com sessão expirada
API_PROTECTED.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      toast.error('Sua sessão expirou'); // Exibe erro no toast
      localStorage.removeItem('token'); // Remove o token do localStorage
      localStorage.removeItem('role'); // Remove a role também, se necessário
      sessionStorage.removeItem('token');
      window.location.href = '/login'; // Redireciona para a tela de login
    }
    return Promise.reject(error);
  }
);

export { API_PROTECTED };

const API_EDITAIS = axios.create({
  baseURL: `${API_BASE_URL}/editais`,
});

// Busca editais com filtros (incluindo opção de mostrar excluídos)
export const getEditais = (page = 1, limit = 5, search = '', sort = 'id', order = 'ASC', status = null, showDeleted = false) => {
  let query = `/?page=${page}&limit=${limit}&sort=${sort}&order=${order}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (status !== null) query += `&status=${status}`;
  if (showDeleted) query += `&showDeleted=true`; // Adiciona a opção de mostrar editais excluídos
  return API_EDITAIS.get(query);
};

// Busca matérias associadas a um edital
export const getMateriasByEditalId = (editalId, page = 1, limit = 10) => {
  // Garante que os valores estão corretos
  const pageInt = parseInt(page, 10) || 1;
  const limitInt = parseInt(limit, 10) || 10;

  return API_EDITAIS.get(`/${editalId}/materias?page=${pageInt}&limit=${limitInt}`);
};



// Busca um edital pelo ID
export const getEditalById = (id) => API_EDITAIS.get(`/${id}`);

// Adiciona um novo edital
export const addEdital = (data) => API_EDITAIS.post('/', data);

// Associa matérias a um edital
export const addMateriasToEdital = async (id, materias) => {
  try {
    const response = await API_EDITAIS.post(`/${id}/materias`, { materias });
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar matérias ao edital:', error);
    throw error;
  }
};

// Atualiza um edital
export const updateEdital = (id, data) => API_EDITAIS.patch(`/${id}`, data);

// Altera o status do edital (ativo/inativo)
export const toggleEditalStatus = (id, status) => API_EDITAIS.patch(`/${id}/status`, { status });

// Exclui (soft delete) um edital
export const softDeleteEdital = (id) => API_EDITAIS.patch(`/${id}/delete`);

// Restaura um edital excluído
export const restoreEdital = (id) => API_EDITAIS.patch(`/${id}/restore`);

// Remove permanentemente um edital (se necessário)
export const deleteEdital = (id) => API_EDITAIS.delete(`/${id}`);

// Remove uma matéria específica de um edital
export const removeMateriaFromEdital = (editalId, materiaId) => {
  return API_EDITAIS.delete(`/${editalId}/materias/${materiaId}`);
};


// Instância para 'materias'
const API_MATERIAS = axios.create({
  baseURL: `${API_BASE_URL}/materias`, // URL base para 'materias'
});

// Obtém matérias com filtros
export const getMaterias = (page = 1, limit = 5, search = '', sort = 'id', order = 'ASC', status = null, showDeleted = false) => {
  let query = `/?page=${page}&limit=${limit}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (sort) query += `&sort=${sort}`;
  if (order) query += `&order=${order}`;
  if (status !== null) query += `&status=${status}`;
  if (showDeleted) query += `&showDeleted=true`;
  return API_MATERIAS.get(query);
};

// Obtém todas as matérias para o modal
export const getMateriasForModal = (page = 1, limit = 5, search = '', sort = 'id', order = 'ASC') => {
  let query = `/?page=${page}&limit=${limit}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (sort) query += `&sort=${sort}`;
  if (order) query += `&order=${order}`;
  return API_MATERIAS.get(query);
};

// Busca uma matéria pelo ID
export const getMateriaById = (id) => {
  return API_MATERIAS.get(`/${id}`);
};

// Obtém tópicos relacionados à matéria e edital
export const getTopicosByMateria2 = (materiaId, editalId = null) => {
  let query = `/${materiaId}/topicos`;
  if (editalId) {
    query += `?editalId=${editalId}`;
  }
  return API_MATERIAS.get(query);
};

export const getEditaisByMateriaId = (materiaId) => API_MATERIAS.get(`/${materiaId}/editais`);


// Atualiza uma matéria
export const updateMateria = (id, data) => {
  return API_MATERIAS.patch(`/${id}`, data);
};

// Adiciona uma nova matéria
export const addMateria = (data) => API_MATERIAS.post('/', data);

// Altera o status de uma matéria
export const toggleMateriaStatus = (id, status) => API_MATERIAS.patch(`/${id}/status`, { status });

// Exclui (soft delete) uma matéria
export const softDeleteMateria = (id) => API_MATERIAS.delete(`/${id}`);

// Restaura uma matéria excluída
export const restoreMateria = (id) => API_MATERIAS.patch(`/${id}/restore`);


// Instância para 'topicos'
const API_TOPICOS = axios.create({
  baseURL: `${API_BASE_URL}/topicos`, // URL base para 'topicos'
});

export const getTopicos = (sort = 'id', order = 'ASC') => {
  return API_TOPICOS.get(`/?sort=${sort}&order=${order}`);
};

export const getTopicosByMateria = (materiaId, page = 1, limit = 5, search = '', sort = 'id', order = 'ASC', status = null, editalId = null) => {
  let query = `?page=${page}&limit=${limit}&sort=${sort}&order=${order}`;

  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (status !== null) query += `&status=${status}`;
  if (editalId !== null) query += `&editalId=${editalId}`;

  return API_TOPICOS.get(`/materia/${materiaId}${query}`);
};


export const getTopicosByMateriaWithTotal = (materiaId, editalId = null) => {
  let query = `/${materiaId}/topicos`;
  if (editalId) query += `?editalId=${editalId}`;

  return API_MATERIAS.get(query);
};

export const getTopicoById = (id) => {
  return API_TOPICOS.get(`/${id}`);
};

// Atualiza um tópico pelo ID
export const updateTopico = (id, data) => {
  return API_TOPICOS.patch(`/${id}`, data);
};

export const updateTopicoStatus = (id, status, editalId = null) => {
  const payload = editalId ? { status, editalId } : { status };
  return API_TOPICOS.patch(`/${id}/status`, payload);
};

export const addTopico = (data) => API_TOPICOS.post('/', data);
export const toggleTopicoStatus = (id, status) => API_TOPICOS.patch(`/${id}/status`, { status });
export const deleteTopico = (id) => API_TOPICOS.delete(`/${id}`);

// Instância para 'arquivos'
const API_ARQUIVOS = axios.create({
  baseURL: `${API_BASE_URL}/arquivos`, // URL base para 'arquivos'
});

export const updateArquivo = (id, data) =>
  API_ARQUIVOS.patch(`/${id}`, data);

export const getArquivos = (sort = 'id', order = 'ASC') => {
  return API_ARQUIVOS.get(`/?sort=${sort}&order=${order}`);
};

export const addArquivo = (formData) =>
  API_ARQUIVOS.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteArquivo = (id) => API_ARQUIVOS.delete(`/${id}`);