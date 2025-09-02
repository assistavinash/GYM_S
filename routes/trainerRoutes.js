const express = require('express');
const router = express.Router();
const { getAllTrainers, createManyTrainers } = require('../controllers/trainerController');

router.get('/', getAllTrainers);
router.post('/bulk', createManyTrainers);

module.exports = router;
