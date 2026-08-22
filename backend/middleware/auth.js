// ── auth.js middleware ──
// Verifies the JWT Bearer token on protected routes.

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

module.exports = function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — token missing.' });
  }

  const token = header.split(' ')[1];
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token.' });
  }
};
