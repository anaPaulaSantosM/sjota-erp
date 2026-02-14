
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'mini-erp-secret';

module.exports = async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!user.rows.length) {
    return res.status(401).json({ error: 'Usuário inválido' });
  }
  const valido = await bcrypt.compare(password, user.rows[0].password);
  if (!valido) {
    return res.status(401).json({ error: 'Senha inválida' });
  }
  const token = jwt.sign({ id: user.rows[0].id, email }, SECRET, { expiresIn: '8h' });
  res.json({ token, name: user.rows[0].name });
};