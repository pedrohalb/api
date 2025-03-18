import React, { useState, useEffect } from 'react';
import { DropdownButton, Dropdown, Button } from 'react-bootstrap';
import '../App.css';

const HeaderSingleTopic = ({
  title,
  barraPesquisa,
  icon,
  materias, // Lista de matérias para o dropdown
  selectedMateria, // Matéria selecionada
  onMateriaChange, // Callback para alterar a matéria
  status, // Estado do status (ativo/inativo)
  onStatusChange, // Callback para alterar o status
  nome, // Nome do tópico
  onNomeChange, // Callback para alterar o nome
  onAddClick, // Callback para adicionar arquivos
  isMateriaLoading,
}) => {
  const toggleStatus = () => {
    if (!status) {
      // Lógica para ativar o status
      onStatusChange(true);
    } else {
      // Desabilite conforme necessário
      onStatusChange(false);
    }
  };

  return (
    <div className="header-single">
      {/* Linha com Botão de Status, Nome e Dropdown */}
      <div className="header-single-top">
        {/* Status */}
        <div className="header-single-status">
          <label className="header-single-label">Status</label>
          <button
            className={`status-toggle ${status ? 'active' : ''}`}
            onClick={toggleStatus}
          ></button>
        </div>

        {/* Nome do Tópico */}
        <div className="header-single-name">
          <label className="header-single-label">{barraPesquisa}</label>
          <input
            type="text"
            placeholder="Nome"
            value={nome || ""} // Garante que não será undefined
            onChange={(e) => onNomeChange(e.target.value)}
          />
        </div>

        <div className="header-single-dropdown">
          <label className="header-single-label">Matéria</label>
          <div
            className="filter-dropdown static-dropdown"
            style={{
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#000',
              minWidth: '150px',
              height: '44px',
              textAlign: 'center',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
              border: '1px solid #6C757D',
              cursor: 'default',
            }}
          >
            {isMateriaLoading ? "Carregando..." : selectedMateria?.nome || "Nenhuma matéria selecionada"}
          </div>
        </div>
      </div>

      {/* Título e Botão */}
      <div className="header-single-title">
        <div className="d-flex align-items-center gap-2">
          {icon && <span className="custom-icon">{icon}</span>} {/* Ícone opcional */}
          <span className="title-text">{title}</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Botão de Adicionar Arquivos */}
          <Button variant="primary" className="add-item-btn" onClick={onAddClick}>
            Adicionar <i className="fas fa-plus ms-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeaderSingleTopic;
