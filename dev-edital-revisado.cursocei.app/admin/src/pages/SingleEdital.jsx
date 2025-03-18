import React, { useState, useEffect } from 'react';
import Sidebar from '../components/SideBar';
import HeaderSingle from '../components/HeaderSingle';
import ItemListSingleEdital from '../components/ItemListSingleEdital';
import '../App.css';
import RodapeConfig from '../components/RodapeConfig';
import ModalAdicionarMaterias from '../components/ModalAdicionarMaterias';
import { FaBoxOpen } from 'react-icons/fa';
import { getMaterias, updateEdital, addEdital, getEditalById, addMateriasToEdital, getMateriasByEditalId, removeMateriaFromEdital, getMateriasForModal } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SkeletonTable from "../components/SkeletonTable";

const SingleEdital = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
      const savedState = localStorage.getItem("sidebarExpanded");
      return savedState !== null ? JSON.parse(savedState) : true;
    });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materias, setMaterias] = useState([]);
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState(false);
  const { id } = useParams();
  const [materiasAssociadas, setMateriasAssociadas] = useState([]); // Matérias associadas ao edital
  const [materiasDisponiveis, setMateriasDisponiveis] = useState([]); // Matérias para o modal
  const [materiasTemp, setMateriasTemp] = useState([]);
  const [materiasToAdd, setMateriasToAdd] = useState([]); // Matérias adicionadas
  const [materiasToRemove, setMateriasToRemove] = useState([]); // Matérias removidas
  const [role, setRole] = useState(null); // Estado para armazenar a role do usuário
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Configurações do edital";
    const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
    setRole(storedRole);
    if (id) {
      fetchEditalData();
      fetchMateriasByEdital(currentPage); // Use o currentPage atual
    }
  }, [id]); // Remova currentPage do array de dependências


  const fetchEditalData = async () => {
    try {
      const { data } = await getEditalById(id); // Função para buscar o edital pelo ID
      setNome(data.nome);
      setStatus(data.status === 1); // Define o status como booleano
    } catch (error) {
      console.error('Erro ao buscar dados do edital:', error);
    }
  };
  
  const fetchMaterias = async () => {
  try {
    // Usa o novo método que retorna todas as matérias, incluindo as excluídas
    const response = await getMateriasForModal(1, 20, '', 'nome', 'ASC'); 
    setMateriasDisponiveis(response.data.items || []);
    
    // Debug para verificar se matérias excluídas estão vindo corretamente
    console.log("Matérias carregadas no modal:", response.data.items);
    
  } catch (error) {
    console.error('Erro ao buscar matérias para o modal:', error);
  }
};


const fetchMateriasByEdital = async (page = 1) => {
  setIsLoading(true); // Ativa o estado de loading
  try {
    // Definição de parâmetros padrão e validados
    const pageInt = parseInt(page, 10) || 1;
    const limit = 20;

    // Chamada da API sem os parâmetros desnecessários
    const response = await getMateriasByEditalId(id, pageInt, limit);

    if (response.data) {
      const fetchedMaterias = response.data.items || [];
      setMateriasAssociadas(fetchedMaterias);
      setMateriasTemp(fetchedMaterias);
      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
    } else {
      console.warn('Nenhuma matéria encontrada para este edital.');
      setMateriasAssociadas([]);
      setMateriasTemp([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  } catch (error) {
    console.error('Erro ao buscar matérias associadas ao edital:', error);
  } finally {
    setIsLoading(false); // Desativa o estado de loading
  }
};

  const handleAddClick = async () => {
    await fetchMaterias(); // Carregar matérias antes de abrir o modal
    setIsModalOpen(true);
  };

  const handleSaveMaterias = (selectedMaterias) => {
    const newMaterias = selectedMaterias.filter(
      (materia) => !materiasTemp.some((m) => m.id === materia.id)
    );
    setMateriasTemp([...materiasTemp, ...newMaterias]); // Atualiza o estado temporário
    setMateriasToAdd([...materiasToAdd, ...newMaterias]); // Adiciona às matérias pendentes de adição
    setIsModalOpen(false);
  };


  const handleRemoveMateria = (materiaId) => {
    setMateriasTemp((prev) => prev.filter((materia) => materia.id !== materiaId));
    setMateriasToRemove((prev) => [...prev, materiaId]); // Adiciona às matérias pendentes de remoção
  };



  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMateriasByEdital(page);
  };



  // Altera o status do edital
  const toggleEditalStatus = () => {
    setStatus((prevStatus) => !prevStatus);
  };

  // Salva as alterações do edital
const handleSave = async () => {
  try {
    let currentEditalId = id;

    // Criar novo edital se não houver ID
    if (!currentEditalId) {
      if (!nome) {
        toast.error('O nome do edital é obrigatório para criar um novo edital.');
        return;
      }

      const response = await addEdital({ nome, status: status ? 1 : 0 });
      const novoEdital = response.data;

      if (!novoEdital || !novoEdital.id) {
        toast.error('Erro ao criar o edital. Por favor, tente novamente.');
        return;
      }

      currentEditalId = novoEdital.id;
      // Armazenar mensagem de sucesso no localStorage
      localStorage.setItem('editaisSaved', `Edital criado com sucesso: ${novoEdital.nome}`);
      const basePath = role === 'admin' ? `/admin/editais/${currentEditalId}` : `/editais/${currentEditalId}`;
      navigate(basePath);
    } else {
      // Atualizar edital existente
      await updateEdital(currentEditalId, { nome, status: status ? 1 : 0 });
      // Armazenar mensagem de sucesso no localStorage
      localStorage.setItem('editaisSaved', 'Edital atualizado com sucesso!');
    }

    // Adicionar novas matérias
    if (materiasToAdd.length > 0) {
      const materiaIds = materiasToAdd.map((materia) => materia.id);
      await addMateriasToEdital(currentEditalId, materiaIds);
    }

    // Remover matérias
    if (materiasToRemove.length > 0) {
      for (const materiaId of materiasToRemove) {
        await removeMateriaFromEdital(currentEditalId, materiaId);
      }
    }

    window.location.reload();

  } catch (error) {
    console.error('Erro ao salvar alterações:', error);
    toast.error('Erro ao salvar alterações.');
  }
};


// No código que roda quando a página carrega, verifica se há uma mensagem de sucesso armazenada
useEffect(() => {
  const successMessage = localStorage.getItem('editaisSaved');
  
  if (successMessage) {
    toast.success(successMessage); // Exibe o toast de sucesso
    localStorage.removeItem('editaisSaved'); // Remove a mensagem de sucesso após exibir
  }
}, []);

  
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
          <HeaderSingle
            icon={<FaBoxOpen />}
            title="Materiais"
            barraPesquisa="Nome do Edital"
            currentPage={currentPage} // Página atual
            totalPages={totalPages} // Total de páginas
            handlePageChange={handlePageChange} // Função para mudar de página
            showIcon={true}
            onAddClick={handleAddClick}
            addButtonText="Adicionar"
            nome={nome}
            setNome={setNome}
            status={status}
            toggleStatus={toggleEditalStatus}
          />

        {isLoading && id ? (
          <SkeletonTable />
        ) : materiasTemp.length > 0 ? (
          <ItemListSingleEdital
            materias={materiasTemp} // Usa o estado temporário atualizado
            editalId={id}
            onReload={() => fetchMateriasByEdital(currentPage)} // Recarrega com a página atual
            onRemove={handleRemoveMateria}
            setMateriasTemp={setMateriasTemp}  // Passando a função de atualização do estado
            setMateriasAssociadas={setMateriasAssociadas}
          />
        ) : id ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#777" }}>
            Nenhuma matéria associada ao edital.
          </div>
        ) : null}

        </div>
        <RodapeConfig
          isSidebarExpanded={isSidebarExpanded}
          onSave={handleSave}
          onCancel={() => {
            const basePath = role === 'admin' ? '/admin/editais' : '/editais';
            navigate(basePath);
          }}
          title="Configurações do Edital"
        />

<ModalAdicionarMaterias
  key={isModalOpen ? "modal-open" : "modal-closed"} // Garante re-render quando abrir
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  associatedMaterias={materiasAssociadas.map((materia) => materia.id)} // Passando apenas os IDs
  onSave={handleSaveMaterias}
/>


      </div>
    </div>
  );
};

export default SingleEdital;
