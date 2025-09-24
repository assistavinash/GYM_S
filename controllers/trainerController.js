const Trainer = require('../models/Trainer');

exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trainers', error: err.message });
  }
};

exports.createManyTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.insertMany(req.body.trainers);
    res.status(201).json({ message: 'Trainers added', trainers });
  } catch (err) {
    res.status(500).json({ message: 'Error adding trainers', error: err.message });
  }
};


// Get single trainer by ID
exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json(trainer);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trainer', error: err.message });
  }
};

// Create single trainer (admin only)
exports.createTrainer = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admin can create trainers.' });
    }
    const trainer = await Trainer.create(req.body);
    res.status(201).json({ message: 'Trainer created', trainer });
  } catch (err) {
    res.status(500).json({ message: 'Error creating trainer', error: err.message });
  }
};

// Update trainer
exports.updateTrainer = async (req, res) => {
  try {
    const updated = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Trainer not found' });
    res.json({ message: 'Trainer updated', trainer: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating trainer', error: err.message });
  }
};

// Delete trainer
exports.deleteTrainer = async (req, res) => {
  try {
    const deleted = await Trainer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Trainer not found' });
    res.json({ message: 'Trainer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting trainer', error: err.message });
  }
};
