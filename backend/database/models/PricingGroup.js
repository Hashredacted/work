// ── database/models/PricingGroup.js ──
// One document per pricing group (erp, cloud, mobile_eorder, etc.)
// Each document holds an ordered array of pricing items.

const mongoose = require('mongoose');

const pricingItemSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },
    unit:  { type: String, default: '/yr', trim: true },
    note:  { type: String, default: '', trim: true },
  },
  { _id: false } // No separate _id per item — key is the identifier
);

const pricingGroupSchema = new mongoose.Schema(
  {
    group: { type: String, required: true, unique: true, trim: true },
    items: [pricingItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingGroup', pricingGroupSchema);
