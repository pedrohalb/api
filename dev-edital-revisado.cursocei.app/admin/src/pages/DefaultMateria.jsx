import React, { useState, useEffect } from 'react';
import { getMaterias } from '../services/api';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import ItemList from '../components/ItemListDefaultMateria';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import SkeletonTable from "../components/SkeletonTable";

const DefaultMateria = () => {
  const navigate = useNavigate();

  // Recupera os filtros do localStorage ou define os valores padrões
  const getStoredFilter = (key, defaultValue) => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  };

  const [materias, setMaterias] = useState([]);
  const [currentPage, setCurrentPage] = useState(getStoredFilter("materias_currentPage", 1));
  const [totalPages, setTotalPages] = useState(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(getStoredFilter("sidebarExpanded", true));
  const [searchTerm, setSearchTerm] = useState(getStoredFilter("materias_searchTerm", ''));
  const [sortOrder, setSortOrder] = useState(getStoredFilter("materias_sortOrder", 'ASC'));
  const [sortField, setSortField] = useState(getStoredFilter("materias_sortField", 'id'));
  const [statusFilter, setStatusFilter] = useState(getStoredFilter("materias_statusFilter", null)); // Filtro de status
  const [showDeleted, setShowDeleted] = useState(getStoredFilter("materias_showDeleted", false));
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para resetar os filtros ao fazer logout
  const resetFilters = () => {
    localStorage.removeItem("materias_currentPage");
    localStorage.removeItem("materias_searchTerm");
    localStorage.removeItem("materias_sortOrder");
    localStorage.removeItem("materias_sortField");
    localStorage.removeItem("materias_statusFilter");
    localStorage.removeItem("materias_showDeleted");

    // Resetar os estados no front-end
    setCurrentPage(1);
    setSearchTerm('');
    setSortOrder('ASC');
    setSortField('id');
    setStatusFilter(null);
    setShowDeleted(false);
  };

  useEffect(() => {
    document.title = "Matérias";
    const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
    setRole(storedRole);

    // Salva os filtros no localStorage sempre que forem alterados
    localStorage.setItem("materias_currentPage", JSON.stringify(currentPage));
    localStorage.setItem("materias_searchTerm", JSON.stringify(searchTerm));
    localStorage.setItem("materias_sortOrder", JSON.stringify(sortOrder));
    localStorage.setItem("materias_sortField", JSON.stringify(sortField));
    localStorage.setItem("materias_statusFilter", JSON.stringify(statusFilter));
    localStorage.setItem("materias_showDeleted", JSON.stringify(showDeleted));

    fetchMaterias(currentPage, searchTerm, sortField, sortOrder, statusFilter, showDeleted);
  }, [currentPage, searchTerm, sortField, sortOrder, statusFilter, showDeleted]);

  useEffect(() => {
    // Adiciona um ouvinte para resetar os filtros ao detectar logout
    window.addEventListener("logoutEvent", resetFilters);

    return () => {
      window.removeEventListener("logoutEvent", resetFilters);
    };
  }, []);

  const fetchMaterias = async (page, search, sort, order, status, deleted) => {
    setIsLoading(true); // Ativa o estado de loading
    try {
      const response = await getMaterias(page, 2, search, sort, order, status, deleted);
      setMaterias(response.data.items || []);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('Erro ao buscar matérias:', error);
    } finally {
      setIsLoading(false); // Desativa o estado de loading
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  const updateMateriasList = (updatedList) => {
    setMaterias(updatedList);
  };

  const getSortOrderLabel = () => {
    if (showDeleted) {
      return 'Excluídas';
    }
    if (statusFilter !== null) {
      return statusFilter === 1 ? 'Ativas' : 'Inativas';
    }
    if (sortField === 'nome') {
      return sortOrder === 'ASC' ? 'Ordem Alfabética (A-Z)' : 'Ordem Alfabética (Z-A)';
    }
    if (sortField === 'created_at') {
      return sortOrder === 'ASC' ? 'Mais Antigo' : 'Mais Recente';
    }
    return 'Selecionar Filtro';
  };

  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
    localStorage.setItem("sidebarExpanded", JSON.stringify(expanded));
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar onToggle={handleSidebarToggle} />
      <div
        className={`main-content ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
        style={{
          backgroundColor: '#f0f0f0',
          minHeight: '100vh',
          padding: '3rem',
          flexGrow: 1,
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Header
            searchTerm={searchTerm}
            setSearchTerm={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            sortOrder={sortOrder}
            setSortOrder={(order) => setSortOrder(order)}
            sortField={sortField}
            setSortField={(field) => setSortField(field)}
            statusFilter={statusFilter}
            setStatusFilter={(filter) => setStatusFilter(filter)}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            getSortOrderLabel={getSortOrderLabel}
            title="Todas as Matérias"
            addButtonText="Adicionar Matéria"
            onAddButtonClick={() => {
              const basePath = role === 'admin' ? '/admin/materias/new' : '/materias/new';
              navigate(basePath);
            }}
            showDeleted={showDeleted}
            setShowDeleted={setShowDeleted}
          />
          {isLoading ? <SkeletonTable /> : <ItemList
            materias={materias}
            onReload={updateMateriasList}
          />}
        </div>
      </div>
    </div>
  );
};

export default DefaultMateria;