import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function ItemListSingleMateria({ items, materiaId }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
    setRole(storedRole);
  }, []);

  const handleEditClick = (topicoId) => {
    const basePath = role === 'admin' ? `/admin/topicos/${topicoId}` : `/topicos/${topicoId}`;
    navigate(`${basePath}?materiaId=${materiaId}`);
  };

  return (
    <div className="mt-4">
      {items.length > 0 ? (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th><i className="fas fa-book me-2" /> Nome</th>
              <th><i className="fas fa-calendar-alt me-2" /> Data</th>
              <th><i className="fas fa-check-square me-2" /> PDFs</th>
              <th><i className="fas fa-cog me-2" /> Editar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const formattedDate = new Date(item.created_at).toLocaleDateString('pt-BR');
              return (
                <tr key={item.id}>
                  <td>
                    {item.nome}
                    {item.status === 0 && <span className="label-inativa">Inativo</span>}
                  </td>
                  <td>{formattedDate}</td>
                  <td>
                    <Button className="pdf-column-item">
                      <i className="fas fa-file-pdf pdf-icon"></i>
                      <span className="pdf-number ms-2">{item.numero_arquivos || 0}</span>
                      <span className="pdf-text ms-2">
                        {item.numero_arquivos === 1 ? 'Arquivo' : 'Arquivos'}
                      </span>
                    </Button>
                  </td>
                  <td>
                    <Button className="table-btn-editar" onClick={() => handleEditClick(item.id)}>
                      <span className="me-2">Editar</span>
                      <i className="fas fa-cog" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <p>Nenhum item encontrado.</p>
      )}
    </div>
  );
}

export default ItemListSingleMateria;
