const fs = require('fs');
const path = require('path');
const dfaSession = require('../models/DfaModel');

// Caminho para o arquivo sampleData.json
const sampleDataPath = path.join(__dirname, '../data/sampleData.json');

/**
 * Função auxiliar para ler e parsear o sampleData.json.
 */
function loadSampleData() {
  const data = fs.readFileSync(sampleDataPath, 'utf8');
  return JSON.parse(data);
}

/**
 * Função auxiliar para extrair os fatos de uma condição recursivamente.
 * Lida com as chaves equals, all e or.
 */
function extractFactsFromCondition(condition) {
  let facts = [];
  if (condition.equals) {
    facts.push(condition.equals.fact);
  } else if (condition.all) {
    condition.all.forEach(subCondition => {
      facts = facts.concat(extractFactsFromCondition(subCondition));
    });
  } else if (condition.or) {
    condition.or.forEach(subCondition => {
      facts = facts.concat(extractFactsFromCondition(subCondition));
    });
  }
  return facts;
}

/**
 * Função auxiliar para obter os possibleValues de um fato a partir do sampleData.
 * Se não encontrar, retorna o array padrão ["sim", "nao"].
 */
function getPossibleValuesForFact(factName) {
  const sampleData = loadSampleData();
  if (sampleData.facts && Array.isArray(sampleData.facts)) {
    const factDef = sampleData.facts.find(fact => fact.name === factName);
    if (factDef && factDef.possibleValues) {
      return factDef.possibleValues;
    }
  }
  return ['sim', 'nao'];
}

/**
 * Controller para iniciar a sessão do DFA.
 * - Carrega o sampleData.json.
 * - Seleciona todas as regras disponíveis e extrai os fatos (sem duplicatas).
 * - Cria um fluxo linear simples com os fatos extraídos.
 * - Reinicia a sessão armazenando o fluxo do DFA e os valores iniciais.
 * - Retorna a primeira pergunta junto com os possibleValues.
 */
const startSession = (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res
        .status(400)
        .json({ error: "O parâmetro 'projectId' é obrigatório." });
    }

    const sampleData = loadSampleData();

    // Filtra o projeto pelo ID (corrigido)
    const project = sampleData.projects.find(
      project => project.id === projectId
    );

    if (!project) {
      return res
        .status(404)
        .json({ error: 'Projeto não encontrado no sampleData.' });
    }

    // Obtém as regras associadas ao projeto
    const rules = sampleData.rules.filter(rule =>
      project.rules.includes(rule.id)
    );

    if (!rules || rules.length === 0) {
      return res.status(404).json({
        error: 'Nenhuma regra associada encontrada para este projeto.',
      });
    }

    // Armazena as regras do projeto na sessão para uso posterior
    dfaSession.projectRules = rules;

    // Extrai os fatos das regras associadas
    const factSet = new Set();
    rules.forEach(rule => {
      const facts = extractFactsFromCondition(rule.condition);
      facts.forEach(fact => factSet.add(fact));
    });

    // Cria um array com a ordem de inserção dos fatos
    const allFacts = Array.from(factSet);
    if (allFacts.length === 0) {
      return res
        .status(400)
        .json({ error: 'Nenhum fato extraído das regras associadas.' });
    }

    // Cria um fluxo linear simples para o DFA
    const dfa = {
      total: allFacts.length,
      facts: allFacts, // lista de fatos na ordem em que serão perguntados
    };

    // Reinicia a sessão do DFA
    dfaSession.reset();
    dfaSession.dfa = dfa;

    // Primeiro fato a ser perguntado
    const firstFact = dfa.facts[0];
    return res.json({
      message: 'Fluxo iniciado',
      nextQuestion: `Qual o valor para "${firstFact}"?`,
      possibleValues: getPossibleValuesForFact(firstFact),
      finished: false,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Erro ao iniciar a sessão do DFA.',
      details: err.message,
    });
  }
};

/**
 * Função auxiliar para avaliar uma condição recursivamente com base nos valores informados.
 * Suporta: equals, not.includes, all e or.
 */
function evaluateCondition(condition, factValues) {
  if (condition.equals) {
    const { fact, value } = condition.equals;
    const userAnswer = factValues[fact];
    if (Array.isArray(value)) {
      // Verifica interseção caso o valor esperado seja um array
      if (Array.isArray(userAnswer)) {
        return userAnswer.some(u => value.includes(u));
      }
      return value.includes(userAnswer);
    } else {
      if (Array.isArray(userAnswer)) {
        return userAnswer.includes(value);
      }
      return userAnswer === value;
    }
  } else if (condition.not && condition.not.includes) {
    const { fact, value: notValues } = condition.not.includes;
    const userAnswer = factValues[fact];
    if (Array.isArray(userAnswer)) {
      return !userAnswer.some(ua => notValues.includes(ua));
    }
    return !notValues.includes(userAnswer);
  } else if (condition.all) {
    return condition.all.every(subCondition =>
      evaluateCondition(subCondition, factValues)
    );
  } else if (condition.or) {
    return condition.or.some(subCondition =>
      evaluateCondition(subCondition, factValues)
    );
  }
  return false;
}

/**
 * Função auxiliar para avaliação parcial de uma condição.
 * Retorna:
 *   - true: se a condição pode ser considerada definitivamente satisfeita com as respostas atuais.
 *   - false: se a condição pode ser considerada definitivamente falsa.
 *   - undefined: se não há respostas suficientes para uma conclusão.
 */
function evaluateConditionPartial(condition, factValues) {
  if (condition.equals) {
    const { fact, value } = condition.equals;
    if (factValues.hasOwnProperty(fact)) {
      const userAnswer = factValues[fact];
      if (Array.isArray(value)) {
        if (Array.isArray(userAnswer)) {
          return userAnswer.some(u => value.includes(u));
        }
        return value.includes(userAnswer);
      } else {
        if (Array.isArray(userAnswer)) {
          return userAnswer.includes(value);
        }
        return userAnswer === value;
      }
    } else {
      return undefined;
    }
  } else if (condition.not && condition.not.includes) {
    const { fact, value: notValues } = condition.not.includes;
    if (factValues.hasOwnProperty(fact)) {
      const userAnswer = factValues[fact];
      if (Array.isArray(userAnswer)) {
        return !userAnswer.some(ua => notValues.includes(ua));
      }
      return !notValues.includes(userAnswer);
    } else {
      return undefined;
    }
  } else if (condition.all) {
    let result = true;
    for (const subCondition of condition.all) {
      const subResult = evaluateConditionPartial(subCondition, factValues);
      if (subResult === false) return false;
      if (subResult === undefined) result = undefined;
    }
    return result;
  } else if (condition.or) {
    let foundUndefined = false;
    for (const subCondition of condition.or) {
      const subResult = evaluateConditionPartial(subCondition, factValues);
      if (subResult === true) return true;
      if (subResult === undefined) foundUndefined = true;
    }
    return foundUndefined ? undefined : false;
  }
  return false;
}

/**
 * Controller para processar a resposta do usuário e retornar a próxima pergunta ou o resultado final.
 * - Atualiza os valores dos fatos na sessão.
 * - Se, após uma resposta, alguma regra for definitivamente verdadeira (com partial evaluation), retorna a conclusão.
 * - Caso contrário, solicita o próximo fato.
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

    // Atualiza o valor do fato respondido (aceitando string ou array)
    dfaSession.factValues[fact] = value;

    // Verifica se alguma regra do projeto já pode ser considerada definitivamente satisfeita
    for (let rule of dfaSession.projectRules) {
      const result = evaluateConditionPartial(
        rule.condition,
        dfaSession.factValues
      );
      if (result === true) {
        return res.json({
          finished: true,
          factValues: dfaSession.factValues,
          message: rule.conclusion,
        });
      }
    }

    // Determina o próximo fato pendente a partir do fluxo linear.
    const index = dfaSession.dfa.facts.indexOf(fact);
    let nextIndex = index + 1;
    while (
      nextIndex < dfaSession.dfa.total &&
      dfaSession.factValues.hasOwnProperty(dfaSession.dfa.facts[nextIndex])
    ) {
      nextIndex++;
    }

    if (nextIndex < dfaSession.dfa.total) {
      const nextFact = dfaSession.dfa.facts[nextIndex];
      return res.json({
        finished: false,
        nextQuestion: `Qual o valor para "${nextFact}"?`,
        possibleValues: getPossibleValuesForFact(nextFact),
      });
    } else {
      // Se todas as perguntas foram respondidas, avalia definitivamente as regras do projeto.
      const rules = dfaSession.projectRules || loadSampleData().rules;
      let matchedRule = null;
      for (let rule of rules) {
        if (evaluateCondition(rule.condition, dfaSession.factValues)) {
          matchedRule = rule;
          break;
        }
      }
      if (matchedRule) {
        return res.json({
          finished: true,
          factValues: dfaSession.factValues,
          message: matchedRule.conclusion,
        });
      } else {
        return res.json({
          finished: true,
          factValues: dfaSession.factValues,
          message: 'Nenhuma regra foi satisfeita com os valores informados.',
        });
      }
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Erro ao processar a resposta.', details: err.message });
  }
};

module.exports = { startSession, submitAnswer };
