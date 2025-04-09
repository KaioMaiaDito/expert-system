const Responsible = require('../models/Responsible');
const FileStorageService = require('../services/fileStorageService');

class ResponsibleController {
  // Retorna todos os responsáveis do arquivo JSON
  static getAll(req, res) {
    try {
      const responsibles = Responsible.loadAll();
      res.status(200).json(responsibles);
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Erro ao carregar os responsáveis',
          error: error.message,
        });
    }
  }

  // Cria um novo responsável e persiste no arquivo JSON
  static create(req, res) {
    try {
      const newResponsible = req.body;
      const data = FileStorageService.readData('./data/sampleData.json') || {};
      data.responsibles = data.responsibles || [];
      data.responsibles.push(newResponsible);
      FileStorageService.writeData('./data/sampleData.json', data);
      res.status(201).json(newResponsible);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Erro ao criar o responsável', error: error.message });
    }
  }

  // Exclui um responsável baseado em seu id
  static delete(req, res) {
    try {
      const { id } = req.params;
      const data = FileStorageService.readData('./data/sampleData.json') || {};
      data.responsibles = (data.responsibles || []).filter(
        resp => resp.id !== id
      );
      FileStorageService.writeData('./data/sampleData.json', data);
      res
        .status(200)
        .json({ message: `Responsável ${id} removido com sucesso.` });
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Erro ao remover o responsável',
          error: error.message,
        });
    }
  }
}

module.exports = ResponsibleController;
