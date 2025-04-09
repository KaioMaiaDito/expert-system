const { responsibles } = require('../data/sampleData.json');

exports.getResponsibles = (req, res) => {
  res.json(responsibles);
};

exports.getResponsibleById = (req, res) => {
  const responsible = responsibles.find(r => r.id === req.params.id);
  if (!responsible) {
    return res.status(404).json({ message: 'Responsible not found' });
  }
  res.json(responsible);
};

exports.createResponsible = (req, res) => {
  const { id, name } = req.body;
  const newResponsible = { id, name };
  responsibles.push(newResponsible);
  res.status(201).json(newResponsible);
};

exports.deleteResponsible = (req, res) => {
  const index = responsibles.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Responsible not found' });
  }
  responsibles.splice(index, 1);
  res.status(200).json({ message: 'Responsible deleted successfully' });
};
