import React, { useState, useEffect } from 'react';
import { getTopicosByMateria, getTopicosByMateriaWithTotal, updateTopicoStatus } from '../services/api'; // Ajuste para usar o serviço correto
import Sidebar from '../components/SideBar';
import ItemList from '../components/ItemListSingleSelectTopic'; // Altere para o componente correto
import '../App.css';
import RodapeConfig from '../components/RodapeConfig';
import { FaClipboardList } from 'react-icons/fa';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { toast } from 'react-toastify';
import SkeletonTable from "../components/SkeletonTable";

const getStoredFilter = (key, defaultValue) => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
};

const SingleSelectTopic = () => {
    const [searchTerm, setSearchTerm] = useState(() => getStoredFilter("topicos_searchTerm", ''));
    const [sortOrder, setSortOrder] = useState(() => getStoredFilter("topicos_sortOrder", 'ASC'));
    const [sortField, setSortField] = useState(() => getStoredFilter("topicos_sortField", 'id'));
    const [statusFilter, setStatusFilter] = useState(() => getStoredFilter("topicos_statusFilter", null));
    const [currentPage, setCurrentPage] = useState(() => getStoredFilter("topicos_currentPage", 1));
    const [totalPages, setTotalPages] = useState(0);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
        const savedState = localStorage.getItem("sidebarExpanded");
        return savedState !== null ? JSON.parse(savedState) : true;
    });
    const [items, setItems] = useState([]); // Lista de tópicos
    const [totalItems, setTotalItems] = useState(0); // Total de tópicos disponíveis
    const [selectedItems, setSelectedItems] = useState(new Set()); // Seleções
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const materiaId = queryParams.get('id'); // Obtém o ID da matéria via query string
    const [pendingActive, setPendingActive] = useState(new Set()); // Tópicos que serão ativados
    const [pendingInactive, setPendingInactive] = useState(new Set()); // Tópicos que serão desativados
    const editalId = queryParams.get('editalId'); // Obtém o ID do edital
    const [totalSelected, setTotalSelected] = useState(0);
    const [role, setRole] = useState(null); // Armazena a role do usuário
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Configurações da matéria";
        const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
        setRole(storedRole);
    }, []);

    useEffect(() => {
        localStorage.setItem("topicos_searchTerm", JSON.stringify(searchTerm));
        localStorage.setItem("topicos_sortOrder", JSON.stringify(sortOrder));
        localStorage.setItem("topicos_sortField", JSON.stringify(sortField));
        localStorage.setItem("topicos_statusFilter", JSON.stringify(statusFilter));
        localStorage.setItem("topicos_currentPage", JSON.stringify(currentPage));
    }, [searchTerm, sortOrder, sortField, statusFilter, currentPage]);

    // Reseta os filtros ao fazer logout
    const resetFilters = () => {
        localStorage.removeItem("topicos_searchTerm");
        localStorage.removeItem("topicos_sortOrder");
        localStorage.removeItem("topicos_sortField");
        localStorage.removeItem("topicos_statusFilter");
        localStorage.removeItem("topicos_currentPage");

        // Atualiza os estados
        setSearchTerm('');
        setSortOrder('ASC');
        setSortField('id');
        setStatusFilter(null);
        setCurrentPage(1);
    };

    useEffect(() => {
        window.addEventListener("logoutEvent", resetFilters);
        return () => {
            window.removeEventListener("logoutEvent", resetFilters);
        };
    }, []);

    // Carrega os dados iniciais
    useEffect(() => {
        if (materiaId && editalId) {
            fetchAllData(currentPage, searchTerm, sortField, sortOrder, statusFilter);
        }
    }, [materiaId, editalId, currentPage, searchTerm, sortField, sortOrder, statusFilter]);

    useEffect(() => {
        // Atualiza o total de itens selecionados sempre que `selectedItems` mudar
        setTotalSelected(selectedItems.size);
    }, [selectedItems]);

    const fetchAllData = async (page, search, sort, order, status) => {
        setIsLoading(true); // Ativa o estado de loading
        try {
            const [topicosResponse, totalResponse] = await Promise.all([
                getTopicosByMateria(materiaId, page, 20, search, sort, order, status, editalId),
                getTopicosByMateriaWithTotal(materiaId, editalId)
            ]);

            const topicosData = topicosResponse.data;
            const totalData = totalResponse.data;

            setItems(topicosData.items || []);
            setCurrentPage(topicosData.currentPage);
            setTotalPages(topicosData.totalPages);
            setTotalItems(totalData.totalDisponiveis || 0);

            // Atualiza os itens selecionados com base nos dados recebidos do backend
            const activeItems = new Set(
                topicosData.items.filter((item) => item.status === 1).map((item) => item.id)
            );
            setSelectedItems(activeItems);
            setTotalSelected(activeItems.size); // Atualiza o total com base no backend
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setIsLoading(false); // Desativa o estado de loading
        }
    };


    const handlePageChange = (page) => setCurrentPage(page);

    const handleSortChange = (field, order) => {
        setSortField(field);
        setSortOrder(order);
    };

    const getSortOrderLabel = () => {
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

    const handleSelectItem = (id) => {
        setSelectedItems((prevSelected) => {
            const updated = new Set(prevSelected);
            const isSelected = updated.has(id);

            if (isSelected) {
                updated.delete(id);
                setPendingInactive((prev) => new Set([...prev, id]));
                setPendingActive((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            } else {
                updated.add(id);
                setPendingActive((prev) => new Set([...prev, id]));
                setPendingInactive((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            }

            return updated;
        });
    };

    const handleSelectAll = () => {
        setSelectedItems((prevSelected) => {
            const updated = new Set(prevSelected);
            const allSelected = items.every((item) => updated.has(item.id));

            if (allSelected) {
                items.forEach((item) => {
                    updated.delete(item.id);
                    setPendingInactive((prev) => new Set([...prev, item.id]));
                    setPendingActive((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(item.id);
                        return newSet;
                    });
                });
            } else {
                items.forEach((item) => {
                    updated.add(item.id);
                    setPendingActive((prev) => new Set([...prev, item.id]));
                    setPendingInactive((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(item.id);
                        return newSet;
                    });
                });
            }

            return updated;
        });
    };

    const handleSave = async () => {
        try {
            const activateIds = Array.from(pendingActive);
            const deactivateIds = Array.from(pendingInactive);

            // Verifica se há um editalId disponível no contexto
            if (!editalId) {
                toast.error('Erro: Nenhum edital selecionado.');
                return;
            }

            // Atualizar status dos tópicos no backend para o edital específico
            if (activateIds.length > 0) {
                await Promise.all(
                    activateIds.map((id) => updateTopicoStatus(id, 1, editalId))
                );
            }
            if (deactivateIds.length > 0) {
                await Promise.all(
                    deactivateIds.map((id) => updateTopicoStatus(id, 0, editalId))
                );
            }

            toast.success('Alterações salvas com sucesso!');
            setPendingActive(new Set());
            setPendingInactive(new Set());
            fetchAllData(currentPage, searchTerm, sortField, sortOrder, statusFilter); // Atualiza os dados
        } catch (error) {
            console.error('Erro ao salvar alterações:', error);
            toast.error('Erro ao salvar alterações.');
        }
    };


    const handleCancel = () => {
        // Limpa alterações pendentes e retorna para a página do edital
        setPendingActive(new Set());
        setPendingInactive(new Set());
        const basePath = role === 'admin' ? `/admin/editais/${editalId}` : `/editais/${editalId}`;
        navigate(basePath);
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
                        title="Tópicos Disponíveis"
                        addButtonText="Adicionar Tópico"
                        onAddButtonClick={() => {
                            const basePath = role === 'admin' ? `/admin/topicos/new?materiaId=${materiaId}` : `/topicos/new?materiaId=${materiaId}`;
                            navigate(basePath);
                        }}
                    />
                    {isLoading ? <SkeletonTable /> : <ItemList
                        items={items.map((item) => ({
                            ...item,
                            status: selectedItems.has(item.id) ? 1 : 0, // Usa os itens ativos corretos
                        }))}
                        selectedItems={selectedItems}
                        onSelectItem={handleSelectItem}
                        onSelectAll={handleSelectAll}
                    />}

                </div>
                <RodapeConfig
                    isSidebarExpanded={isSidebarExpanded}
                    title="Configurações da Matéria"
                    totalItems={totalItems}
                    selectedItems={totalSelected}  // Atualizado corretamente com a soma acumulativa
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default SingleSelectTopic;