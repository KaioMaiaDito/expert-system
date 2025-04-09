const express = require('express');
const cors = require('cors');
const app = express();

// Configura o CORS para permitir requisições de qualquer origem
app.use(cors());

// Se desejar, você pode personalizar a configuração do CORS:
app.use(
  cors({
    origin: 'http://localhost:5173', // Url do seu frontend ou array de urls permitidas
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Suas rotas aqui
app.use('/projects', require('./routes/projectsRoutes'));
app.use('/rules', require('./routes/rulesRoutes'));
app.use('/facts', require('./routes/factsRoutes'));
app.use('/responsibles', require('./routes/responsibleRoutes'));

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
