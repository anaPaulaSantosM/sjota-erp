const express = require('express');
const router = express.Router();
const pool = require('../db');
// GET: lista todos os orçamentos
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM quotes');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { customer_id } = req.body;
  const result = await pool.query('INSERT INTO quotes (customer_id) VALUES ($1) RETURNING *', [customer_id]);
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { customer_id } = req.body;
  const { id } = req.params;
  if (!customer_id) {
    return res.status(400).json({ error: 'O campo customer_id é obrigatório.' });
  }
  try {
    const result = await pool.query(
      'UPDATE quotes SET customer_id = $1 WHERE id = $2 RETURNING *',
      [customer_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar orçamento.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir orçamento.' });
  }
});

module.exports = router;