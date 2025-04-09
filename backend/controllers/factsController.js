const { generateId, loadData, saveData } = require('../utils/utils');

// List all facts
const listFacts = (req, res) => {
  const data = loadData();
  res.json(data.facts);
};

// Get a fact by ID
const getFactById = (req, res) => {
  const factId = req.params.id;
  const data = loadData();
  const fact = data.facts.find(fact => fact.id === factId);
  if (!fact) {
    return res.status(404).json({ error: 'Fato não encontrado.' });
  }
  res.json(fact);
};

// Create a new fact with generated ID
const createFact = (req, res) => {
  const { name, type, possibleValues } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Nome e tipo são obrigatórios.' });
  }
  let newFact;
  if (type === 'boolean') {
    newFact = {
      id: generateId(),
      name,
      type,
      possibleValues: ['sim', 'não'],
    };
  } else {
    // Ensure possibleValues is a string so that trim() can be called
    let possibleValuesStr = possibleValues;
    if (typeof possibleValues !== 'string') {
      possibleValuesStr = String(possibleValues);
    }
    if (!possibleValuesStr.trim()) {
      return res.status(400).json({
        error: 'Valores possíveis são obrigatórios para tipo string.',
      });
    }
    newFact = {
      id: generateId(),
      name,
      type,
      possibleValues: possibleValuesStr.split(',').map(v => v.trim()),
    };
  }
  const data = loadData();
  data.facts.push(newFact);
  saveData(data);
  res.status(201).json(newFact);
};

// Delete a fact if it is not used by any project or rule
const deleteFact = (req, res) => {
  const factId = req.params.id;
  const data = loadData();

  // Check if the fact is in use by any project or rule
  const usedInProject = data.projects.some(
    project => project.facts && project.facts.includes(factId)
  );
  const usedInRule = data.rules.some(
    rule => rule.facts && rule.facts.includes(factId)
  );

  if (usedInProject || usedInRule) {
    return res
      .status(400)
      .json({ error: 'Fato em uso e não pode ser excluído.' });
  }

  const index = data.facts.findIndex(fact => fact.id === factId);
  if (index === -1) {
    return res.status(404).json({ error: 'Fato não encontrado.' });
  }
  data.facts.splice(index, 1);
  saveData(data);
  res.json({ message: 'Fato excluído com sucesso.' });
};

module.exports = {
  listFacts,
  getFactById,
  createFact,
  deleteFact,
};
