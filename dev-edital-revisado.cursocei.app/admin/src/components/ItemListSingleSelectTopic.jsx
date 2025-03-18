import React from 'react';
import { Table, Button } from 'react-bootstrap';
import '../App.css'; // Importa o CSS global

function ItemListSingleSelectTopic({ items, selectedItems, onSelectItem, onSelectAll }) {
  const allSelected = items.every((item) => selectedItems.has(item.id));

  return (
    <div className="mt-4">
      {items.length > 0 ? (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>
                <div className="select-all">
                  <div
                    className={`select-box ${allSelected ? 'selected' : ''}`}
                    onClick={onSelectAll}
                    style={{ marginRight: '10px' }} // Espaçamento entre o quadrado e o ícone do livro
                  >
                    {allSelected && <i className="fas fa-check"></i>}
                  </div>
                  <i className="fas fa-book me-1" /> Nome
                </div>
              </th>
              <th>
                <i className="fas fa-check-square me-2" /> PDFs
              </th>
              <th>
                <i className="fas fa-calendar-alt me-2" /> Data
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`table-row ${selectedItems.has(item.id) ? 'selected' : ''}`}
              >
                <td>
                  <div className="row-content">
                    <div
                      className={`select-box ${selectedItems.has(item.id) ? 'selected' : ''}`}
                    >
                      {selectedItems.has(item.id) && <i className="fas fa-check"></i>}
                    </div>
                    {item.nome}
                  </div>
                </td>
                <td>
                  <Button className="pdf-column-item">
                    <i className="fas fa-file-pdf pdf-icon"></i>
                    <span className="pdf-number ms-2">{item.numero_arquivos}</span>
                    <span className="pdf-text ms-2">
                      {item.numero_arquivos === 1 ? 'Arquivo' : 'Arquivos'}
                    </span>
                  </Button>
                </td>
                <td>{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#777" }}>
           Nenhum tópico associado à matéria.
          </div>
      )}
    </div>
  );
}


export default ItemListSingleSelectTopic;
