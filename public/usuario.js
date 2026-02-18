const bcrypt = require('bcrypt');

app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const user = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id,name,email',
    [name, email, hash]
  );

  res.json(user.rows[0]);
});
