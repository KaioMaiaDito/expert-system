const { facts } = require('../data/sampleData.json');

exports.getFacts = (req, res) => {
  res.json(facts);
};

exports.getFactById = (req, res) => {
  const fact = facts.find(f => f.id === req.params.id);
  if (!fact) {
    return res.status(404).json({ message: 'Fact not found' });
  }
  res.json(fact);
};

exports.createFact = (req, res) => {
  const { id, name, type, possibleValues } = req.body;
  const newFact = { id, name, type, possibleValues };
  facts.push(newFact);
  res.status(201).json(newFact);
};

exports.deleteFact = (req, res) => {
  const index = facts.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Fact not found' });
  }
  facts.splice(index, 1);
  res.status(200).json({ message: 'Fact deleted successfully' });
};
