import React, { useState, useEffect } from 'react';
import { addArquivo, getTopicoById, getMaterias, getMateriaById, updateTopico, addTopico, updateArquivo, deleteArquivo } from '../services/api';
import Sidebar from '../components/SideBar';
import HeaderSingle from '../components/HeaderSingleTopic';
import FileRepeater from '../components/FileRepeater';
import RodapeConfig from '../components/RodapeConfig';
import '../App.css';
import { data, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FaClipboardList } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SingleTopic = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
      const savedState = localStorage.getItem("sidebarExpanded");
      return savedState !== null ? JSON.parse(savedState) : true;
    });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materias, setMaterias] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState(false);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const materiaId = searchParams.get('materiaId'); // Obtém o ID da matéria
  const { id } = useParams();
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [isMateriaLoading, setIsMateriaLoading] = useState(false); // Novo estado
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    document.title = "Configurações do tópico";
    // Obtém a role do usuário (admin ou user)
    const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
    setRole(storedRole);
    const loadData = async () => {
      if (id) {
        await fetchTopicoEArquivosData(id);
      }
      if (materiaId) {
        await fetchMateriaData(materiaId);
      }
      await fetchMaterias();
    };

    loadData();
  }, [id, materiaId]);


  const fetchTopicoEArquivosData = async (topicoId) => {
    try {
      const { data } = await getTopicoById(topicoId);
      const topicoData = data.find((topico) => topico.id === parseInt(topicoId));

      if (!topicoData) {
        toast.error('Erro ao carregar os dados do tópico.');
        return;
      }

      setNome(topicoData.nome);
      setStatus(topicoData.status === 1);
      setSelectedMateria({ id: topicoData.materia_id, nome: topicoData.materia_nome });

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/arquivos?topico_id=${topicoId}`);
      const arquivos = await response.json();

      setFileList(arquivos.map((arquivo) => ({
        id: arquivo.id,
        name: arquivo.nome || '',
        file: arquivo.caminho ? { name: arquivo.nome, path: arquivo.caminho, size: arquivo.size } : null,
      })));
    } catch (error) {
      toast.error('Erro ao carregar os dados do tópico e dos arquivos.');
    }
  };



  const fetchMateriaData = async (materiaId) => {
    setIsMateriaLoading(true); // Inicia o carregamento
    try {
      const { data } = await getMateriaById(materiaId);
      setSelectedMateria(data);
    } catch (error) {
      console.error('Erro ao buscar matéria:', error);
    } finally {
      setIsMateriaLoading(false); // Finaliza o carregamento
    }
  };

  const fetchMaterias = async () => {
    try {
      const { data } = await getMaterias(); // Chama a API para buscar matérias
      setMaterias(data.materias || []); // Certifique-se de acessar o array de matérias corretamente
    } catch (error) {
      console.error('Erro ao buscar matérias:', error);
    }
  };

  const fetchMateriaDataFromTopico = async (topicoId) => {
    setIsMateriaLoading(true); // Inicia o carregamento
    try {
      const { data } = await getTopicoById(topicoId); // API para buscar o tópico
      const materiaData = {
        id: data.materia_id,
        nome: data.materia_nome,
      };
      setSelectedMateria(materiaData);
    } catch (error) {
      console.error('Erro ao buscar a matéria do tópico:', error);
    } finally {
      setIsMateriaLoading(false); // Finaliza o carregamento
    }
  };


  const handlePageChange = (page) => setCurrentPage(page);

  const getSortOrderLabel = () => {
    switch (sortOrder) {
      case 'asc':
        return 'Ordem Alfabética (A-Z)';
      case 'desc':
        return 'Ordem Alfabética (Z-A)';
      default:
        return 'Selecionar Filtro';
    }
  };

  const handleAddRepeater = () => {
    setFileList([...fileList, { name: '', file: null }]);
  };

  const handleFileChange = (newFileList) => {
    setFileList(newFileList);
  };

  const handleFileMarkedForDeletion = (fileId) => {
    setFilesToDelete((prevFilesToDelete) => [...prevFilesToDelete, fileId]);
  };

  const processFiles = async (currentTopicoId) => {
    try {
      // Excluir arquivos
      for (const fileId of filesToDelete) {
        await deleteArquivo(fileId);
      }

      // Upload de novos arquivos
      const novosArquivos = fileList.filter((file) => !file.id);
      if (novosArquivos.length > 0) {
        const formData = new FormData();
        formData.append('topico_id', String(currentTopicoId));
        novosArquivos.forEach((file) => {
          formData.append('arquivos', file.file);
          formData.append('nomes', file.name);
        });
        await addArquivo(formData);
      }

      // Atualizar arquivos existentes
      const arquivosAtualizados = fileList.filter(
        (file) => file.id && file.name !== file.file?.name
      );
      for (const file of arquivosAtualizados) {
        await updateArquivo(file.id, { nome: file.name });
      }
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      throw error; // Repassa o erro para ser tratado em handleSave
    }
  };

  const handleSave = async () => {
  try {
    let currentTopicoId = id;

    if (!nome.trim()) {
      toast.error('O nome do tópico é obrigatório.');
      return;
    }

    if (!selectedMateria) {
      toast.error('Selecione uma matéria antes de salvar.');
      return;
    }

    if (!currentTopicoId) {
      const response = await addTopico({
        nome,
        materia_id: selectedMateria.id,
        status: status ? 1 : 0,
      });

      const novoTopico = response.data?.topico;
      if (!novoTopico?.id) {
        toast.error('Erro ao criar tópico: ID não retornado.');
        return;
      }

      currentTopicoId = novoTopico.id;
      const basePath = role === 'admin' ? `/admin/topicos/${currentTopicoId}` : `/topicos/${currentTopicoId}`;
      navigate(`${basePath}?materiaId=${materiaId}`);
    } else {
      await updateTopico(currentTopicoId, {
        nome,
        materia_id: selectedMateria.id,
        status: status ? 1 : 0,
      });
    }

    await processFiles(currentTopicoId);

    // Buscar novamente os arquivos atualizados após salvar
    await fetchTopicoEArquivosData(currentTopicoId);

    // Armazena a mensagem de sucesso no localStorage antes de recarregar a página
    localStorage.setItem('topicoSaved', 'Alterações salvas com sucesso!');
    
    // Reinicia a página
    window.location.reload();
    
  } catch (error) {
    console.error('Erro ao salvar tópico:', error);
    toast.error('Erro ao salvar tópico.');
  }
};

// No código que roda quando a página carrega, verifica se há uma mensagem de sucesso armazenada
useEffect(() => {
  const successMessage = localStorage.getItem('topicoSaved');
  
  if (successMessage) {
    toast.success(successMessage); // Exibe o toast de sucesso
    localStorage.removeItem('topicoSaved'); // Remove a mensagem de sucesso após exibir
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
            icon={<FaClipboardList />}
            barraPesquisa="Nome do Tópico"
            title="Arquivos"
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            showIcon={true} /* Exibe o ícone apenas aqui */
            materias={materias}
            selectedMateria={isMateriaLoading ? { nome: "Carregando..." } : selectedMateria}
            onMateriaChange={setSelectedMateria}
            status={status}
            onStatusChange={setStatus}
            nome={nome}
            onNomeChange={setNome}
            onAddClick={handleAddRepeater}
          />
          <FileRepeater
            fileList={fileList}
            onFileListChange={handleFileChange}
            onFileMarkedForDeletion={handleFileMarkedForDeletion}
          />
          {/*}
          <ItemListSingleMateria items={items} />
          */}
        </div>
        <RodapeConfig
          title="Configurações do Tópico"
          onSave={handleSave} // Chama a função de salvar tópico
          onCancel={() => {
            const basePath = role === 'admin' ? `/admin/materias/${materiaId}` : `/materias/${materiaId}`;
            navigate(basePath);
          }}

          isSidebarExpanded={isSidebarExpanded}
        />
      </div>
    </div>
  );
};

export default SingleTopic;