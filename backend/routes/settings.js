// ── routes/settings.js ──
const express = require('express');
const requireAuth = require('../middleware/auth');
const Settings = require('../database/models/Settings');

const router = express.Router();

async function getOrCreateSettings() {
  let doc = await Settings.findOne({ key: 'main' });
  if (!doc) {
    doc = await Settings.create({ key: 'main' });
  }
  return doc;
}

// GET /api/settings — public (used by frontend for contact info, etc.)
router.get('/', async (req, res, next) => {
  try {
    const doc = await getOrCreateSettings();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings — update site settings
router.put('/', requireAuth, async (req, res, next) => {
  try {
    const allowed = [
      'siteName', 'tagline', 'address',
      'phone1', 'phone2', 'phone3',
      'email', 'whatsapp', 'googleMapsUrl',
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = String(req.body[key]).trim();
      }
    }

    const doc = await Settings.findOneAndUpdate(
      { key: 'main' },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
