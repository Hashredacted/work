// ── routes/pricing.js ──
const express = require('express');
const fs = require('fs');
const path = require('path');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/pricing.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/pricing — all groups (public)
router.get('/', (req, res) => {
  res.json(readData());
});

// GET /api/pricing/:group — single group (public)
router.get('/:group', (req, res) => {
  const data = readData();
  const group = req.params.group;
  if (!data[group]) return res.status(404).json({ error: `Group "${group}" not found.` });
  res.json(data[group]);
});

// PUT /api/pricing/:group — update a pricing group
router.put('/:group', requireAuth, (req, res) => {
  const group = req.params.group;
  const items = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Body must be an array of pricing items.' });
  }

  const data = readData();

  // Validate and sanitise each item
  data[group] = items.map(item => ({
    key: String(item.key || '').trim(),
    label: String(item.label || '').trim(),
    price: parseInt(item.price, 10) || 0,
    unit: item.unit !== undefined ? String(item.unit).trim() : '/yr',
    note: item.note !== undefined ? String(item.note).trim() : '',
  }));

  writeData(data);
  res.json(data[group]);
});

// POST /api/pricing/:group/item — add a new price item to a group
router.post('/:group/item', requireAuth, (req, res) => {
  const group = req.params.group;
  const { key, label, price, unit, note } = req.body;
  if (!label) return res.status(400).json({ error: 'Label is required.' });

  const data = readData();
  if (!data[group]) data[group] = [];

  const itemKey = key ? String(key).trim() : `item_${Date.now()}`;
  const newItem = {
    key: itemKey,
    label: String(label).trim(),
    price: parseInt(price, 10) || 0,
    unit: unit ? String(unit).trim() : '/yr',
    note: note ? String(note).trim() : '',
  };

  data[group].push(newItem);
  writeData(data);
  res.status(201).json(newItem);
});

// DELETE /api/pricing/:group/item/:key — delete an item from a group
router.delete('/:group/item/:key', requireAuth, (req, res) => {
  const { group, key } = req.params;
  const data = readData();
  if (!data[group]) return res.status(404).json({ error: 'Group not found.' });

  const before = data[group].length;
  data[group] = data[group].filter(item => item.key !== key);
  if (data[group].length === before) {
    return res.status(404).json({ error: 'Item not found in group.' });
  }

  writeData(data);
  res.json({ ok: true, key });
});

module.exports = router;
