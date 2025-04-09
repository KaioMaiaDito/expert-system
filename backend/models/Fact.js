// models/Fact.js
const FileStorageService = require('../services/fileStorageService');

class Fact {
  constructor({ id, description }) {
    this.id = id;
    this.description = description;
  }

  static loadAll() {
    // Ajuste o caminho para o arquivo JSON onde os dados estão armazenados
    const data = FileStorageService.readData('./data/sampleData.json');
    if (!data || !data.facts) return [];
    return data.facts.map(factData => new Fact(factData));
  }
}

module.exports = Fact;