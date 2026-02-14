const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM products');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, price, stock } = req.body;
  const result = await pool.query('INSERT INTO products (name, price, stock) VALUES ($1,$2,$3) RETURNING *', [name, price, stock]);
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, price, stock } = req.body;
  const { id } = req.params;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'O campo name é obrigatório.' });
  }
  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4 RETURNING *',
      [name, price, stock, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar produto.' });
  }
});

module.exports = router;