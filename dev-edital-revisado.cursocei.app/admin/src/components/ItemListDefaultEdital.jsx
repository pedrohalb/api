import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { softDeleteEdital, restoreEdital } from '../services/api';
import '../App.css';

function ItemListDefaultEdital({ editais, onReload }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
    setRole(storedRole);
  }, []);

  const handleEditClick = (id) => {
    const basePath = role === 'admin' ? `/admin/editais/${id}` : `/editais/${id}`;
    navigate(basePath);
  };

  const handleDeleteClick = (id) => {
    toast(
      <div>
        <p>Tem certeza que deseja excluir este edital?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await softDeleteEdital(id);
                toast.dismiss();
                toast.success('Edital excluído com sucesso!');
                const updatedEditais = editais.filter((edital) => edital.id !== id);
                onReload(updatedEditais);
              } catch (error) {
                toast.dismiss();
                toast.error('Erro ao excluir o edital.');
                console.error('Erro ao excluir edital:', error);
              }
            }}
          >
            Confirmar
          </Button>
          <Button variant="secondary" onClick={() => toast.dismiss()}>
            Cancelar
          </Button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const handleRestoreClick = async (id) => {
    try {
      await restoreEdital(id);
      toast.success('Edital restaurado com sucesso.');
      const updatedEditais = editais.filter((edital) => edital.id !== id);
      onReload(updatedEditais);
    } catch (error) {
      toast.error('Erro ao restaurar o edital.');
      console.error('Erro ao restaurar edital:', error);
    }
  };

  return (
    <div className="mt-4">
      {editais && editais.length > 0 ? (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th><i className="fas fa-flag me-2" /> Editais</th>
              <th><i className="fas fa-calendar-alt me-2" /> Data</th>
              <th><i className="fas fa-square me-2" /> Matérias</th>
              <th><i className="fas fa-cog me-2" /> Ações</th>
            </tr>
          </thead>
          <tbody>
            {editais.map((edital) => (
              <tr key={edital.id}>
                <td>{edital.nome}</td>
                <td>{new Date(edital.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                  <div className="materias-buttons-container">
                    <Button className="table-btn-subitens btn-ativas">
                      <span className="subitens-number">{edital.total_materias_ativas}</span>
                      <span className="ms-2">
                        {edital.total_materias_ativas === 1 ? 'Ativa' : 'Ativas'}
                      </span>
                    </Button>
                    <Button className="table-btn-subitens btn-inativas">
                      <span className="subitens-number">{edital.total_materias_inativas}</span>
                      <span className="ms-2">
                        {edital.total_materias_inativas === 1 ? 'Inativa' : 'Inativas'}
                      </span>
                    </Button>
                    <Button className="table-btn-subitens btn-excluidas">
                      <span className="subitens-number">{edital.total_materias_excluidas}</span>
                      <span className="ms-2">
                        {edital.total_materias_excluidas === 1 ? 'Excluída' : 'Excluídas'}
                      </span>
                    </Button>
                  </div>
                </td>
                <td>
                  <div className="table-action-buttons">
                    {edital.deleted_at ? (
                      <Button className="table-btn-editar" onClick={() => handleRestoreClick(edital.id)}>
                        <span className="me-2">Restaurar</span>
                        <i className="fas fa-undo" />
                      </Button>
                    ) : (
                      <>
                        <Button className="table-btn-editar" onClick={() => handleEditClick(edital.id)}>
                          <span className="me-2">Editar</span>
                          <i className="fas fa-cog" />
                        </Button>
                        <Button className="table-btn-delete" onClick={() => handleDeleteClick(edital.id)}>
                          <i className="fas fa-trash" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div style={{ textAlign: "center", padding: "20px", color: "#777" }}>
          Nenhum edital encontrado.
        </div>
      )}
    </div>
  );
}

export default ItemListDefaultEdital;
