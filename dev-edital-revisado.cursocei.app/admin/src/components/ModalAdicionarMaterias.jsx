import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InputGroup, Form, Button, Spinner } from 'react-bootstrap';
import { getMateriasForModal } from '../services/api';
import '../App.css';

const ModalAdicionarMaterias = ({ isOpen, onClose, onSave, associatedMaterias = [] }) => {
  const [materias, setMaterias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedMaterias, setSelectedMaterias] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  useEffect(() => {
    if (isOpen) {
      resetMaterias();
    }
  }, [isOpen]);

  const resetMaterias = () => {
    setMaterias([]);
    setFilteredItems([]);
    setCurrentPage(1);
    setHasMore(true); // Garante que hasMore seja resetado corretamente
    setSelectedMaterias(associatedMaterias);

    setTimeout(() => {
      fetchMaterias(1, true); // Busca a primeira página após garantir reset completo
    }, 0);
  };

  useEffect(() => {
    const filtered = materias.filter((item) =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, materias]);

  useEffect(() => {
    console.log("Matérias carregadas no modal:", filteredItems);
  }, [filteredItems]);

  const fetchMaterias = async (page = 1, reset = false) => {
    if (isLoadingMore || !hasMore) return;

    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await getMateriasForModal(page, 4, '', 'id', 'ASC');
      const newItems = response.data.items || [];

      setMaterias((prev) => (reset ? newItems : [...prev, ...newItems]));
      setFilteredItems((prev) => (reset ? newItems : [...prev, ...newItems]));
      setHasMore(newItems.length > 0);
    } catch (error) {
      console.error('Erro ao buscar matérias:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const lastItemRef = useCallback((node) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage((prev) => {
          const nextPage = prev + 1;
          fetchMaterias(nextPage);
          return nextPage;
        });
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore]);

  const handleMateriaSelect = (materiaId) => {
    if (associatedMaterias.includes(materiaId)) return;
    setSelectedMaterias((prev) =>
      prev.includes(materiaId) ? prev.filter((id) => id !== materiaId) : [...prev, materiaId]
    );
  };

  const handleSave = () => {
    const selectedItems = materias.filter(
      (item) => selectedMaterias.includes(item.id) && !associatedMaterias.includes(item.id)
    );
    onSave(selectedItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      aria-hidden={!isOpen}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title">Adicionar Matéria</h2>
          <button className="close-button" onClick={onClose} aria-label="Fechar modal">
            &times;
          </button>
        </div>
        <div id="modal-description" className="modal-body">
          <InputGroup className="modal-search-bar mb-3">
            <InputGroup.Text className="search-icon">
              <i className="fas fa-search" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {isLoading ? (
            <div className="loading-spinner-container">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          ) : filteredItems.length > 0 ? (
            <ul className="materias-list">
              {filteredItems.map((item, index) => {
                const isInativa = item.status === 0;
                const isExcluida = item.deleted_at !== null;
                return (
                  <li
                    key={item.id}
                    ref={index === filteredItems.length - 1 ? lastItemRef : null}
                    className={`materia-item 
                      ${selectedMaterias.includes(item.id) ? 'selected' : ''} 
                      ${associatedMaterias.includes(item.id) ? 'associated' : ''} 
                      ${isInativa || isExcluida ? 'disabled' : ''}`}
                    onClick={() => !(isInativa || isExcluida) && handleMateriaSelect(item.id)}
                  >
                    <div className="materia-info">
                      <span className="materia-icon">
                        <i className={`fas ${selectedMaterias.includes(item.id) ? 'fa-check-circle' : 'fa-circle'}`} />
                      </span>
                      <span className="materia-nome">{item.nome}</span>
                      {isExcluida && <span className="label-excluida">Excluída</span>}
                      {isInativa && !isExcluida && <span className="label-inativa">Inativa</span>}
                    </div>
                    <span className="materia-topicos">{item.numero_topicos} Tópicos</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="no-items-message">Nenhuma matéria encontrada.</p>
          )}

          {isLoadingMore && (
            <div className="loading-spinner-container">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando mais matérias...</span>
              </Spinner>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button className="cancel-button" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="save-button" onClick={handleSave} disabled={selectedMaterias.length === 0}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalAdicionarMaterias;
