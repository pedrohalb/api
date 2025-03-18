import React, { useState, useEffect } from 'react';
import { getEditais } from '../services/api';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import ItemList from '../components/ItemListDefaultEdital';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import SkeletonTable from "../components/SkeletonTable";

// Função para recuperar filtros do localStorage ou definir padrão
const getStoredFilter = (key, defaultValue) => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
};

const DefaultEdital = () => {
    const navigate = useNavigate();

    // Estados com persistência
    const [editais, setEditais] = useState([]);
    const [currentPage, setCurrentPage] = useState(() => getStoredFilter("editais_currentPage", 1));
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState(() => getStoredFilter("editais_searchTerm", ''));
    const [sortOrder, setSortOrder] = useState(() => getStoredFilter("editais_sortOrder", 'ASC'));
    const [sortField, setSortField] = useState(() => getStoredFilter("editais_sortField", 'id'));
    const [statusFilter, setStatusFilter] = useState(() => getStoredFilter("editais_statusFilter", null));
    const [showDeleted, setShowDeleted] = useState(() => getStoredFilter("editais_showDeleted", false));
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(getStoredFilter("sidebarExpanded", true));
    const [role, setRole] = useState(null); // Estado para armazenar a role do usuário

    // 🚀 **NOVO:** Resetar estado dos filtros ao carregar a página, se o localStorage estiver vazio
    useEffect(() => {
        if (!localStorage.getItem("editais_currentPage")) {
            console.log("Nenhum filtro salvo, resetando estado...");
            setCurrentPage(1);
            setSearchTerm('');
            setSortOrder('ASC');
            setSortField('id');
            setStatusFilter(null);
            setShowDeleted(false);
        }
    }, []);

    // Escuta o evento de logout para resetar os filtros
    useEffect(() => {
        const resetFilters = () => {
            console.log("Resetando filtros ao detectar logout...");
            setCurrentPage(1);
            setSearchTerm('');
            setSortOrder('ASC');
            setSortField('id');
            setStatusFilter(null);
            setShowDeleted(false);
        };

        window.addEventListener("logoutEvent", resetFilters);

        return () => {
            window.removeEventListener("logoutEvent", resetFilters);
        };
    }, []);

    // Salvar filtros no localStorage sempre que forem alterados
    useEffect(() => {
        localStorage.setItem("editais_currentPage", JSON.stringify(currentPage));
        localStorage.setItem("editais_searchTerm", JSON.stringify(searchTerm));
        localStorage.setItem("editais_sortOrder", JSON.stringify(sortOrder));
        localStorage.setItem("editais_sortField", JSON.stringify(sortField));
        localStorage.setItem("editais_statusFilter", JSON.stringify(statusFilter));
        localStorage.setItem("editais_showDeleted", JSON.stringify(showDeleted));
    }, [currentPage, searchTerm, sortOrder, sortField, statusFilter, showDeleted]);

    useEffect(() => {
        document.title = "Editais";
        const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
        setRole(storedRole);

        // Salva os filtros no localStorage sempre que forem alterados
        localStorage.setItem("currentPage", JSON.stringify(currentPage));
        localStorage.setItem("searchTerm", JSON.stringify(searchTerm));
        localStorage.setItem("sortOrder", JSON.stringify(sortOrder));
        localStorage.setItem("sortField", JSON.stringify(sortField));
        localStorage.setItem("statusFilter", JSON.stringify(statusFilter));
        localStorage.setItem("showDeleted", JSON.stringify(showDeleted));

        fetchEditais(currentPage, searchTerm, sortField, sortOrder, statusFilter, showDeleted);
    }, [currentPage, searchTerm, sortField, sortOrder, statusFilter, showDeleted]);

    const fetchEditais = async (page, search, sort, order, status, deleted) => {
        setIsLoading(true); // Ativa o estado de loading
        try {
            const response = await getEditais(page, 2, search, sort, order, status, deleted);
            setEditais(response.data.items || []);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (error) {
            console.error('Erro ao buscar editais:', error);
        } finally {
            setIsLoading(false); // Desativa o estado de loading
        }
    };

    // Atualiza a lista local sem perder o filtro de status (não excluídos)
    const updateEditaisList = (updatedList) => {
        setEditais(updatedList);
    };

    const handlePageChange = (page) => setCurrentPage(page);

    const handleSortChange = (field, order) => {
        setSortField(field);
        setSortOrder(order);
    };

    const getSortOrderLabel = () => {
        if (showDeleted) {
            return 'Excluídos';
        }
        if (statusFilter !== null) {
            return statusFilter === 1 ? 'Ativos' : 'Inativos';
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
                        title="Todos os Editais"
                        addButtonText="Adicionar Edital"
                        onAddButtonClick={() => {
                            const basePath = role === 'admin' ? '/admin/editais/new' : '/editais/new';
                            navigate(basePath);
                        }}
                        showDeleted={showDeleted}
                        setShowDeleted={setShowDeleted}
                    />

                    {/* Exibe Skeleton Table enquanto os dados estão carregando */}
                    {isLoading ? <SkeletonTable /> : <ItemList editais={editais} onReload={updateEditaisList} />}
                </div>
            </div>
        </div>
    );
};

export default DefaultEdital;