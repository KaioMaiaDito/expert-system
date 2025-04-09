const { rules } = require('../data/sampleData.json');

exports.getRules = (req, res) => {
  res.json(rules);
};

exports.getRuleById = (req, res) => {
  const rule = rules.find(r => r.id === req.params.id);
  if (!rule) {
    return res.status(404).json({ message: 'Rule not found' });
  }
  res.json(rule);
};

exports.createRule = (req, res) => {
  const { id, condition, conclusion } = req.body;
  const newRule = { id, condition, conclusion };
  rules.push(newRule);
  res.status(201).json(newRule);
};

exports.deleteRule = (req, res) => {
  const index = rules.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Rule not found' });
  }
  rules.splice(index, 1);
  res.status(200).json({ message: 'Rule deleted successfully' });
};
