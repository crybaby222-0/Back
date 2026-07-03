const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

module.exports = { sign, requireAuth, SECRET };
