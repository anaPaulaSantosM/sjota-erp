const express = require('express');
const router = express.Router();
const pool = require('../db');


router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM customers');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'O campo name é obrigatório.' });
  }
  const result = await pool.query('INSERT INTO customers (name, email, phone) VALUES ($1,$2,$3) RETURNING *', [name, email, phone]);
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, email, phone } = req.body;
  const { id } = req.params;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'O campo name é obrigatório.' });
  }
  try {
    const result = await pool.query(
      'UPDATE customers SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *',
      [name, email, phone, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;