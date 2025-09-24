const express = require('express');
const router = express.Router();
const {
	getAllTrainers,
	createManyTrainers,
	getTrainerById,
	createTrainer,
	updateTrainer,
	deleteTrainer
} = require('../controllers/trainerController');


// Get all trainers
router.get('/', getAllTrainers);
// Get single trainer
router.get('/:id', getTrainerById);
// Create single trainer
router.post('/', createTrainer);
// Bulk create trainers
router.post('/bulk', createManyTrainers);
// Update trainer
router.put('/:id', updateTrainer);
// Delete trainer
router.delete('/:id', deleteTrainer);

module.exports = router;
