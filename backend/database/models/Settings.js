// ── database/models/Settings.js ──
// Single-document model — always one record with key = "main".
// Stores site contact info and the active logo filename.

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key:          { type: String, default: 'main', unique: true },
    siteName:     { type: String, default: 'Raizada CompuSoft', trim: true },
    tagline:      { type: String, default: 'Authorized Marg® ERP Solution Partner', trim: true },
    address:      { type: String, default: '', trim: true },
    phone1:       { type: String, default: '', trim: true },
    phone2:       { type: String, default: '', trim: true },
    phone3:       { type: String, default: '', trim: true },
    email:        { type: String, default: '', trim: true },
    whatsapp:     { type: String, default: '', trim: true },
    googleMapsUrl:{ type: String, default: '', trim: true },
    logoFile:     { type: String, default: null },
    marqueeEnabled: { type: Boolean, default: true },
    marqueeTitle: { type: String, default: 'Trusted by 5,000+ Businesses Across India', trim: true },
    marqueeImages: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
