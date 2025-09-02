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
