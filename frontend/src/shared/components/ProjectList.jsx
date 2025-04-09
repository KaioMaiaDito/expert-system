import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Fetch the list of projects from the API
  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/projects');
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Open detail modal for the selected project
  const handleProjectClick = project => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = project => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  // Confirm deletion of the project
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/projects/${projectToDelete.id}`
      );
      setShowDeleteModal(false);
      setProjectToDelete(null);
      fetchProjects();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
    }
  };

  // Open modal for adding a new project
  const handleAddNewProject = () => {
    setNewProjectName('');
    setNewProjectDescription('');
    setShowNewProjectModal(true);
  };

  // Create new project via API
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      alert('O nome do projeto é obrigatório.');
      return;
    }
    try {
      const payload = {
        name: newProjectName,
        description: newProjectDescription,
      };
      await axios.post('http://localhost:3000/api/projects', payload);
      setShowNewProjectModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }
  };

  if (loading) return <div>Carregando projetos...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Projetos</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleAddNewProject} style={{ marginRight: '1rem' }}>
          Adicionar Novo Projeto
        </button>
      </div>
      {projects.length === 0 ? (
        <p>Nenhum projeto encontrado.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {projects.map(project => (
            <li
              key={project.id}
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                marginBottom: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onClick={() => handleProjectClick(project)}
            >
              <span>{project.name}</span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteClick(project);
                }}
                style={{
                  backgroundColor: 'red',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                }}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedProject && (
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
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2>{selectedProject.name}</h2>
            <p>
              {selectedProject.description
                ? selectedProject.description
                : 'Sem descrição'}
            </p>
            <button onClick={() => setShowDetailModal(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
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
            <h2>Confirmar Exclusão</h2>
            <p>
              Tem certeza que deseja excluir o projeto "{projectToDelete.name}"?
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1rem',
              }}
            >
              <button
                onClick={confirmDelete}
                style={{
                  marginRight: '1rem',
                  backgroundColor: 'red',
                  color: '#fff',
                }}
              >
                Confirmar
              </button>
              <button onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
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
          onClick={() => setShowNewProjectModal(false)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2>Novo Projeto</h2>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Nome do Projeto"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                }}
              />
              <textarea
                placeholder="Descrição do Projeto"
                value={newProjectDescription}
                onChange={e => setNewProjectDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  minHeight: '80px',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCreateProject}
                style={{ marginRight: '1rem' }}
              >
                Criar
              </button>
              <button onClick={() => setShowNewProjectModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
