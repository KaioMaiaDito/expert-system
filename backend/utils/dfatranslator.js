/**
 * Este arquivo demonstra como podemos converter uma regra, definida em nossos arquivos de data,
 * em um Autômato Finito Determinístico (DFA).
 *
 * A ideia é percorrer a estrutura da condição da regra (definida com operadores "equals", "all", "or")
 * e construir, recursivamente, um DFA que representará estas validações.
 *
 * Nota: Esta implementação é simplificada. Em uma aplicação real, a construção do DFA poderá
 * necessitar de ajustes dependendo dos requisitos de avaliação e da representação dos "fatos".
 */

// Classe que representa um estado do DFA
class State {
  constructor(id, isFinal = false) {
    this.id = id;
    this.isFinal = isFinal;
    // Transições: objeto onde a chave é o símbolo e o valor é o estado para o qual a transição ocorre
    this.transitions = {};
  }

  addTransition(symbol, nextState) {
    this.transitions[symbol] = nextState;
  }
}

// Classe que representa o DFA
class DFA {
  constructor(startState) {
    this.startState = startState;
    // Conjunto de estados para referência (útil para debug ou visualização)
    this.states = new Set();
    this.states.add(startState);
  }

  addState(state) {
    this.states.add(state);
  }

  /**
   * Método para executar o DFA dado um conjunto de valores para os fatos.
   * @param {Object} factValues - Ex: { 'corre': 'sim', 'usa capa': 'sim', ... }
   * @returns {boolean} - true se o DFA aceita a entrada, false caso contrário.
   */
  run(factValues) {
    let currentState = this.startState;
    while (true) {
      if (currentState.isFinal) return true;

      let transitionFound = false;
      // Verifica cada transição deste estado
      for (const symbol in currentState.transitions) {
        // Se usarmos transições epsilon, o símbolo inicia com 'ε'
        if (symbol.startsWith('ε')) {
          currentState = currentState.transitions[symbol];
          transitionFound = true;
          break;
        }
        // Para transições normais, o formato é "fact=value"
        const [fact, expectedValue] = symbol.split('=');
        if (factValues[fact] === expectedValue) {
          currentState = currentState.transitions[symbol];
          transitionFound = true;
          break;
        }
      }
      if (!transitionFound) return false;
    }
  }
}

/**
 * Função que traduz uma condição (usada na regra dos nossos arquivos de Data) para um DFA.
 *
 * A condição pode estar no formato:
 *
 * 1. equals: { equals: { fact: 'nomeDoFato', value: 'valorEsperado' } }
 * 2. all: { all: [ condition1, condition2, ... ] }
 * 3. or: { or: [ condition1, condition2, ... ] }
 *
 * @param {Object} condition - A condição da regra.
 * @param {string} statePrefix - Prefixo para identificar os estados, útil na recursão.
 * @returns {DFA}
 */
function translateConditionToDFA(condition, statePrefix = 's') {
  let stateCounter = 0;

  // Função auxiliar para gerar IDs de estados únicos
  const getNewStateId = () => `${statePrefix}${stateCounter++}`;

  // Função recursiva que constrói o DFA e retorna um objeto { dfa, start, finalStates }
  function buildDFA(cond) {
    if (cond.equals) {
      // Cria dois estados: inicial e final
      const start = new State(getNewStateId(), false);
      const final = new State(getNewStateId(), true);
      const { fact, value } = cond.equals;
      start.addTransition(`${fact}=${value}`, final);
      const dfa = new DFA(start);
      dfa.addState(final);
      return { dfa, start, finalStates: [final] };
    }

    if (cond.all) {
      // Para "all": encadeamos os DFAs dos subelementos em sequência.
      let currentDFA = null;
      let currentFinalStates = [];
      cond.all.forEach((subCond, index) => {
        const subDFAInfo = buildDFA(subCond);
        if (!currentDFA) {
          currentDFA = subDFAInfo.dfa;
          currentFinalStates = subDFAInfo.finalStates;
        } else {
          // Para cada estado final do DFA atual, adicione uma transição epsilon para o início do subDFA
          currentFinalStates.forEach(finalState => {
            // Remover o status final pois não será o estado final final
            finalState.isFinal = false;
            finalState.addTransition(
              `ε_${subDFAInfo.start.id}`,
              subDFAInfo.start
            );
          });
          // Atualizar os estados finais para os finais do subDFA
          currentFinalStates = subDFAInfo.finalStates;
          // Adicionar todos os estados do subDFA ao DFA combinado
          subDFAInfo.dfa.states.forEach(s => currentDFA.addState(s));
        }
      });
      return {
        dfa: currentDFA,
        start: currentDFA.startState,
        finalStates: currentFinalStates,
      };
    }

    if (cond.or) {
      // Para "or": cria um novo estado inicial que se ramifica para cada subDFA com uma transição epsilon.
      const newStart = new State(getNewStateId(), false);
      const combinedDFA = new DFA(newStart);
      let finalStates = [];
      cond.or.forEach(subCond => {
        const subDFAInfo = buildDFA(subCond);
        // Transição epsilon do novo estado para o início de cada subDFA
        newStart.addTransition(`ε_${subDFAInfo.start.id}`, subDFAInfo.start);
        // Adicione os estados do subDFA no DFA combinado
        subDFAInfo.dfa.states.forEach(s => combinedDFA.addState(s));
        finalStates = finalStates.concat(subDFAInfo.finalStates);
      });
      return { dfa: combinedDFA, start: newStart, finalStates };
    }

    // Caso não reconheça a condição, cria um DFA que rejeita (estado único que não é final)
    const rejectState = new State(getNewStateId(), false);
    const dfa = new DFA(rejectState);
    return { dfa, start: rejectState, finalStates: [] };
  }

  const { dfa } = buildDFA(condition);
  return dfa;
}

// Exporta as funções e classes para uso em outras partes do sistema (se necessário)
module.exports = {
  State,
  DFA,
  translateConditionToDFA,
};
