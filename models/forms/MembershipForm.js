const mongoose = require('mongoose');

const membershipFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  question: { type: String },
  plan: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MembershipForm', membershipFormSchema);
