// Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  schedule: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  capacity: { type: Number },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Only admin can create
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);
