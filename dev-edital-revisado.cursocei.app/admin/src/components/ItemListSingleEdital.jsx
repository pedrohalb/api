import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getTopicosByMateria2 } from '../services/api';
import '../App.css';
import { toast } from 'react-toastify';

function ItemListSingleEdital({ materias, editalId, onRemove, setMateriasTemp, setMateriasAssociadas }) {
  const [materiasComTopicos, setMateriasComTopicos] = useState([]);
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  // Obtém a role do usuário (admin ou user)
  useEffect(() => {
    const storedRole = localStorage.getItem('role') || sessionStorage.getItem('role');
    setRole(storedRole);
  }, []);

  useEffect(() => {
    const fetchTopicos = async () => {
      try {
        const updatedMaterias = await Promise.all(
          materias.map(async (materia) => {
            const { data } = await getTopicosByMateria2(materia.id, editalId);
            return {
              ...materia,
              topicosDisponiveis: data.totalDisponiveis || 0,
              topicosAtivos: data.totalAtivos || 0,
            };
          })
        );
        setMateriasComTopicos(updatedMaterias);
      } catch (error) {
        console.error('Erro ao buscar tópicos por matéria:', error);
      }
    };

    if (materias.length > 0) {
      fetchTopicos();
    }
  }, [materias, editalId]);

  const handleViewTopics = (id) => {
    const basePath = role === 'admin' ? `/admin/selecao-singular-topico` : `/selecao-singular-topico`;
    navigate(`${basePath}?id=${id}&editalId=${editalId}`);
  };

  const handleRemoveMateria = (materiaId) => {
    toast(
      <div>
        <p>Tem certeza que deseja remover esta matéria do edital?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button
            variant="danger"
            onClick={() => {
              setMateriasTemp((prev) => prev.filter((materia) => materia.id !== materiaId));
              setMateriasAssociadas((prev) => prev.filter((materia) => materia.id !== materiaId));
              onRemove(materiaId);
              toast.dismiss();
              toast.success('Matéria removida com sucesso!');
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

return (
  <div className="mt-4">
    {materiasComTopicos && materiasComTopicos.length > 0 ? (
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th style={{ width: '40%' }}>
              <i className="fas fa-book me-2" /> Nome
            </th>
            <th style={{ width: '10%' }}>
              <i className="fas fa-square me-2" /> Tópicos Disponíveis
            </th>
            <th style={{ width: '10%' }}>
              <i className="fas fa-check-square me-2" /> Tópicos Ativos
            </th>
            <th style={{ width: '10%' }}>
              <i className="fas fa-cog me-2" /> Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {materiasComTopicos.map((materia) => (
            <tr key={materia.id} className={materia.status === 0 ? "materia-inativa" : ""}>
              <td>
                {materia.nome}
                {materia.status === 0 && <span className="label-inativa">Inativa</span>}
                {materia.deleted_at && <span className="label-excluido">Excluída</span>}
              </td>
              <td>
                <div className="topics-cell">
                  <i className="far fa-circle topics-icon me-2" />
                  <span className="topics-number">{materia.topicosDisponiveis || 0}</span>
                </div>
              </td>
              <td>
                <div className="topics-cell">
                  <i className="fas fa-check-circle topics-icon me-2" />
                  <span className="topics-number">{materia.topicosAtivos || 0}</span>
                </div>
              </td>
              <td>
                {!materia.deleted_at && materia.status !== 0 ? (
                  <div className="table-action-buttons">
                    <Button
                      className="table-btn-editar"
                      onClick={() => handleViewTopics(materia.id)}
                    >
                      <span className="me-2">Ver Tópicos</span>
                      <i className="fas fa-cog" />
                    </Button>
                    <Button
                      className="table-btn-delete"
                      onClick={() => handleRemoveMateria(materia.id)}
                    >
                      <i className="fas fa-trash" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted">Indisponível</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    ) : (
      <div style={{ textAlign: "center", padding: "20px", color: "#777" }}>
        Nenhuma matéria associada ao edital.
      </div>
    )}
  </div>
);
}

export default ItemListSingleEdital;
