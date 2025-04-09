const express = require('express');
const app = express();

// Middleware para processar JSON
app.use(express.json());

// Importando as rotas
const factsRoutes = require('./factsRoutes');
const rulesRoutes = require('./rulesRoutes');
const projectsRoutes = require('./projectsRoutes');
const responsibleRoutes = require('./responsibleRoutes');

// Configurando as rotas
app.use('/facts', factsRoutes);
app.use('/rules', rulesRoutes);
app.use('/projects', projectsRoutes);
app.use('/responsibles', responsibleRoutes);

// Middleware de erro (caso necessário)
const errorHandler = require('../middlewares/errorHandler');
app.use(errorHandler);

// Início do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;