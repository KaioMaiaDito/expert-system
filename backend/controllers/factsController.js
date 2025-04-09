const Fact = require('../models/Fact');
const FileStorageService = require('../services/fileStorageService');

class FactController {
  // Retorna todos os fatos do arquivo JSON
  static getAll(req, res) {
    try {
      const facts = Fact.loadAll();
      res.status(200).json(facts);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Erro ao carregar os fatos', error: error.message });
    }
  }

  // Cria um novo fato e persiste no arquivo JSON
  static create(req, res) {
    try {
      const newFact = req.body;
      const data = FileStorageService.readData('./data/sampleData.json') || {};
      data.facts = data.facts || [];
      data.facts.push(newFact);
      FileStorageService.writeData('./data/sampleData.json', data);
      res.status(201).json(newFact);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Erro ao criar o fato', error: error.message });
    }
  }

  // Exclui um fato baseado em seu id
  static delete(req, res) {
    try {
      const { id } = req.params;
      const data = FileStorageService.readData('./data/sampleData.json') || {};
      data.facts = (data.facts || []).filter(fact => fact.id !== id);
      FileStorageService.writeData('./data/sampleData.json', data);
      res.status(200).json({ message: `Fato ${id} removido com sucesso.` });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Erro ao remover o fato', error: error.message });
    }
  }
}

module.exports = FactController;
