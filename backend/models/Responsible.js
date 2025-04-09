// models/Responsible.js
const FileStorageService = require('../services/fileStorageService');

class Responsible {
  constructor({ id, name, email }) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  static loadAll() {
    // Ajuste o caminho para o arquivo JSON onde os dados estão armazenados
    const data = FileStorageService.readData('./data/sampleData.json');
    if (!data || !data.responsibles) return [];
    return data.responsibles.map(respData => new Responsible(respData));
  }
}

module.exports = Responsible;