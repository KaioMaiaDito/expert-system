import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectBuilder from './ProjectBuilder';
import QuestionFlow from './QuestionFlow';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectRules, setProjectRules] = useState([]);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // States for project execution using DFA endpoints
  const [showQuestionFlow, setShowQuestionFlow] = useState(false);
  const [executionData, setExecutionData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});

  // Fetch projects from API
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

  // When a project is selected, fetch the detailed rules for that project
  useEffect(() => {
    if (
      selectedProject &&
      selectedProject.rules &&
      selectedProject.rules.length > 0
    ) {
      Promise.all(
        selectedProject.rules.map(ruleId =>
          axios.get(`http://localhost:3000/api/rules/${ruleId}`)
        )
      )
        .then(responses => {
          const rules = responses.map(res => res.data);
          setProjectRules(rules);
        })
        .catch(error => {
          console.error('Erro ao carregar regras associadas:', error);
          setProjectRules([]);
        });
    } else {
      setProjectRules([]);
    }
  }, [selectedProject]);

  // Handle project click to view details
  const handleProjectClick = project => {
    setSelectedProject(project);
    setShowProjectDetailModal(true);
  };

  // Handler para executar o projeto usando DFA
  const handleExecute = project => {
    setSelectedProject(project);
    setShowQuestionFlow(true);
  };

  // Delete a project
  const handleDelete = async project => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o projeto "${project.name}"?`
      )
    ) {
      try {
        await axios.delete(`http://localhost:3000/api/projects/${project.id}`);
        fetchProjects();
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        alert('Erro ao excluir projeto.');
      }
    }
  };

  // Callback executed after project creation
  const onProjectCreated = () => {
    setShowNewProjectModal(false);
    fetchProjects();
  };

  if (loading) return <div>Carregando projetos...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Projetos</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowNewProjectModal(true)}
          style={{ marginRight: '1rem' }}
        >
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleProjectClick(project)}
            >
              <span>
                <strong>ID:</strong> {project.id} - <strong>Nome:</strong>{' '}
                {project.name}
              </span>
              <div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleExecute(project);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    marginRight: '0.5rem',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  Executar
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(project);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'red',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Project Detail Modal */}
      {showProjectDetailModal && selectedProject && (
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
          onClick={() => setShowProjectDetailModal(false)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2>Projeto: {selectedProject.name}</h2>
            <p>
              <strong>ID:</strong> {selectedProject.id}
            </p>
            {selectedProject.description && (
              <p>
                <strong>Descrição:</strong> {selectedProject.description}
              </p>
            )}
            <div>
              <strong>Regras Associadas:</strong>
              {projectRules && projectRules.length > 0 ? (
                <ul>
                  {projectRules.map(rule => (
                    <li key={rule.id}>
                      <strong>Conclusão:</strong> {rule.conclusion}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma regra associada.</p>
              )}
            </div>
            <button onClick={() => setShowProjectDetailModal(false)}>
              Fechar
            </button>
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
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2>Adicionar Novo Projeto</h2>
            <ProjectBuilder onProjectCreated={onProjectCreated} />
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button onClick={() => setShowNewProjectModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Flow Modal */}
      {showQuestionFlow && selectedProject && (
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
          onClick={() => setShowQuestionFlow(false)} // Fecha o fluxo ao clicar fora
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '300px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()} // Impede o fechamento ao clicar dentro
          >
            <QuestionFlow projectId={selectedProject.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
