// ── config.js ──
// Central configuration — edit these values to customise the deployment.

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
};
