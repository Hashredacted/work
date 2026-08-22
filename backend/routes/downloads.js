// ── routes/downloads.js ──
const express = require('express');
const fs = require('fs');
const path = require('path');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/downloads.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map(d => d.id)) + 1 : 1;
}

// GET /api/downloads — public (used by downloads.html)
router.get('/', (req, res) => {
  const items = readData();
  // By default return only visible; pass ?all=1 (with auth) for everything
  if (req.query.all === '1') return res.json(items);
  res.json(items.filter(d => d.visible));
});

// GET /api/downloads/all — admin: all entries regardless of visibility
router.get('/all', requireAuth, (req, res) => {
  res.json(readData());
});

// POST /api/downloads — create
router.post('/', requireAuth, (req, res) => {
  const { name, subtitle, category, platform, version, size, url, visible } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'name and url are required.' });
  const items = readData();
  const newItem = {
    id: nextId(items),
    name: name.trim(),
    subtitle: (subtitle || '').trim(),
    category: category || 'erp',
    platform: (platform || '').trim(),
    version: (version || 'Latest').trim(),
    size: (size || '').trim(),
    url: url.trim(),
    visible: visible !== false,
  };
  items.push(newItem);
  writeData(items);
  res.status(201).json(newItem);
});

// PUT /api/downloads/:id — update
router.put('/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const items = readData();
  const idx = items.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Entry not found.' });

  const { name, subtitle, category, platform, version, size, url, visible } = req.body;
  items[idx] = {
    ...items[idx],
    name: (name || items[idx].name).trim(),
    subtitle: subtitle !== undefined ? subtitle.trim() : items[idx].subtitle,
    category: category || items[idx].category,
    platform: platform !== undefined ? platform.trim() : items[idx].platform,
    version: version !== undefined ? version.trim() : items[idx].version,
    size: size !== undefined ? size.trim() : items[idx].size,
    url: (url || items[idx].url).trim(),
    visible: visible !== undefined ? visible : items[idx].visible,
  };
  writeData(items);
  res.json(items[idx]);
});

// DELETE /api/downloads/:id
router.delete('/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  let items = readData();
  const before = items.length;
  items = items.filter(d => d.id !== id);
  if (items.length === before) return res.status(404).json({ error: 'Entry not found.' });
  writeData(items);
  res.json({ ok: true, id });
});

module.exports = router;
