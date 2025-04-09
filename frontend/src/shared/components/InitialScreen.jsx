import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InitialScreen = () => {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Abre modal para inserir nome do novo projeto.
  const handleNewProject = () => {
    setShowModal(true);
    setError('');
    setProjectName('');
  };

  // Cria novo projeto via API.
  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError('O nome do projeto é obrigatório.');
      return;
    }
    try {
      const newProject = { name: projectName };
      await axios.post('http://localhost:3000/api/projects', newProject);
      setShowModal(false);
      // Após criação, navega para a tela de Dashboard/Projetos.
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao criar projeto.');
      console.error(err);
    }
  };

  // Navega para a listagem de projetos existentes.
  const handleOpenProjects = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bem-vindo ao Sistema de Projetos</h1>
      <div style={{ marginTop: '2rem' }}>
        <button onClick={handleNewProject} style={{ marginRight: '1rem' }}>
          Novo
        </button>
        <button onClick={handleOpenProjects}>Abrir</button>
      </div>

      {showModal && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
            }}
          >
            <h2>Novo Projeto</h2>
            <input
              type="text"
              placeholder="Nome do Projeto"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', margin: '1rem 0' }}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCreateProject}
                style={{ marginRight: '1rem' }}
              >
                Criar
              </button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialScreen;
