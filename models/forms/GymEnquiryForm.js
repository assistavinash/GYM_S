const mongoose = require('mongoose');

const gymEnquiryFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String, required: true },
  goal: { type: String },
  time: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GymEnquiryForm', gymEnquiryFormSchema);
