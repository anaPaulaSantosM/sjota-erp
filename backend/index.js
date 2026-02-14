
const express = require('express');
const cors = require('cors');
const auth = require('./auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const quoteRoutes = require('./routes/quotes');
const salesOrderRoutes = require('./routes/salesOrders');
const paymentMethodsRoutes = require('./routes/paymentMethods');
const quoteItemsRoutes = require('./routes/quote-items');
const salesOrderItemsRoutes = require('./routes/salesOrderItems');

const app = express();
app.use(cors());
app.use(express.json());
// Servir arquivos estáticos da pasta public antes do auth
app.use('/public', express.static('frontend/public'));

app.post('/login', require('./controllers/login'));
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