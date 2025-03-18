import React from 'react';
import '../App.css';
import { Button } from 'react-bootstrap';

const RodapeConfig = ({
  title = "Configurações do Edital",
  totalItems,
  selectedItems,
  isSidebarExpanded, // Recebe o estado da sidebar
  onSave, // Callback para o botão "Salvar"
  onCancel, // Callback para o botão "Cancelar"
}) => {
  return (
    <div
      className={`footer-config ${isSidebarExpanded ? 'expanded' : 'collapsed'
        }`}
    >
      {/* Título */}
      <div className="footer-config-title">
        <i className="fas fa-cog"></i>
        <span>{title}</span>
      </div>

      {/* Espaço flexível */}
      <div className="footer-config-spacer"></div>

      {/* Informações de Tópicos */}
      {totalItems !== undefined && selectedItems !== undefined && (
        <div className="footer-config-info">
          <div className="footer-config-info-box">
            <i className="fas fa-check-circle topics-icon me-2" />
            <span className="footer-number">{selectedItems}</span> Tópicos Selecionados
          </div>
          <div className="footer-config-info-box">
            <i className="far fa-circle topics-icon me-2" />
            <span className="footer-number">{totalItems}</span> Tópicos Disponíveis
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="footer-config-buttons">
        <Button
          className="footer-config-button footer-config-button-cancel"
          onClick={onCancel} // Passa o callback de cancelamento
        >
          Cancelar
          <i className="fas fa-times"></i>
        </Button>
        <Button
          className="footer-config-button footer-config-button-save"
          onClick={onSave} // Passa o callback de salvamento
        >
          Salvar
          <i className="fas fa-check"></i>
        </Button>
      </div>
    </div>
  );
};

export default RodapeConfig;
