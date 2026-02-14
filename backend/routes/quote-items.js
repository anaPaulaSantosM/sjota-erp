const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quote_items ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar itens de orçamento.' });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const { quote_id, product_id, quantity, priceunitario, pricetotal } = req.body;

    const result = await pool.query(
      `INSERT INTO quote_items 
       (quote_id, product_id, quantity, priceunitario, pricetotal) 
       VALUES ($1,$2,$3,$4,$5) 
       RETURNING *`,
      [
        Number(quote_id),
        Number(product_id),
        Number(quantity),
        Number(priceunitario),
        Number(pricetotal)
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar item de orçamento.' });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  try {
    const { quote_id, product_id, quantity, priceunitario, pricetotal } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE quote_items 
       SET quote_id = $1,
           product_id = $2,
           quantity = $3,
           priceunitario = $4,
           pricetotal = $5
       WHERE id = $6
       RETURNING *`,
      [
        Number(quote_id),
        Number(product_id),
        Number(quantity),
        Number(priceunitario),
        Number(pricetotal),
        Number(id)
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar item de orçamento.' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM quote_items WHERE id = $1', [Number(id)]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir item.' });
  }
});

module.exports = router;
