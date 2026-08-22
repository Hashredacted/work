// ── routes/settings.js ──
const express = require('express');
const fs = require('fs');
const path = require('path');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/settings.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/settings — public (used by frontend for contact info, etc.)
router.get('/', (req, res) => {
  const data = readData();
  // Don't expose sensitive internal keys publicly if needed (currently all public)
  res.json(data);
});

// PUT /api/settings — update site settings
router.put('/', requireAuth, (req, res) => {
  const allowed = [
    'siteName', 'tagline', 'address',
    'phone1', 'phone2', 'phone3',
    'email', 'whatsapp', 'googleMapsUrl',
  ];
  const current = readData();
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      current[key] = String(req.body[key]).trim();
    }
  }
  writeData(current);
  res.json(current);
});

module.exports = router;
