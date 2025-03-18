import React from 'react';
import { Button } from 'react-bootstrap';
import PaginationControl from './PaginationControl';
import '../App.css';

const HeaderSingle = ({
  title,
  barraPesquisa,
  icon,
  currentPage,
  totalPages,
  handlePageChange,
  onAddClick,
  nome,
  setNome, // Callback para atualizar o nome
  status,
  toggleStatus, // Callback para alternar o status
  addButtonText = 'Adicionar', // Texto do botão padrão
}) => {
  return (
    <div className="header-single">
      {/* Linha com Botão de Status e Nome */}
      <div className="header-single-top">
        {/* Status */}
        <div className="header-single-status">
          <label className="header-single-label">Status</label>
          <button
            className={`status-toggle ${status ? 'active' : ''}`}
            onClick={toggleStatus} // Alterna o status
          />
        </div>
        {/* Nome da Matéria */}
        <div className="header-single-name">
          <label className="header-single-label">{barraPesquisa}</label>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)} // Atualiza o nome da matéria
          />
        </div>
      </div>
      {/* Título, Paginação e Botão */}
      <div className="header-single-title">
        <div className="d-flex align-items-center gap-2">
          {icon && <span className="custom-icon">{icon}</span>} {/* Ícone opcional */}
          <span className="title-text">{title}</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          {/* Paginação */}
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
          {/* Botão de Adicionar Tópico */}
          <Button
            variant="primary"
            className="add-item-btn"
            onClick={onAddClick}
          >
            {addButtonText} <i className="fas fa-plus ms-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeaderSingle;
