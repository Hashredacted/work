// ── routes/logo.js ──
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const requireAuth = require('../middleware/auth');
const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');

const router = express.Router();

// Multer storage — save to uploads/logo/
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, '../uploads/logo');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `logo_${Date.now()}${ext}`);
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

function readSettings() {
  return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
}

function writeSettings(data) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/logo — returns the active logo URL
router.get('/', (req, res) => {
  const settings = readSettings();
  if (settings.logoFile) {
    res.json({ url: `/uploads/logo/${settings.logoFile}`, custom: true });
  } else {
    res.json({ url: '/assets/logo.png', custom: false });
  }
});

// POST /api/logo — upload a new logo (multipart/form-data, field: "logo")
router.post('/', requireAuth, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  // Delete old custom logo if any
  const settings = readSettings();
  if (settings.logoFile) {
    const old = path.join(__dirname, '../uploads/logo', settings.logoFile);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  }

  settings.logoFile = req.file.filename;
  writeSettings(settings);

  res.json({
    ok: true,
    url: `/uploads/logo/${req.file.filename}`,
    filename: req.file.filename,
  });
});

// DELETE /api/logo — reset to default logo
router.delete('/', requireAuth, (req, res) => {
  const settings = readSettings();
  if (settings.logoFile) {
    const old = path.join(__dirname, '../uploads/logo', settings.logoFile);
    if (fs.existsSync(old)) fs.unlinkSync(old);
    settings.logoFile = null;
    writeSettings(settings);
  }
  res.json({ ok: true, url: '/assets/logo.png' });
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
