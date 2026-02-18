
const express = require('express');
const cors = require('cors');
const auth = require('../backend/auth');
const userRoutes = require('../backend/routes/users');
const productRoutes = require('../backend/routes/products');
const customerRoutes = require('../backend/routes/customers');
const quoteRoutes = require('../backend/routes/quotes');
const salesOrderRoutes = require('../backend/routes/salesOrders');
const paymentMethodsRoutes = require('../backend/routes/paymentMethods');
const quoteItemsRoutes = require('../backend/routes/quote-items');
const salesOrderItemsRoutes = require('../backend/routes/salesOrderItems');

const app = express();
app.use(cors());
app.use(express.json());
// ...

app.post('/login', require('../backend/controllers/login'));
app.use('/users', userRoutes); // Cadastro de usuário sem auth
app.use(auth);
app.use('/products', productRoutes);
app.use('/customers', customerRoutes);
app.use('/quotes', quoteRoutes);
app.use('/sales-orders', salesOrderRoutes);
app.use('/payment-methods', paymentMethodsRoutes);
app.use('/quote-items', quoteItemsRoutes);
app.use('/sales-order-items', salesOrderItemsRoutes);

module.exports = app;