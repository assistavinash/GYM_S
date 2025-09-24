const express = require('express');
const router = express.Router();
const { submitPopupForm, getAllPopupForms } = require('../controllers/popupFormController');

// Submit popup/feedback form
router.post('/', submitPopupForm);

// (Optional) Get all forms (admin only, add auth if needed)
router.get('/', getAllPopupForms);

module.exports = router;
