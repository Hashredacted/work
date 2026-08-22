// -- database/models/Partner.js --
const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    website:     { type: String, default: '', trim: true },
    category:    { type: String, default: 'Technology', trim: true },
    city:        { type: String, default: '', trim: true },
    state:       { type: String, default: '', trim: true },
    logo:        { type: String, default: '', trim: true },
    visible:     { type: Boolean, default: true },
    order:       { type: Number, default: 0 },
  },
  {
    timestamps: true,
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

module.exports = mongoose.model('Partner', partnerSchema);
