// ── routes/pricing.js ──
const express = require('express');
const requireAuth = require('../middleware/auth');
const PricingGroup = require('../database/models/PricingGroup');

const router = express.Router();

// GET /api/pricing — all groups (public)
router.get('/', async (req, res, next) => {
  try {
    const groups = await PricingGroup.find({});
    // Format into object matching old JSON shape: { [group]: items }
    const result = {};
    groups.forEach(g => {
      result[g.group] = g.items;
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/pricing/:group — single group (public)
router.get('/:group', async (req, res, next) => {
  try {
    const groupName = req.params.group;
    const doc = await PricingGroup.findOne({ group: groupName });
    if (!doc) return res.status(404).json({ error: `Group "${groupName}" not found.` });
    res.json(doc.items);
  } catch (err) {
    next(err);
  }
});

// PUT /api/pricing/:group — update a pricing group
router.put('/:group', requireAuth, async (req, res, next) => {
  try {
    const groupName = req.params.group;
    const items = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Body must be an array of pricing items.' });
    }

    // Validate and sanitize each item
    const sanitized = items.map(item => ({
      key: String(item.key || '').trim(),
      label: String(item.label || '').trim(),
      price: parseInt(item.price, 10) || 0,
      unit: item.unit !== undefined ? String(item.unit).trim() : '/yr',
      note: item.note !== undefined ? String(item.note).trim() : '',
    }));

    const doc = await PricingGroup.findOneAndUpdate(
      { group: groupName },
      { group: groupName, items: sanitized },
      { new: true, upsert: true }
    );

    res.json(doc.items);
  } catch (err) {
    next(err);
  }
});

// POST /api/pricing/:group/item — add a new price item to a group
router.post('/:group/item', requireAuth, async (req, res, next) => {
  try {
    const groupName = req.params.group;
    const { key, label, price, unit, note } = req.body;
    if (!label) return res.status(400).json({ error: 'Label is required.' });

    let doc = await PricingGroup.findOne({ group: groupName });
    if (!doc) {
      doc = new PricingGroup({ group: groupName, items: [] });
    }

    const itemKey = key ? String(key).trim() : `item_${Date.now()}`;
    const newItem = {
      key: itemKey,
      label: String(label).trim(),
      price: parseInt(price, 10) || 0,
      unit: unit ? String(unit).trim() : '/yr',
      note: note ? String(note).trim() : '',
    };

    doc.items.push(newItem);
    await doc.save();
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pricing/:group/item/:key — delete an item from a group
router.delete('/:group/item/:key', requireAuth, async (req, res, next) => {
  try {
    const { group: groupName, key } = req.params;
    const doc = await PricingGroup.findOne({ group: groupName });
    if (!doc) return res.status(404).json({ error: 'Group not found.' });

    const before = doc.items.length;
    doc.items = doc.items.filter(item => item.key !== key);
    if (doc.items.length === before) {
      return res.status(404).json({ error: 'Item not found in group.' });
    }

    await doc.save();
    res.json({ ok: true, key });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
