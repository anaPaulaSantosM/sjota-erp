

const pool = require('../db');
const bcrypt = require('bcrypt');

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
  // Retorna apenas o nome do usuário, sem token
  res.json({ name: user.rows[0].name });
};