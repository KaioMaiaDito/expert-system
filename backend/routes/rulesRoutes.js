const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/rulesController');

router.get('/', rulesController.getAll);
router.post('/', rulesController.create);
router.delete('/:id', rulesController.delete);

module.exports = router;
