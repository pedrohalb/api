import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import Sidebar from '../components/SideBar';

const ConfigPage = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
      const savedState = localStorage.getItem("sidebarExpanded");
      return savedState !== null ? JSON.parse(savedState) : true;
    });
  const [estados, setEstados] = useState([]);

  useEffect(() => {
      document.title = "Configurações";
    // Busca os estados na API do IBGE
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then((response) => response.json())
      .then((data) =>
        setEstados(data.map((estado) => ({ sigla: estado.sigla, nome: estado.nome })))
      )
      .catch((error) => console.error('Erro ao buscar estados:', error));
  }, []);
  
    const handleSidebarToggle = (expanded) => {
  setIsSidebarExpanded(expanded);
  localStorage.setItem("sidebarExpanded", JSON.stringify(expanded));
};

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {/* Sidebar responsiva */}
      <Sidebar onToggle={handleSidebarToggle} />
      <div
        className={`main-content ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
        style={{
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          padding: '3rem',
          flexGrow: 1,
          flexBasis: '100%', // Garante que ocupa toda a largura em telas menores
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Form>
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <Form.Group controlId="city">
                  <Form.Label style={{ fontWeight: 'bold', color: '#000' }}>Cidade</Form.Label>
                  <Form.Control type="text" placeholder="Cidade" />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="state">
                  <Form.Label style={{ fontWeight: 'bold', color: '#000' }}>Estado</Form.Label>
                  <Form.Select>
                    <option value="">UF</option>
                    {estados.map((estado) => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="zip">
                  <Form.Label style={{ fontWeight: 'bold', color: '#000' }}>CEP</Form.Label>
                  <Form.Control type="text" placeholder="00.000-000" />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="address">
                  <Form.Label style={{ fontWeight: 'bold', color: '#000' }}>Endereço</Form.Label>
                  <Form.Control type="text" placeholder="Endereço" />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={2}>
                <Form.Group controlId="number">
                  <Form.Label style={{ fontWeight: 'bold', color: '#000' }}>Número</Form.Label>
                  <Form.Control type="text" placeholder="Número" />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={2}>
                <Form.Group controlId="complement">
                  <Form.Label style={{ fontWeight: 'bold', color: '#000' }}>Complemento</Form.Label>
                  <Form.Control type="text" placeholder="Casa" />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={2}>
                <Form.Group controlId="neighborhood">
                  <Form.Label style={{ fontWeight: 'bold', color: '#000' }}>Bairro</Form.Label>
                  <Form.Control type="text" placeholder="Bairro" />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
        <div
          className="footer-config-buttons"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '1rem',
          }}
        >
          <Button className="footer-config-button footer-config-button-save">
            Salvar
            <i className="fas fa-check" style={{ marginLeft: '0.5rem' }}></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
