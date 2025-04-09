const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'sampleData.json');

const generateId = () => Date.now().toString();

const loadData = () => {
  return JSON.parse(fs.readFileSync(dataPath));
};

const saveData = data => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

module.exports = { generateId, loadData, saveData };
