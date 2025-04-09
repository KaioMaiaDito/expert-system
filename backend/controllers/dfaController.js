const dfaSession = require('../models/DfaModel');
const { translateConditionToDFA } = require('../utils/dfatranslator');

// Exemplo de condição para a regra. Em uma aplicação real, isso pode vir do banco de dados.
const condition = {
  all: [
    { equals: { fact: 'corre', value: 'sim' } },
    { equals: { fact: 'usa capa', value: 'sim' } },
  ],
};

// Cria o DFA usando a condição definida.
const dfa = translateConditionToDFA(condition);

/**
 * Função auxiliar para computar o estado atual do DFA com base
 * nos valores coletados dos fatos até o momento.
 *
 * @param {DFA} dfa - O autômato finito determinístico.
 * @param {Object} factValues - Respostas parciais, por exemplo, { corre: "sim" }.
 * @returns {Object} - { currentState, pendingFact, finished }
 */
function computeCurrentState(dfa, factValues) {
  let currentState = dfa.startState;
  let pendingFact = null;

  while (true) {
    if (currentState.isFinal) {
      return { currentState, pendingFact: null, finished: true };
    }

    let transitionTaken = false;
    for (const symbol in currentState.transitions) {
      // Transição epsilon: avança sem consumir fato
      if (symbol.startsWith('ε')) {
        currentState = currentState.transitions[symbol];
        transitionTaken = true;
        break;
      }
      // Transição no formato "fact=value"
      const [fact, expected] = symbol.split('=');
      if (fact in factValues) {
        if (factValues[fact] === expected) {
          currentState = currentState.transitions[symbol];
          transitionTaken = true;
          break;
        } else {
          // Se foi respondido e não bate, não há transição possível
          return { currentState, pendingFact: null, finished: false };
        }
      } else {
        pendingFact = fact;
        return { currentState, pendingFact, finished: false };
      }
    }
    if (!transitionTaken) {
      return { currentState, pendingFact, finished: false };
    }
  }
}

/**
 * Controller para iniciar a sessão do DFA.
 * Reinicia o estado e retorna a primeira pergunta.
 */
const startSession = (req, res) => {
  dfaSession.reset();
  const { pendingFact, finished } = computeCurrentState(
    dfa,
    dfaSession.factValues
  );
  if (finished) {
    return res.json({
      message: 'Regra satisfeita!',
      finished: true,
      factValues: dfaSession.factValues,
    });
  } else if (pendingFact) {
    return res.json({
      message: 'Fluxo iniciado',
      nextQuestion: `Qual o valor para "${pendingFact}"?`,
      finished: false,
    });
  }
  return res
    .status(400)
    .json({ error: 'Não foi possível iniciar o fluxo DFA.' });
};

/**
 * Controller para processar a resposta do usuário e retornar a próxima pergunta ou o resultado final.
 */
const submitAnswer = (req, res) => {
  const { fact, value } = req.body;
  if (!fact || !value) {
    return res
      .status(400)
      .json({ error: "Parâmetros 'fact' e 'value' são obrigatórios." });
  }

  dfaSession.factValues[fact] = value;
  const { pendingFact, finished } = computeCurrentState(
    dfa,
    dfaSession.factValues
  );

  if (finished) {
    return res.json({
      finished: true,
      factValues: dfaSession.factValues,
      message: 'Regra satisfeita!',
    });
  } else if (pendingFact) {
    return res.json({
      finished: false,
      nextQuestion: `Qual o valor para "${pendingFact}"?`,
    });
  }
  return res
    .status(400)
    .json({ error: 'Fluxo inválido ou sem transição possível.' });
};

module.exports = { startSession, submitAnswer };
