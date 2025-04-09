import React from 'react';
import { useProjects } from './hooks/useProjects';

function ProjectsComponent() {
  const { projects, loading, error, createProject, deleteProject } =
    useProjects();

  if (loading) return <p>Carregando projetos...</p>;
  if (error) return <p>Erro ao carregar projetos: {error.message}</p>;

  return (
    <div>
      <h1>Projetos</h1>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            {project.name}
            <button onClick={() => deleteProject(project.id)}>Excluir</button>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          createProject({
            id: 'project-novo',
            name: 'Novo Projeto',
            facts: [],
            rules: [],
            responsibleId: 'responsible-1',
          })
        }
      >
        Adicionar Projeto
      </button>
    </div>
  );
}

export default ProjectsComponent;
