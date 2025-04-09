import React from 'react';
import { useProjects } from './shared/hooks/useProjects';
import { useRules } from './shared/hooks/useRules';
import { useFacts } from './shared/hooks/useFacts';
import { useResponsibles } from './shared/hooks/useResponsibles';

const App = () => {
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    createProject,
    deleteProject,
  } = useProjects();

  const {
    rules,
    loading: rulesLoading,
    error: rulesError,
    createRule,
    deleteRule,
  } = useRules();

  const {
    facts,
    loading: factsLoading,
    error: factsError,
    createFact,
    deleteFact,
  } = useFacts();

  const {
    responsibles,
    loading: responsiblesLoading,
    error: responsiblesError,
    createResponsible,
    deleteResponsible,
  } = useResponsibles();

  // Verifica se há algum carregamento em andamento ou erros
  if (projectsLoading || rulesLoading || factsLoading || responsiblesLoading) {
    return <div>Carregando dados...</div>;
  }

  if (projectsError || rulesError || factsError || responsiblesError) {
    return <div>Erro ao carregar dados.</div>;
  }

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
            name: 'Projeto Novo',
            facts: [],
            rules: [],
            responsibleId: 'responsible-1',
          })
        }
      >
        Criar Projeto
      </button>

      <h1>Regras</h1>
      <ul>
        {rules.map(rule => (
          <li key={rule.id}>
            Conclusão: {rule.conclusion}
            <button onClick={() => deleteRule(rule.id)}>Excluir</button>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          createRule({
            id: 'nova-regra',
            condition: { all: [{ equals: { corre: 'sim' } }] },
            conclusion: 'Novo Superpoder',
          })
        }
      >
        Criar Regra
      </button>

      <h1>Fatos</h1>
      <ul>
        {facts.map(fact => (
          <li key={fact.id}>
            {fact.description}
            <button onClick={() => deleteFact(fact.id)}>Excluir</button>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          createFact({ id: 'novo-fato', description: 'Novo Fato Teste' })
        }
      >
        Criar Fato
      </button>

      <h1>Responsáveis</h1>
      <ul>
        {responsibles.map(responsible => (
          <li key={responsible.id}>
            {responsible.name}
            <button onClick={() => deleteResponsible(responsible.id)}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          createResponsible({
            id: 'novo-responsavel',
            name: 'Novo Responsável',
            email: 'novo@exemplo.com',
          })
        }
      >
        Criar Responsável
      </button>
    </div>
  );
};

export default App;
