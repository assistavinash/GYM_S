const express = require('express');
const router = express.Router();
const {
	requestReset,
	resetPassword,
	getAllOtpRequests,
	getOtpRequestByIdentifier
} = require('../controllers/passwordResetController');


// Get all OTP requests (for demo)
router.get('/otp-requests', getAllOtpRequests);
// Get single OTP request by identifier (for demo)
router.get('/otp-requests/:identifier', getOtpRequestByIdentifier);
// Request password reset
router.post('/request-reset', requestReset);
// Reset password
router.post('/reset-password', resetPassword);

module.exports = router;
