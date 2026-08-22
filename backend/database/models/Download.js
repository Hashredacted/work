// ── database/models/Download.js ──
const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    category: { type: String, default: 'erp', trim: true },
    platform: { type: String, default: '', trim: true },
    version:  { type: String, default: 'Latest', trim: true },
    size:     { type: String, default: '', trim: true },
    url:      { type: String, required: true, trim: true },
    visible:  { type: Boolean, default: true },
  },
  {
    timestamps: true,
    // Expose _id as "id" in JSON (string), matching the old numeric id field
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Download', downloadSchema);
