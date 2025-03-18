import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importa os estilos do toastify

import DefaultEdital from './pages/DefaultEdital';
import SingleEdital from './pages/SingleEdital';
import Config from './pages/Config';
import DefaultMateria from './pages/DefaultMateria';
import SingleMateria from './pages/SingleMateria';
import SingleTopic from './pages/SingleTopic';
import SingleSelectTopic from './pages/SingleSelectTopic';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './routes/PrivateRoute';
import RecPage from './pages/RecPage';
import RedPage from './pages/RedPage';

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <Routes>
        {/* Rota pública para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperacao-senha" element={<RecPage />} />
        <Route path="/redefinicao-senha" element={<RedPage />} />

        {/* Rotas protegidas dentro do PrivateRoute */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin/editais" element={<DefaultEdital />} />
          <Route path="/admin/editais/new" element={<SingleEdital />} />
          <Route path="/admin/editais/:id" element={<SingleEdital />} />
          <Route path="/admin/config" element={<Config />} />

          {/* Materias */}
          <Route path="/admin/materias" element={<DefaultMateria />} />
          <Route path="/admin/materias/new" element={<SingleMateria />} />
          <Route path="/admin/materias/:id" element={<SingleMateria />} />

          {/* Tópicos */}
          <Route path="/admin/topicos/new" element={<SingleTopic />} />
          <Route path="/admin/topicos/:id" element={<SingleTopic />} />

          {/* Seleção de Tópicos */}
          <Route path="/admin/selecao-singular-topico" element={<SingleSelectTopic />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;