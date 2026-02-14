const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET: lista todas as formas de pagamento
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM payment_methods ORDER BY id');
  res.json(result.rows);
});

module.exports = router;
