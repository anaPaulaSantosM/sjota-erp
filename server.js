const express = require('express');
const path = require('path');
const backendApp = require('./api/index');

const app = express();

// Servir arquivos estáticos da pasta public na raiz
app.use(express.static(path.join(__dirname, 'public')));

// Todas as rotas de API delegam para o backend (mantendo compatibilidade)
app.use('/api', backendApp);


// Fallback: se não encontrar arquivo estático, retorna index.html (SPA)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

module.exports = app;
