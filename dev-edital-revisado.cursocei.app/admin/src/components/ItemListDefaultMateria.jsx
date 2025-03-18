import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { softDeleteMateria, restoreMateria, getEditaisByMateriaId } from '../services/api';
import '../App.css';

function ItemListDefaultMateria({ materias, onReload }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
    setRole(storedRole);
  }, []);

  const handleEditClick = (id) => {
    const basePath = role === 'admin' ? `/admin/materias/${id}` : `/materias/${id}`;
    navigate(basePath);
  };

  const handleDeleteClick = async (id) => {
    try {
      const response = await getEditaisByMateriaId(id);
      const editaisAfetados = response.data.editais;

      let confirmMessage = "Tem certeza que deseja excluir esta matéria?";
      if (editaisAfetados.length > 0) {
        const editaisNomes = editaisAfetados.map(edital => edital.nome).join(', ');
        confirmMessage = `A matéria está associada aos seguintes editais: ${editaisNomes}.
        Se continuar, ela será removida de todos esses editais. Deseja prosseguir?`;
      }

      toast(
        <div>
          <p>{confirmMessage}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await softDeleteMateria(id);
                  toast.dismiss();
                  toast.success('Matéria excluída com sucesso!');
                  const updatedMaterias = materias.filter((materia) => materia.id !== id);
                  onReload(updatedMaterias);
                } catch (error) {
                  toast.dismiss();
                  toast.error('Erro ao excluir a matéria.');
                  console.error('Erro ao excluir matéria:', error);
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
    } catch (error) {
      console.error('Erro ao buscar editais da matéria:', error);
      toast.error('Erro ao verificar editais associados.');
    }
  };

  const handleRestoreClick = async (id) => {
    try {
      await restoreMateria(id);
      toast.success('Matéria restaurada com sucesso!');
      const updatedMaterias = materias.filter((materia) => materia.id !== id);
      onReload(updatedMaterias);
    } catch (error) {
      toast.error('Erro ao restaurar a matéria.');
      console.error('Erro ao restaurar matéria:', error);
    }
  };

  return (
    <div className="mt-4">
      {materias && materias.length > 0 ? (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th><i className="fas fa-book me-2" /> Matérias</th>
              <th><i className="fas fa-calendar-alt me-2" /> Data</th>
              <th><i className="fas fa-square me-2" /> Tópicos</th>
              <th><i className="fas fa-cog me-2" /> Ações</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((materia) => (
              <tr key={materia.id}>
                <td>{materia.nome}</td>
                <td>{new Date(materia.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                  <div className="topicos-buttons-container">
                    <Button className="table-btn-subitens btn-ativas">
                      <span className="subitens-number">{materia.numero_topicos_ativos}</span>
                      <span className="ms-2">
                        {materia.numero_topicos_ativos === 1 ? 'Ativo' : 'Ativos'}
                      </span>
                    </Button>
                    <Button className="table-btn-subitens btn-inativas">
                      <span className="subitens-number">{materia.numero_topicos_inativos}</span>
                      <span className="ms-2">
                        {materia.numero_topicos_inativos === 1 ? 'Inativo' : 'Inativos'}
                      </span>
                    </Button>
                  </div>
                </td>
                <td>
                  <div className="table-action-buttons">
                    {materia.deleted_at ? (
                      <Button className="table-btn-editar" onClick={() => handleRestoreClick(materia.id)}>
                        <span className="me-2">Restaurar</span>
                        <i className="fas fa-undo" />
                      </Button>
                    ) : (
                      <>
                        <Button className="table-btn-editar" onClick={() => handleEditClick(materia.id)}>
                          <span className="me-2">Editar</span>
                          <i className="fas fa-cog" />
                        </Button>
                        <Button className="table-btn-delete" onClick={() => handleDeleteClick(materia.id)}>
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
          Nenhuma matéria encontrada.
        </div>
      )}
    </div>
  );
}

export default ItemListDefaultMateria;
