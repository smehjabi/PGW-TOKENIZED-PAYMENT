const mongoose = require('mongoose');

const bkashTokenSchema = new mongoose.Schema({
  id_token: { type: String, required: true },
  refresh_token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiry: { type: Date, required: true },
});

module.exports = mongoose.model('BkashToken', bkashTokenSchema);