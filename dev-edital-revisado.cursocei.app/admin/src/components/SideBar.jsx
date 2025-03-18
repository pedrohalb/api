import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import { toast } from 'react-toastify';

const Sidebar = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = localStorage.getItem("sidebarExpanded");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
    setRole(storedRole);
  }, []);

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("sidebarExpanded", JSON.stringify(newState));

    if (onToggle) {
      onToggle(newState);
    }
  };

  const handleNavigate = (path) => {
    if (!role) return; // Garante que `role` foi carregado antes de navegar

    const basePath = role === 'admin' ? `/admin${path}` : path;

    console.log(`Tentando navegar para: ${basePath}`);

    // Força a navegação dentro de um `setTimeout()` para evitar bloqueios
    setTimeout(() => {
      if (location.pathname !== basePath) {
        console.log(`Navegando para: ${basePath}`);
        navigate(basePath);
      } else {
        console.log(`Recarregando página: ${basePath}`);
        navigate(basePath, { replace: true });
      }
    }, 100);
  };

  const isActive = (paths) => {
    const currentPath = location.pathname;
    return paths.some((path) => {
      const fullPath = role === 'admin' ? `/admin${path}` : path;
      if (fullPath.includes(':')) {
        const regex = new RegExp(fullPath.replace(/:\w+/g, '\\w+'));
        return regex.test(currentPath);
      }
      return currentPath === fullPath;
    });
  };

  const resetFilters = () => {
    console.log("Resetando filtros...");
    
    localStorage.removeItem("materias_currentPage");
    localStorage.removeItem("materias_searchTerm");
    localStorage.removeItem("materias_sortOrder");
    localStorage.removeItem("materias_sortField");
    localStorage.removeItem("materias_statusFilter");
    localStorage.removeItem("materias_showDeleted");

    localStorage.removeItem("editais_currentPage");
    localStorage.removeItem("editais_searchTerm");
    localStorage.removeItem("editais_sortOrder");
    localStorage.removeItem("editais_sortField");
    localStorage.removeItem("editais_statusFilter");
    localStorage.removeItem("editais_showDeleted");

    localStorage.removeItem("topicos_currentPage");
    localStorage.removeItem("topicos_searchTerm");
    localStorage.removeItem("topicos_sortOrder");
    localStorage.removeItem("topicos_sortField");
    localStorage.removeItem("topicos_statusFilter");

    window.dispatchEvent(new Event("logoutEvent"));
  };

  const handleLogout = () => {
    console.log('Realizando logout...');
    resetFilters();

    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('role');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');
    localStorage.removeItem('rememberMe');

    toast.success('Sessão finalizada com sucesso!');

    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className={`toggle-button ${!isExpanded ? 'active' : ''}`}
        onClick={toggleSidebar}
      >
        <i className="fas fa-bars" />
        {isExpanded && (
          <img 
            src={`${process.env.PUBLIC_URL}/images/logo-transparent.png`} 
            alt="Logo" 
            className="sidebar-logo"
          />
        )}
      </button>
      <div className="menu">
        <button
          className={`menu-item ${isActive(['/editais', '/editais/new', '/editais/:id', '/selecao-singular-topico']) ? 'active' : ''}`}
          onClick={() => handleNavigate('/editais')}
        >
          <i className="fas fa-th-large" />
          {isExpanded && <span>Editais</span>}
        </button>
        <button
          className={`menu-item ${isActive(['/materias', '/materias/new', '/materias/:id', '/topicos/new', '/topicos/:id']) ? 'active' : ''}`}
          onClick={() => handleNavigate('/materias')}
        >
          <i className="fas fa-layer-group" />
          {isExpanded && <span>Matérias</span>}
        </button>
        <button
          className={`menu-item ${isActive(['/config']) ? 'active' : ''}`}
          onClick={() => handleNavigate('/config')}
        >
          <i className="fas fa-cog" />
          {isExpanded && <span>Configurações</span>}
        </button>
      </div>

      <button className="menu-item logout-button" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt" />
        {isExpanded && <span>Sair</span>}
      </button>
    </div>
  );
};

export default Sidebar;