const Fact = require('../models/Fact');
const Rule = require('../models/Rule');

class InferenceService {
  /**
   * Executa o motor de inferência utilizando os fatos e regras disponíveis.
   * Para cada regra, verifica se a condição é satisfeita pelos fatos e retorna as conclusões.
   *
   * @returns {Array} - Lista de conclusões disparadas.
   */
  static runInference() {
    const facts = Fact.loadAll();
    const rules = Rule.loadAll();
    const conclusions = [];

    rules.forEach(rule => {
      if (InferenceService.checkRule(rule.condition, facts)) {
        conclusions.push(rule.conclusion);
      }
    });

    return conclusions;
  }

  /**
   * Verifica se uma regra é satisfeita a partir dos fatos disponíveis.
   * Suporta condições simples (equals) e operadores lógicos "all" e "or".
   *
   * @param {Object} condition - A condição da regra.
   * @param {Array} facts - Lista de fatos.
   * @returns {Boolean} - Verdadeiro se a regra for satisfeita, falso caso contrário.
   */
  static checkRule(condition, facts) {
    // Se a condição tiver uma propriedade "all", todas as condições devem ser verdadeiras.
    if (condition.all) {
      return condition.all.every(cond =>
        InferenceService.checkRule(cond, facts)
      );
    }

    // Se a condição tiver uma propriedade "or", ao menos uma das condições deve ser verdadeira.
    if (condition.or) {
      return condition.or.some(cond => InferenceService.checkRule(cond, facts));
    }

    // Se a condição tiver o operador "equals".
    if (condition.equals) {
      // Para "equals", a chave representa o atributo e o valor desejado.
      const [key, value] = Object.entries(condition.equals)[0];

      // Verifica se algum fato contém o par "chave: valor" em sua descrição.
      return facts.some(fact => {
        // Aqui fazemos uma verificação simples de 'contém' para representar igualdade,
        // podendo ser adaptado para uma comparação mais robusta, se necessário.
        return fact.description.toLowerCase().includes(value.toLowerCase());
      });
    }

    // Se a condição não for reconhecida, retorna false.
    return false;
  }
}

module.exports = InferenceService;
