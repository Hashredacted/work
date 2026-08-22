// ── routes/partners.js ──
const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const multer     = require('multer');
const requireAuth = require('../middleware/auth');
const Partner    = require('../database/models/Partner');

const router = express.Router();

// Multer storage — save to uploads/partners/
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, '../uploads/partners');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `partner_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are accepted.'));
  },
});

// GET /api/partners  — public: returns visible partners
// GET /api/partners?all=1  — admin: returns all partners
router.get('/', async (req, res, next) => {
  try {
    let items;
    if (req.query.all === '1') {
      items = await Partner.find({}).sort({ order: 1, createdAt: 1 });
    } else {
      items = await Partner.find({ visible: true }).sort({ order: 1, createdAt: 1 });
    }
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/partners — create (JSON, no file) — auth required
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, description, website, category, city, state, logo, visible, order } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required.' });

    const doc = await Partner.create({
      name: name.trim(),
      description: (description || '').trim(),
      website: (website || '').trim(),
      category: (category || 'Technology').trim(),
      city: (city || '').trim(),
      state: (state || '').trim(),
      logo: (logo || '').trim(),
      visible: visible !== false,
      order: Number(order) || 0,
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

// POST /api/partners/:id/logo — upload logo file — auth required
router.post('/:id/logo', requireAuth, upload.single('logo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: 'Partner not found.' });

    // Delete old logo file if it was uploaded (starts with /uploads/partners/)
    if (partner.logo && partner.logo.startsWith('/uploads/partners/')) {
      const old = path.join(__dirname, '..', partner.logo);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    partner.logo = `/uploads/partners/${req.file.filename}`;
    await partner.save();

    res.json({ ok: true, logo: partner.logo, partner });
  } catch (err) {
    next(err);
  }
});

// PUT /api/partners/:id — update fields (no file) — auth required
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: 'Partner not found.' });

    const { name, description, website, category, city, state, logo, visible, order } = req.body;
    if (name !== undefined)        partner.name        = name.trim();
    if (description !== undefined) partner.description = description.trim();
    if (website !== undefined)     partner.website     = website.trim();
    if (category !== undefined)    partner.category    = category.trim();
    if (city !== undefined)        partner.city        = city.trim();
    if (state !== undefined)       partner.state       = state.trim();
    if (logo !== undefined)        partner.logo        = logo.trim();
    if (visible !== undefined)     partner.visible     = visible;
    if (order !== undefined)       partner.order       = Number(order);

    await partner.save();
    res.json(partner);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/partners/:id — auth required
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ error: 'Partner not found.' });

    // Delete uploaded logo if exists
    if (partner.logo && partner.logo.startsWith('/uploads/partners/')) {
      const logoPath = path.join(__dirname, '..', partner.logo);
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
    }

    res.json({ ok: true, id: req.params.id });
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