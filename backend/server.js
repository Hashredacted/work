// ══════════════════════════════════════════════════
//  server.js — Raizada CompuSoft Admin Backend
//  Express serves BOTH the frontend static files
//  AND the /api routes from a single process.
//
//  Start:  node server.js   (or: npm start)
//  Port:   3001  (override with PORT env var)
// ══════════════════════════════════════════════════

// Load .env variables before anything else
require('dotenv/config');

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const { PORT, FRONTEND_DIR, UPLOADS_DIR } = require('./config');
const connectDB = require('./database/db');
const { seedIfEmpty } = require('./database/seed');

const app = express();

// ── Ensure required directories exist ──
const uploadsLogoDir = path.join(__dirname, UPLOADS_DIR, 'logo');
fs.mkdirSync(uploadsLogoDir, { recursive: true });

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded files (logo, etc.) ──
app.use('/uploads', express.static(path.join(__dirname, UPLOADS_DIR)));

// ── Serve frontend static files ──
const frontendPath = path.resolve(__dirname, FRONTEND_DIR);
app.use(express.static(frontendPath));

// ── API Routes ──
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/downloads', require('./routes/downloads'));
app.use('/api/pricing',   require('./routes/pricing'));
app.use('/api/logo',      require('./routes/logo'));
app.use('/api/settings',  require('./routes/settings'));

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'mongodb',
    name: 'Raizada CompuSoft Admin API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 for unknown API routes ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// ── Catch-all: serve index.html for any non-API path (SPA fallback) ──
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Global error handler ──
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

// ── Connect to MongoDB, auto-seed if needed, then start HTTP server ──
connectDB()
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('  ✅  Raizada CompuSoft Admin Server');
      console.log(`  🌐  Site      →  http://localhost:${PORT}`);
      console.log(`  🔒  Admin     →  http://localhost:${PORT}/admin.html`);
      console.log(`  🛠️  API       →  http://localhost:${PORT}/api`);
      console.log(`  📁  Frontend  →  ${frontendPath}`);
      console.log('');
    });
  });
