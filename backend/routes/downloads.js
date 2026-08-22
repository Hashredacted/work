// ── routes/downloads.js ──
const express = require('express');
const requireAuth = require('../middleware/auth');
const Download = require('../database/models/Download');

const router = express.Router();

// GET /api/downloads — public (used by downloads.html)
router.get('/', async (req, res, next) => {
  try {
    if (req.query.all === '1') {
      const items = await Download.find({}).sort({ createdAt: 1 });
      return res.json(items);
    }
    const items = await Download.find({ visible: true }).sort({ createdAt: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET /api/downloads/all — admin: all entries regardless of visibility
router.get('/all', requireAuth, async (req, res, next) => {
  try {
    const items = await Download.find({}).sort({ createdAt: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/downloads — create
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, subtitle, category, platform, version, size, url, visible } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'name and url are required.' });

    const newItem = new Download({
      name: name.trim(),
      subtitle: (subtitle || '').trim(),
      category: category || 'erp',
      platform: (platform || '').trim(),
      version: (version || 'Latest').trim(),
      size: (size || '').trim(),
      url: url.trim(),
      visible: visible !== false,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

// PUT /api/downloads/:id — update
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, subtitle, category, platform, version, size, url, visible } = req.body;

    const item = await Download.findById(id);
    if (!item) return res.status(404).json({ error: 'Entry not found.' });

    if (name !== undefined) item.name = name.trim();
    if (subtitle !== undefined) item.subtitle = subtitle.trim();
    if (category !== undefined) item.category = category;
    if (platform !== undefined) item.platform = platform.trim();
    if (version !== undefined) item.version = version.trim();
    if (size !== undefined) item.size = size.trim();
    if (url !== undefined) item.url = url.trim();
    if (visible !== undefined) item.visible = visible;

    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/downloads/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Download.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ error: 'Entry not found.' });
    res.json({ ok: true, id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
