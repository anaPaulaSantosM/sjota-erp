const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM sales_orders');
  res.json(result.rows);
});

router.post('/from-quote/:quoteId', async (req, res) => {
  const quoteId = req.params.quoteId;
  const quote = await pool.query('SELECT * FROM quotes WHERE id = $1', [quoteId]);
  const order = await pool.query('INSERT INTO sales_orders (quote_id, customer_id) VALUES ($1,$2) RETURNING *', [quoteId, quote.rows[0].customer_id]);
  await pool.query(`INSERT INTO sales_order_items (sales_order_id, product_id, quantity, price) SELECT $1, product_id, quantity, priceunitario FROM quote_items WHERE quote_id = $2`, [order.rows[0].id, quoteId]);
  res.json(order.rows[0]);
});

router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;
  await pool.query('UPDATE sales_orders SET status = $1 WHERE id = $2', [status, orderId]);
  if (status === 'Produção') {
    await pool.query(`UPDATE products p SET stock = stock - i.quantity FROM sales_order_items i WHERE p.id = i.product_id AND i.sales_order_id = $1`, [orderId]);
  }
  res.json({ success: true });
});

module.exports = router;