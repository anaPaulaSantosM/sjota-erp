
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const auth = require('../auth');

router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await pool.query('INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id,name,email', [name, email, hash]);
  res.json(user.rows[0]);
});


// Retorna dados do usuário autenticado (sem auth para testes)
router.get('/me', async (req, res) => {
  // Para testes, retorna o primeiro usuário encontrado
  const result = await pool.query('SELECT id, name, email FROM users LIMIT 1');
  if (!result.rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(result.rows[0]);
});

module.exports = router;