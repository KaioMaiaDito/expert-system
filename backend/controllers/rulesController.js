const { generateId, loadData, saveData } = require('./utils');

// List all rules
const listRules = (req, res) => {
  const data = loadData();
  res.json(data.rules);
};

// Get a rule by ID
const getRuleById = (req, res) => {
  const ruleId = req.params.id;
  const data = loadData();
  const rule = data.rules.find(rule => rule.id === ruleId);
  if (!rule) {
    return res.status(404).json({ error: 'Regra não encontrada.' });
  }
  res.json(rule);
};

/*
  Improved createRule function.
  Instead of the simple string field "condition" and a list of facts,
  we now support associating facts to a rule with specified conditions.
  The expected payload should include:
    - conclusion: a string with the conclusion.
    - conditions: an array of condition objects.
      Each condition object must have:
        - factId: the ID of the associated fact.
        - operator: a string representing the condition (e.g., OR, AND, EQUAL, NOT_EQUAL).
        - value (optional): a value to compare, if applicable.
*/
const createRule = (req, res) => {
  const { conclusion, conditions } = req.body;

  if (!conclusion) {
    return res.status(400).json({ error: 'Conclusão é obrigatória.' });
  }

  if (!Array.isArray(conditions) || conditions.length === 0) {
    return res
      .status(400)
      .json({ error: 'Pelo menos uma condição é necessária.' });
  }

  // Define supported operators.
  const validOperators = ['OR', 'AND', 'EQUAL', 'NOT_EQUAL'];

  // Validate each condition.
  for (const cond of conditions) {
    if (!cond.factId || !cond.operator) {
      return res
        .status(400)
        .json({ error: 'Cada condição deve ter um factId e um operator.' });
    }
    if (!validOperators.includes(cond.operator.toUpperCase())) {
      return res.status(400).json({
        error: `Operador inválido: ${
          cond.operator
        }. Operadores válidos: ${validOperators.join(', ')}.`,
      });
    }
  }

  const newRule = {
    id: generateId(),
    conclusion,
    conditions,
  };

  const data = loadData();
  data.rules.push(newRule);
  saveData(data);
  res.status(201).json(newRule);
};

// Delete a rule if it is not used by any project or referenced by another rule
const deleteRule = (req, res) => {
  const ruleId = req.params.id;
  const data = loadData();

  const usedInProject = data.projects.some(
    project => project.rules && project.rules.includes(ruleId)
  );
  const usedInOtherRule = data.rules.some(
    rule => rule.dependencies && rule.dependencies.includes(ruleId)
  );

  if (usedInProject || usedInOtherRule) {
    return res
      .status(400)
      .json({ error: 'Regra em uso e não pode ser excluída.' });
  }

  const index = data.rules.findIndex(rule => rule.id === ruleId);
  if (index === -1) {
    return res.status(404).json({ error: 'Regra não encontrada.' });
  }
  data.rules.splice(index, 1);
  saveData(data);
  res.json({ message: 'Regra excluída com sucesso.' });
};

module.exports = {
  listRules,
  getRuleById,
  createRule,
  deleteRule,
};
