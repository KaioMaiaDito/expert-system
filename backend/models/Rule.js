// models/Rule.js
const FileStorageService = require('../services/fileStorageService');

class Rule {
  constructor({ id, condition, conclusion }) {
    this.id = id;
    // A condição agora pode ser um objeto complexo. Ela pode ter operadores lógicos "all" e "or"
    this.condition = condition;
    this.conclusion = conclusion;
  }

  static loadAll() {
    // Ajuste o caminho para o arquivo JSON onde os dados estão armazenados
    const data = FileStorageService.readData('./data/sampleData.json');
    if (!data || !data.rules) return [];
    return data.rules.map(ruleData => new Rule(ruleData));
  }
}

module.exports = Rule;
