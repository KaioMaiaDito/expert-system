const Project = require('../models/Project');
const FileStorageService = require('../services/fileStorageService');

class ProjectController {
  // Retorna todos os projetos do arquivo JSON
  static getAll(req, res) {
    try {
      const projects = Project.loadAll();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({
        message: 'Erro ao carregar os projetos',
        error: error.message,
      });
    }
  }

  // Cria um novo projeto e persiste no arquivo JSON
  static create(req, res) {
    try {
      const newProject = req.body;
      const data = FileStorageService.readData('./data/sampleData.json') || {};
      data.projects = data.projects || [];
      data.projects.push(newProject);
      FileStorageService.writeData('./data/sampleData.json', data);
      res.status(201).json(newProject);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Erro ao criar o projeto', error: error.message });
    }
  }

  // Exclui um projeto baseado em seu id
  static delete(req, res) {
    try {
      const { id } = req.params;
      const data = FileStorageService.readData('./data/sampleData.json') || {};
      data.projects = (data.projects || []).filter(
        project => project.id !== id
      );
      FileStorageService.writeData('./data/sampleData.json', data);
      res.status(200).json({ message: `Projeto ${id} removido com sucesso.` });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Erro ao remover o projeto', error: error.message });
    }
  }
}

module.exports = ProjectController;
