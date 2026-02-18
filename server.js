const express = require('express');
const path = require('path');
const backendApp = require('./api/index');

const app = express();

// Servir arquivos estáticos da pasta public na raiz
app.use(express.static(path.join(__dirname, 'public')));

// Todas as rotas de API delegam para o backend (mantendo compatibilidade)
app.use('/api', backendApp);

// Para qualquer outra rota, retorna o index.html (SPA) ou o arquivo correspondente
// Rota catch-all para frontend (exceto /api)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
