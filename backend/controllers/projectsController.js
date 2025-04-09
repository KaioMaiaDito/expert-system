const { generateId, loadData, saveData } = require('../utils/utils');
// List all projects
const listProjects = (req, res) => {
  const data = loadData();
  res.json(data.projects);
};

// Get a project by ID
const getProjectById = (req, res) => {
  const projectId = req.params.id;
  const data = loadData();
  const project = data.projects.find(project => project.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Projeto não encontrado.' });
  }
  res.json(project);
};

// Create a new project with generated ID
const createProject = (req, res) => {
  const { name, description, facts, rules } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome do projeto é obrigatório.' });
  }
  const newProject = {
    id: generateId(),
    name,
    description,
    facts: Array.isArray(facts) ? facts : [],
    rules: Array.isArray(rules) ? rules : [],
  };
  const data = loadData();
  data.projects.push(newProject);
  saveData(data);
  res.status(201).json(newProject);
};

// Delete a project
const deleteProject = (req, res) => {
  const projectId = req.params.id;
  const data = loadData();

  const index = data.projects.findIndex(project => project.id === projectId);
  if (index === -1) {
    return res.status(404).json({ error: 'Projeto não encontrado.' });
  }
  data.projects.splice(index, 1);
  saveData(data);
  res.json({ message: 'Projeto excluído com sucesso.' });
};

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  deleteProject,
};
