class Project {
  constructor(id, name, facts, rules, responsibleId) {
    this.id = id;
    this.name = name;
    // Espera-se que facts e rules sejam arrays de IDs (referências)
    this.facts = facts;
    this.rules = rules;
    this.responsibleId = responsibleId;
  }

  // Método para associar regras e fatos carregados do repositório de dados
  setDetails(factObjects, ruleObjects) {
    this.factObjects = factObjects;
    this.ruleObjects = ruleObjects;
  }
}

module.exports = Project;
