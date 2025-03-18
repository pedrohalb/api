import React, { useState, useEffect } from 'react';
import { getTopicosByMateria, getMateriaById, updateMateria, addMateria } from '../services/api'; // Ajuste os serviços
import Sidebar from '../components/SideBar';
import HeaderSingle from '../components/HeaderSingle';
import ItemListSingleMateria from '../components/ItemListSingleMateria';
import '../App.css';
import RodapeConfig from '../components/RodapeConfig';
import { FaClipboardList } from 'react-icons/fa';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SkeletonTable from "../components/SkeletonTable";

const SingleMateria = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
      const savedState = localStorage.getItem("sidebarExpanded");
      return savedState !== null ? JSON.parse(savedState) : true;
    });
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState(false);
  const [topicos, setTopicos] = useState([]);
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editalId = queryParams.get('editalId'); // Obtém o ID do edital
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // Estado para armazenar a role do usuário
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Configurações da matéria";
    const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
    setRole(storedRole);
  }, []);

  // Carrega os dados da matéria e tópicos relacionados
  useEffect(() => {
    if (id) {
      fetchMateriaData();
      fetchTopicos(currentPage);
    }
  }, [id, currentPage]); // Certifique-se de que o array contém ambas dependências


  // Busca os tópicos relacionados à matéria
  const fetchTopicos = async (page, search, sort, order, status, editalId = null) => {
    setIsLoading(true); // Ativa o estado de loading
    try {
      const { data } = await getTopicosByMateria(id, page, 20, search, sort, order, status, editalId);
      setTopicos(data.items || []);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
  } finally {
    setIsLoading(false); // Desativa o estado de loading
  }
  };


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Busca os dados da matéria
  const fetchMateriaData = async () => {
    try {
      const { data } = await getMateriaById(id); // Função para buscar a matéria pelo ID
      setNome(data.nome);
      setStatus(data.status === 1); // Define o status como booleano
    } catch (error) {
      console.error('Erro ao buscar dados da matéria:', error);
    }
  };

  // Altera o status da matéria
  const toggleMateriaStatus = () => {
    setStatus((prevStatus) => !prevStatus);
  };


  // Salva as alterações da matéria
  const handleSave = async () => {
    try {
      let currentMateriaId = id;

      if (!currentMateriaId) {
        // Criação
        const response = await addMateria({ nome, status: status ? 1 : 0 });
        const novaMateria = response.data;

        if (!novaMateria || !novaMateria.id) {
          toast.error('Erro ao criar a matéria. Por favor, tente novamente.');
          return;
        }

        currentMateriaId = novaMateria.id;
        toast.success(`Matéria criada com sucesso: ${novaMateria.nome}`);
        const basePath = role === 'admin' ? `/admin/materias/${currentMateriaId}` : `/materias/${currentMateriaId}`;
        navigate(basePath);
      } else {
        // Atualização
        await updateMateria(currentMateriaId, { nome, status: status ? 1 : 0 });
        toast.success('Matéria atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar matéria:', error);
      toast.error('Erro ao salvar matéria.');
    }
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
          <HeaderSingle
            icon={<FaClipboardList />}
            barraPesquisa="Nome da Matéria"
            title="Tópicos"
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            onAddClick={() => {
              const basePath = role === 'admin' ? `/admin/topicos/new?materiaId=${id}` : `/topicos/new?materiaId=${id}`;
              navigate(basePath);
            }}
            nome={nome}
            setNome={setNome}
            status={status}
            toggleStatus={toggleMateriaStatus}
          />
          
        {isLoading && id ? (
          <SkeletonTable />
        ) : topicos.length > 0 ? (
          <ItemListSingleMateria items={topicos} materiaId={id} />
        ) : id ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#777" }}>
            Nenhum tópico associado à matéria.
          </div>
        ) : null}

        </div>
        <RodapeConfig
          title="Configurações da Matéria"
          onSave={handleSave}
          onCancel={() => {
            const basePath = role === 'admin' ? `/admin/materias` : `/materias`;
            navigate(basePath);
          }}
          isSidebarExpanded={isSidebarExpanded}
        />
      </div>
    </div>
  );
};

export default SingleMateria;