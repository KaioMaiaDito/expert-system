const Rule = require('../models/Rule');
const FileStorageService = require('../services/fileStorageService');

class RuleController {
  // Retorna todas as regras do arquivo JSON
  static getAll(req, res) {
    try {
      const rules = Rule.loadAll();
      res.status(200).json(rules);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Erro ao carregar as regras', error: error.message });
    }
  }

  // Cria uma nova regra e persiste no arquivo JSON
  static create(req, res) {
    try {
      const newRule = req.body;
      const data = FileStorageService.readData('./data/sampleData.json') || {};
      data.rules = data.rules || [];
      data.rules.push(newRule);
      FileStorageService.writeData('./data/sampleData.json', data);
      res.status(201).json(newRule);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Erro ao criar a regra', error: error.message });
    }
  }

  // Exclui uma regra baseado em seu id
  static delete(req, res) {
    try {
      const { id } = req.params;
      const data = FileStorageService.readData('./data/sampleData.json') || {};
      data.rules = (data.rules || []).filter(rule => rule.id !== id);
      FileStorageService.writeData('./data/sampleData.json', data);
      res.status(200).json({ message: `Regra ${id} removida com sucesso.` });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Erro ao remover a regra', error: error.message });
    }
  }
}

module.exports = RuleController;
