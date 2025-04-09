const express = require('express');
const router = express.Router();
const dfaController = require('../controllers/dfaController');

// Endpoint para iniciar o fluxo do DFA
router.post('/start', dfaController.startSession);

// Endpoint para enviar uma resposta e obter a próxima pergunta ou resultado final
router.post('/answer', dfaController.submitAnswer);

module.exports = router;