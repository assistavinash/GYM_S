// Trainer.js
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  specialization: { type: [String] },
  experience: { type: Number },
  certifications: { type: [String] },
  bio: { type: String },
  image: { type: String },
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Only admin can create
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trainer', trainerSchema);
