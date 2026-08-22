// ── routes/settings.js ──
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const requireAuth = require('../middleware/auth');
const Settings = require('../database/models/Settings');

const router = express.Router();

// Multer storage for marquee photos — save to uploads/marquee/
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, '../uploads/marquee');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `marquee_${Date.now()}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per photo
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are accepted.'));
  },
});

async function getOrCreateSettings() {
  let doc = await Settings.findOne({ key: 'main' });
  if (!doc) {
    doc = await Settings.create({ key: 'main' });
  }
  return doc;
}

// GET /api/settings — public (used by frontend for contact info, marquee, etc.)
router.get('/', async (req, res, next) => {
  try {
    const doc = await getOrCreateSettings();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings — update site settings including marquee toggle & title
router.put('/', requireAuth, async (req, res, next) => {
  try {
    const allowed = [
      'siteName', 'tagline', 'address',
      'phone1', 'phone2', 'phone3',
      'email', 'whatsapp', 'googleMapsUrl',
      'marqueeTitle',
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = String(req.body[key]).trim();
      }
    }

    if (req.body.marqueeEnabled !== undefined) {
      updates.marqueeEnabled = Boolean(req.body.marqueeEnabled);
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

// POST /api/settings/marquee/upload — upload one or more photos to the marquee
router.post('/marquee/upload', requireAuth, upload.array('photos', 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded.' });
    }

    const doc = await getOrCreateSettings();
    const newPaths = req.files.map(f => `/uploads/marquee/${f.filename}`);

    doc.marqueeImages = [...(doc.marqueeImages || []), ...newPaths];
    await doc.save();

    res.json({
      ok: true,
      added: newPaths,
      marqueeImages: doc.marqueeImages,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/settings/marquee/image — delete a photo from the marquee
router.delete('/marquee/image', requireAuth, async (req, res, next) => {
  try {
    const { imagePath } = req.body;
    if (!imagePath) return res.status(400).json({ error: 'imagePath is required.' });

    const doc = await getOrCreateSettings();
    doc.marqueeImages = (doc.marqueeImages || []).filter(p => p !== imagePath);
    await doc.save();

    // Delete file from disk if it starts with /uploads/marquee/
    if (imagePath.startsWith('/uploads/marquee/')) {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    res.json({
      ok: true,
      marqueeImages: doc.marqueeImages,
    });
  } catch (err) {
    next(err);
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;

