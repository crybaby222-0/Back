const router = require('express').Router();
const { sign } = require('../auth');
require('dotenv').config();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const U = process.env.ADMIN_USER || 'admin';
  const P = process.env.ADMIN_PASS || 'admin123';
  if (username === U && password === P) {
    return res.json({ token: sign({ u: username, role: 'admin' }) });
  }
  res.status(401).json({ error: 'credenciais inválidas' });
});

module.exports = router;
