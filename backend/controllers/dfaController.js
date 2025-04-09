const fs = require('fs');
const path = require('path');
const { translateConditionToDFA } = require('../utils/dfaTranslator');

// Caminho para o arquivo sampleData.json
const sampleDataPath = path.join(__dirname, '../data/sampleData.json');

// Objeto para armazenar a sessão do DFA
const dfaSession = {
  factValues: {},
  dfa: null,
};

// Função auxiliar para ler e parsear o sampleData.json
function loadSampleData() {
  const data = fs.readFileSync(sampleDataPath, 'utf8');
  return JSON.parse(data);
}

/**
 * Função auxiliar para computar o estado atual do DFA com base
 * nos valores coletados dos fatos até o momento.
 *
 * @param {Object} dfa - O autômato finito determinístico.
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
 * - Carrega o sampleData.json.
 * - Seleciona uma regra (neste exemplo, a "rule-1").
 * - Constrói o DFA a partir da condição da regra.
 * - Reinicia a sessão armazenando o dfa e factValues.
 * - Retorna a primeira pergunta.
 */
const startSession = (req, res) => {
  try {
    const sampleData = loadSampleData();
    // Seleciona a regra desejada; aqui usamos a "rule-1" como exemplo.
    const rule = sampleData.rules.find(r => r.id === 'rule-1');
    if (!rule) {
      return res
        .status(404)
        .json({ error: "Regra 'rule-1' não encontrada no sampleData." });
    }
    // Converte a condição da regra para um DFA
    const dfa = translateConditionToDFA(rule.condition, 's');
    // Reinicia a sessão do DFA
    dfaSession.factValues = {};
    dfaSession.dfa = dfa;

    const { pendingFact, finished } = computeCurrentState(
      dfaSession.dfa,
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
  } catch (err) {
    return res.status(500).json({
      error: 'Erro ao iniciar a sessão do DFA.',
      details: err.message,
    });
  }
};

/**
 * Controller para processar a resposta do usuário e retornar
 * a próxima pergunta ou o resultado final.
 */
const submitAnswer = (req, res) => {
  try {
    const { fact, value } = req.body;
    if (!fact || !value) {
      return res
        .status(400)
        .json({ error: "Parâmetros 'fact' e 'value' são obrigatórios." });
    }
    if (!dfaSession.dfa) {
      return res.status(400).json({
        error: 'Sessão não iniciada. Inicie o fluxo do DFA primeiro.',
      });
    }

    // Atualiza a sessão com a resposta do usuário
    dfaSession.factValues[fact] = value;
    const { pendingFact, finished } = computeCurrentState(
      dfaSession.dfa,
      dfaSession.factValues
    );

    if (finished) {
      // Aqui também poderíamos buscar a conclusão da regra no sampleData, se necessário.
      const sampleData = loadSampleData();
      const rule = sampleData.rules.find(r => r.id === 'rule-1');
      return res.json({
        finished: true,
        factValues: dfaSession.factValues,
        message: rule.conclusion,
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
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Erro ao processar a resposta.', details: err.message });
  }
};

module.exports = { startSession, submitAnswer };
