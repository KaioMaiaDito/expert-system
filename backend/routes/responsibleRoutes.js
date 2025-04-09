const express = require('express');
const router = express.Router();
const responsibleController = require('../controllers/responsibleController');

router.get('/', responsibleController.getAll);
router.post('/', responsibleController.create);
router.delete('/:id', responsibleController.delete);

module.exports = router;
