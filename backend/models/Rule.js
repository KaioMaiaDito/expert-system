class Rule {
  constructor(id, condition, conclusion) {
    this.id = id;
    this.condition = condition;
    this.conclusion = conclusion;
  }

  // Exemplo de método de avaliação da regra com base em um conjunto de valores para os fatos.
  // O parâmetro factValues é um objeto no formato: { 'corre': 'sim', 'usa capa': 'sim', ... }
  evaluate(factValues) {
    return this.evaluateCondition(this.condition, factValues);
  }

  // Função recursiva para avaliar a condição (suporta operadores "all", "or" e "equals")
  evaluateCondition(condition, factValues) {
    if (condition.all) {
      return condition.all.every(cond =>
        this.evaluateCondition(cond, factValues)
      );
    }
    if (condition.or) {
      return condition.or.some(cond =>
        this.evaluateCondition(cond, factValues)
      );
    }
    if (condition.equals) {
      // condition.equals deve ter a forma: { fact: "nome do fato", value: "valor esperado" }
      const { fact, value } = condition.equals;
      return factValues[fact] === value;
    }
    return false;
  }
}

module.exports = Rule;
