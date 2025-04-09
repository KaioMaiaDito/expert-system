const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');

router.get('/', projectsController.getAll);
router.post('/', projectsController.create);
router.delete('/:id', projectsController.delete);

module.exports = router;