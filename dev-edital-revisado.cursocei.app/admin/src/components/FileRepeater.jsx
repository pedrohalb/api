import React from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { FaPlus, FaMinus, FaFilePdf, FaTimes } from 'react-icons/fa';

const FileRepeater = ({ fileList, onFileListChange, onFileMarkedForDeletion }) => {
  const handleFileChange = (index, file) => {
    const updatedList = [...fileList];
    updatedList[index].file = file;
    onFileListChange(updatedList);
  };

  const handleNameChange = (index, name) => {
    const updatedList = [...fileList];
    updatedList[index].name = name;
    onFileListChange(updatedList);
  };

  const handleRemoveFile = (index) => {
    const updatedList = [...fileList];
    updatedList[index].file = null;
    onFileListChange(updatedList);
  };

  const handleRemoveRepeater = (index) => {
    const removedFile = fileList[index];
    const updatedList = fileList.filter((_, i) => i !== index);

    // Marca o arquivo para exclusão, caso ele tenha um ID (ou seja, já exista no backend)
    if (removedFile.id) {
      onFileMarkedForDeletion(removedFile.id);
    }

    onFileListChange(updatedList);
  };

  return (
    <div style={{
      borderLeft: '2px solid #ddd',
      borderRight: '2px solid #ddd',
      borderRadius: '10px',
      padding: '1rem',
      maxHeight: '700px',
      overflowY: 'auto',
      backgroundColor: '#f0f0f0'
    }}>
      {fileList.map((item, index) => (
        <Card key={index} className="mb-3" style={{ border: 'none' }}>
          <Card.Body style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: '10px solid #6C757D',
            borderRight: '37px solid #6C757D',
            padding: '1rem',
            borderRadius: '10px',
          }}>
            <Row className="align-items-center" style={{ width: '100%' }}>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 'bold', color: '#495057' }}>Nome do Arquivo</Form.Label>
                  <Form.Control
                    type="text"
                    value={item.name}
                    placeholder="Nome"
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    style={{ width: '100%' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 'bold', color: '#495057' }}>PDF</Form.Label>
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      border: '2px dashed #6C757D',
                      borderRadius: '5px',
                      padding: '10px',
                      backgroundColor: item.file ? '#f0f0f0' : '#fff',
                      transition: 'background-color 0.3s ease-in-out',
                      width: '100%',
                    }}
                  >
                    {!item.file && (
                      <>
                        <FaFilePdf style={{ marginRight: '10px', color: '#6C757D' }} />
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(index, e.target.files[0])}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                          }}
                        />
                        <span
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            color: '#6C757D',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          Upload de Arquivo
                        </span>
                      </>
                    )}
                    {item.file && (
                      <>
                        <div style={{ flex: 1 }}>
                          <span
                            style={{
                              textAlign: 'left',
                              color: '#6C757D',
                              wordBreak: 'break-word',
                              display: 'block',
                            }}
                          >
                            Nome do Arquivo: {item.file.name}
                          </span>
                          <span
                            style={{
                              textAlign: 'left',
                              color: '#6C757D',
                              wordBreak: 'break-word',
                              display: 'block',
                            }}
                          >
                            Tamanho: {(item.file.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                        <Button
                          variant="link"
                          onClick={() => handleRemoveFile(index)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: '#495057',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            marginLeft: '10px',
                            fontSize: '14px',
                            padding: 0,
                            position: 'absolute',
                            right: '10px',
                          }}
                        >
                          <FaTimes />
                        </Button>
                      </>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Button
              variant="danger"
              onClick={() => handleRemoveRepeater(index)}
              //disabled={fileList.length === 1}
              style={{
                position: 'absolute',
                top: '50%',
                right: '0',
                transform: 'translateY(-50%)',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#fff',
                padding: '10px'
              }}
            >
              <FaMinus />
            </Button>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default FileRepeater;
