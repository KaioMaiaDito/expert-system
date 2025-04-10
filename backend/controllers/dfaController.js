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
 * Função para normalizar strings (removendo acentos)
 */
function normalizeStr(str) {
  return typeof str === 'string'
    ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : str;
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
    const userAnswer = dfaSession.factValues[fact];
    if (Array.isArray(value)) {
      if (Array.isArray(userAnswer)) {
        // Compara normalizando cada valor
        return userAnswer.some(u =>
          value.map(v => normalizeStr(v)).includes(normalizeStr(u))
        );
      }
      return value.map(v => normalizeStr(v)).includes(normalizeStr(userAnswer));
    } else {
      if (Array.isArray(userAnswer)) {
        return userAnswer
          .map(u => normalizeStr(u))
          .includes(normalizeStr(value));
      }
      return normalizeStr(userAnswer) === normalizeStr(value);
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
 *   - true: se a condição está definitivamente satisfeita.
 *   - false: se a condição está definitivamente falsa.
 *   - undefined: se não há respostas suficientes.
 */
function evaluateConditionPartial(condition, factValues) {
  if (condition.equals) {
    const { fact, value } = condition.equals;
    if (!(fact in factValues)) return undefined;
    const userAnswer = factValues[fact];
    if (Array.isArray(value)) {
      return Array.isArray(userAnswer)
        ? userAnswer.some(u =>
            value.map(v => normalizeStr(v)).includes(normalizeStr(u))
          )
        : value.map(v => normalizeStr(v)).includes(normalizeStr(userAnswer));
    } else {
      return Array.isArray(userAnswer)
        ? userAnswer.map(u => normalizeStr(u)).includes(normalizeStr(value))
        : normalizeStr(userAnswer) === normalizeStr(value);
    }
  } else if (condition.not && condition.not.includes) {
    const { fact, value: notValues } = condition.not.includes;
    if (!(fact in factValues)) return undefined;
    const userAnswer = factValues[fact];
    if (Array.isArray(userAnswer)) {
      return !userAnswer.some(ua => notValues.includes(ua));
    }
    return !notValues.includes(userAnswer);
  } else if (condition.all) {
    let result = true;
    for (const subCondition of condition.all) {
      const subResult = evaluateConditionPartial(subCondition, factValues);
      if (subResult === false) return false;
      if (subResult === undefined) result = undefined;
    }
    return result;
  } else if (condition.or) {
    const subResults = condition.or.map(subCondition =>
      evaluateConditionPartial(subCondition, factValues)
    );
    return subResults.includes(true)
      ? true
      : subResults.includes(undefined)
      ? undefined
      : false;
  }
  return false;
}

/**
 * Função auxiliar para obter o valor esperado de um fato em uma condição.
 * Se a condição tiver um equals referente ao fato, retorna esse valor.
 * Para condições compostas, procura recursivamente.
 * Se a condição for um OR, retorna um array com os valores encontrados.
 * Retorna null se nenhum valor for encontrado.
 */
function getExpectedValueForFact(condition, factName) {
  if (condition.equals) {
    if (condition.equals.fact === factName) {
      return condition.equals.value;
    }
    return null;
  } else if (condition.all) {
    for (const subCondition of condition.all) {
      const result = getExpectedValueForFact(subCondition, factName);
      if (result !== null) return result;
    }
  } else if (condition.or) {
    let values = [];
    for (const subCondition of condition.or) {
      const result = getExpectedValueForFact(subCondition, factName);
      if (result !== null) {
        if (Array.isArray(result)) {
          values = values.concat(result);
        } else {
          values.push(result);
        }
      }
    }
    if (values.length > 0) return values;
  }
  return null;
}

/**
 * Controller para processar a resposta do usuário e retornar o próximo fato ou a conclusão.
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

    // Atualiza o fato respondido
    dfaSession.factValues[fact] = value;

    // Filtra as regras que ainda são possíveis (não descartadas pela avaliação parcial)
    const candidateRules = dfaSession.projectRules.filter(
      rule =>
        evaluateConditionPartial(rule.condition, dfaSession.factValues) !==
        false
    );

    // Se houver apenas uma regra candidata e ela possui todos os fatos necessários, finaliza
    if (candidateRules.length === 1) {
      const requiredFacts = extractFactsFromCondition(
        candidateRules[0].condition
      );
      if (requiredFacts.every(f => f in dfaSession.factValues)) {
        return res.json({
          finished: true,
          factValues: dfaSession.factValues,
          message: candidateRules[0].conclusion,
        });
      }
    }

    // Após extrair candidateRules e formar a união dos fatos necessários:
    const unionRequiredFacts = candidateRules.reduce((set, rule) => {
      extractFactsFromCondition(rule.condition).forEach(f => set.add(f));
      return set;
    }, new Set());

    // Modificação na lógica para definir o próximo fato a ser perguntado
    const nextFact = Array.from(unionRequiredFacts).find(f => {
      // Se o fato ainda não foi respondido, ele é escolhido normalmente.
      if (!(f in dfaSession.factValues)) return true;

      // Se já foi respondido, verifique se os candidateRules que usam esse fato têm valores esperados
      const candidateValues = candidateRules
        .filter(rule => extractFactsFromCondition(rule.condition).includes(f))
        .map(rule => getExpectedValueForFact(rule.condition, f))
        .filter(val => val !== null);

      // Achata os valores (caso haja arrays) e remove duplicatas
      let flatValues = [];
      candidateValues.forEach(val => {
        if (Array.isArray(val)) {
          flatValues = flatValues.concat(val);
        } else {
          flatValues.push(val);
        }
      });
      flatValues = [...new Set(flatValues)];

      // Se existir mais de um valor esperado, ou se o único valor não coincidir com a resposta atribuída,
      // considera o fato como pendente para resolução.
      if (
        flatValues.length > 1 ||
        (flatValues.length === 1 &&
          normalizeStr(flatValues[0]) !==
            normalizeStr(dfaSession.factValues[f]))
      ) {
        return true;
      }

      return false;
    });

    if (nextFact) {
      return res.json({
        finished: false,
        nextQuestion: `Qual o valor para "${nextFact}"?`,
        possibleValues: getPossibleValuesForFact(nextFact),
      });
    } else {
      // Se todos os fatos relevantes para as regras candidatas foram respondidos,
      // usa a avaliação completa para selecionar a regra final.
      // Em vez de usar find() simples, filtra as regras que realmente são satisfeitas
      // e escolhe a que tem maior "especificidade" (mais fatos necessários).
      const validCandidates = candidateRules.filter(
        rule =>
          evaluateCondition(rule.condition, dfaSession.factValues) === true
      );
      if (validCandidates.length > 0) {
        validCandidates.sort(
          (a, b) =>
            extractFactsFromCondition(b.condition).length -
            extractFactsFromCondition(a.condition).length
        );
        const finalRule = validCandidates[0];
        return res.json({
          finished: true,
          factValues: dfaSession.factValues,
          message: finalRule.conclusion,
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
    return res.status(500).json({
      error: 'Erro ao processar a resposta.',
      details: err.message,
    });
  }
};

module.exports = { startSession, submitAnswer };
