const express = require('express');
const router = express.Router();
const FactController = require('../controllers/factsController');

// Verifique se as funções estão definidas
router.get('/', FactController.getAll);
router.post('/', FactController.create);
router.delete('/:id', FactController.delete);

module.exports = router;
