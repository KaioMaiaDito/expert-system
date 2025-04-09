const { projects } = require('../data/sampleData.json');

exports.getProjects = (req, res) => {
  res.json(projects);
};

exports.getProjectById = (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json(project);
};

exports.createProject = (req, res) => {
  const { id, name, facts, rules, responsibleId } = req.body;
  const newProject = { id, name, facts, rules, responsibleId };
  projects.push(newProject);
  res.status(201).json(newProject);
};

exports.deleteProject = (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }
  projects.splice(index, 1);
  res.status(200).json({ message: 'Project deleted successfully' });
};
