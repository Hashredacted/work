// ── routes/auth.js ──
const express = require('express');
const jwt = require('jsonwebtoken');
const { ADMIN_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ token, expiresIn: JWT_EXPIRES_IN });
});

// GET /api/auth/me  — verify token is still valid
router.get('/me', requireAuth, (req, res) => {
  res.json({ role: req.admin.role, ok: true });
});

module.exports = router;
