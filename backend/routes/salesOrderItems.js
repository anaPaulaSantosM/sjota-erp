const express = require('express');
const router = express.Router();
const pool = require('../db');

// Lista todos os itens de pedidos com informações de cliente e produto
router.get('/', async (req, res) => {
  const result = await pool.query(`
    SELECT soi.id, soi.sales_order_id, soi.product_id, soi.quantity, soi.price,
           so.customer_id, so.status as order_status,
           c.name as customer_name, p.name as product_name
    FROM sales_order_items soi
    JOIN sales_orders so ON soi.sales_order_id = so.id
    JOIN customers c ON so.customer_id = c.id
    JOIN products p ON soi.product_id = p.id
    ORDER BY soi.id DESC
  `);
  res.json(result.rows);
});

// Excluir item do pedido
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM sales_order_items WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// Atualizar item do pedido (exemplo simples)
router.put('/:id', async (req, res) => {
  const { quantity, price } = req.body;
  // Busca quantidade anterior e produto
  const itemResult = await pool.query('SELECT quantity, product_id FROM sales_order_items WHERE id = $1', [req.params.id]);
  if (itemResult.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' });
  const oldQuantity = itemResult.rows[0].quantity;
  const productId = itemResult.rows[0].product_id;
  // Atualiza item
  const result = await pool.query(
    'UPDATE sales_order_items SET quantity = $1, price = $2 WHERE id = $3 RETURNING *',
    [quantity, price, req.params.id]
  );
  // Ajusta estoque do produto
  const diff = oldQuantity - quantity;
  if (diff !== 0) {
    await pool.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [diff, productId]);
  }
  res.json(result.rows[0]);
});

module.exports = router;
