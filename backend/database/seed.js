// ── database/seed.js ──
// Seed script: populates MongoDB if the collections are empty.
// Uses embedded defaultData.js (no external JSON files required).
//
// Can be run standalone:  node database/seed.js
// Or called automatically on server startup.

require('dotenv/config');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const { MONGODB_URI } = require('../config');
const Download = require('./models/Download');
const PricingGroup = require('./models/PricingGroup');
const Settings = require('./models/Settings');
const Partner = require('./models/Partner');
const defaultData = require('./defaultData');

const DATA_DIR = path.join(__dirname, '../data');

function getInitialData(type) {
  // If JSON files exist on disk, use them; otherwise use embedded defaults
  const jsonPath = path.join(DATA_DIR, `${type}.json`);
  if (fs.existsSync(jsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch {
      // fallback
    }
  }
  return defaultData[type];
}

async function seedIfEmpty() {
  // ── 1. Downloads ──────────────────────────────────────
  const dlCount = await Download.countDocuments();
  if (dlCount === 0) {
    const raw = getInitialData('downloads');
    const docs = raw.map(({ id, ...rest }) => rest);
    await Download.insertMany(docs);
    console.log(`  📦  Auto-seeded ${docs.length} downloads into MongoDB.`);
  }

  // ── 2. Pricing Groups ─────────────────────────────────
  const pgCount = await PricingGroup.countDocuments();
  if (pgCount === 0) {
    const raw = getInitialData('pricing');
    const docs = Object.entries(raw).map(([group, items]) => ({ group, items }));
    await PricingGroup.insertMany(docs);
    console.log(`  💰  Auto-seeded ${docs.length} pricing groups into MongoDB.`);
  }

  // ── 3. Settings ───────────────────────────────────────
  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    const raw = getInitialData('settings');
    await Settings.create({ key: 'main', ...raw });
    console.log('  ⚙️   Auto-seeded site settings into MongoDB.');
  }

  // ── 4. Partners ───────────────────────────────────────
  const partnerCount = await Partner.countDocuments();
  if (partnerCount === 0) {
    const raw = getInitialData('partners');
    await Partner.insertMany(raw);
    console.log(`  🤝  Auto-seeded ${raw.length} partners into MongoDB.`);
  }
}

async function runStandalone() {
  console.log('🍃  Connecting to MongoDB for seeding…');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅  MongoDB connected.');
  await seedIfEmpty();
  await mongoose.disconnect();
  console.log('🔌  Done. MongoDB disconnected.');
}

if (require.main === module) {
  runStandalone().catch(err => {
    console.error('❌  Seed error:', err.message);
    console.error('👉  Make sure MongoDB is running or configure MONGODB_URI in backend/.env');
    process.exit(1);
  });
}

module.exports = { seedIfEmpty };
