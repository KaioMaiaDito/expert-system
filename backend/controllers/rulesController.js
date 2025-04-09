const { generateId, loadData, saveData } = require('../utils/utils');

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

// Create a new rule with generated ID
const createRule = (req, res) => {
  const { conclusion, condition, facts: ruleFacts } = req.body;
  if (!conclusion || !condition) {
    return res
      .status(400)
      .json({ error: 'Conclusão e condição são obrigatórios.' });
  }
  const newRule = {
    id: generateId(),
    conclusion,
    condition,
    facts: Array.isArray(ruleFacts) ? ruleFacts : [],
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
