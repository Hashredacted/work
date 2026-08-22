// ── config.js ──
// Central configuration — edit these values or override with environment variables.

module.exports = {
  PORT: process.env.PORT || 3001,

  // Admin password (change before production!)
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'RCS@2026',

  // JWT secret — set a long random string in production via env var
  JWT_SECRET: process.env.JWT_SECRET || 'rcs-super-secret-jwt-key-change-in-production',

  // Token expiry
  JWT_EXPIRES_IN: '8h',

  // Frontend folder path (relative to backend/)
  FRONTEND_DIR: '../frontend',

  // Uploads folder (relative to backend/)
  UPLOADS_DIR: './uploads',

  // MongoDB connection URI — override via MONGODB_URI env var or .env file
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rcs_admin',
};
