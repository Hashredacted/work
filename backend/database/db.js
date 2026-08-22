// ── database/db.js ──
// Establishes and exports the Mongoose connection.
// Called once at server startup in server.js.

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5s timeout instead of 30s
    });
    console.log('  🍃  MongoDB connected →', MONGODB_URI.replace(/:\/\/.*@/, '://***@'));
  } catch (err) {
    console.error('');
    console.error('  ❌  MongoDB connection failed:', err.message);
    console.error('  👉  Make sure MongoDB is running locally, or set MONGODB_URI in backend/.env');
    console.error('      Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/rcs_admin');
    console.error('');
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('  ⚠️   MongoDB disconnected.');
});

module.exports = connectDB;
