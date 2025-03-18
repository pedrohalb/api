import React, { useState } from 'react';
import { InputGroup, Form, DropdownButton, Dropdown, Button } from 'react-bootstrap';
import PaginationControl from './PaginationControl';
import '../App.css';

const Header = ({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  getSortOrderLabel,
  currentPage,
  totalPages,
  handlePageChange,
  title = 'Todos os Itens',
  addButtonText = 'Adicionar Item',
  onAddButtonClick,
  statusFilter,
  setStatusFilter,
  setSortField,
  showDeleted = false,
  setShowDeleted = null,
}) => {
  const [isChangingPage, setIsChangingPage] = useState(false);

  // Função segura para evitar cliques repetidos rápidos na paginação
  const safePageChange = (newPage) => {
    if (!isChangingPage && newPage !== currentPage) {
      setIsChangingPage(true);
      handlePageChange(newPage);

      // Tempo de espera antes de permitir outro clique (ajustável)
      setTimeout(() => {
        setIsChangingPage(false);
      }, 300);
    }
  };

  return (
    <div className="header d-flex justify-content-between align-items-center px-3">
      <h1 className="header-title mb-0">
        <i className="fas fa-list header-icon me-2" />
        {title}
      </h1>

      <div className="header-controls d-flex align-items-center gap-3">
        <InputGroup className="search-bar">
          <InputGroup.Text className="search-icon">
            <i className="fas fa-search" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              safePageChange(1); // Redefine para primeira página ao pesquisar
            }}
          />
        </InputGroup>

        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={safePageChange}
          isDisabled={isChangingPage} // Passa o estado para desabilitar os botões
        />

        <DropdownButton
          id="dropdown-basic-button"
          title={getSortOrderLabel()}
          variant="outline-secondary"
          onSelect={(eventKey) => {
            if (eventKey === 'deleted') {
              setShowDeleted(!showDeleted);
              setStatusFilter(null);
              setSortField('id');
              setSortOrder('ASC');
              safePageChange(1);
            } else {
              const [field, order] = eventKey.split('-');

              if (field === 'status') {
                setStatusFilter(order === 'null' ? null : parseInt(order, 10));
                setSortField('id');
                if (setShowDeleted) setShowDeleted(false);
              } else if (field === 'noFilter') {
                setStatusFilter(null);
                setSortField('id');
                setSortOrder('ASC');
                if (setShowDeleted) setShowDeleted(false);
              } else {
                setSortField(field);
                setSortOrder(order);
                setStatusFilter(null);
                if (setShowDeleted) setShowDeleted(false);
              }

              safePageChange(1);
            }
          }}
          className="filter-dropdown"
        >
          <Dropdown.Item eventKey="nome-ASC">(A-Z)</Dropdown.Item>
          <Dropdown.Item eventKey="nome-DESC">(Z-A)</Dropdown.Item>
          <Dropdown.Item eventKey="created_at-ASC">Mais Antigo</Dropdown.Item>
          <Dropdown.Item eventKey="created_at-DESC">Mais Recente</Dropdown.Item>
          <Dropdown.Item eventKey="status-1">Ativos</Dropdown.Item>
          <Dropdown.Item eventKey="status-0">Inativos</Dropdown.Item>
          {setShowDeleted && (
            <Dropdown.Item eventKey="deleted">
              {showDeleted ? 'Ocultar Excluídos' : 'Mostrar Excluídos'}
            </Dropdown.Item>
          )}
          <Dropdown.Divider />
          <Dropdown.Item eventKey="noFilter">Sem Filtro</Dropdown.Item>
        </DropdownButton>

        <Button
          variant="primary"
          className="add-item-btn"
          onClick={onAddButtonClick}
        >
          {addButtonText} <i className="fas fa-plus ms-2" />
        </Button>
      </div>
    </div>
  );
};

export default Header;
