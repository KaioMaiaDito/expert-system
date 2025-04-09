// models/Project.js
const FileStorageService = require('../services/fileStorageService');

class Project {
  constructor({ id, name, facts, rules, responsibleId }) {
    this.id = id;
    this.name = name;
    this.facts = facts || [];
    this.rules = rules || [];
    this.responsibleId = responsibleId;
  }

  static loadAll() {
    // Ajuste o caminho para o arquivo JSON onde os dados estão armazenados
    const data = FileStorageService.readData('./data/sampleData.json');
    if (!data || !data.projects) return [];
    return data.projects.map(projectData => new Project(projectData));
  }
}

module.exports = Project;
