
const express = require('express');
const router = express.Router();
const {
  sendGymEnquiry,
  saveGymEnquiry,
  getAllGymEnquiries,
  getGymEnquiryById
} = require('../controllers/gymEnquiryController');
const { sendVerificationEmail, sendContactFormEmail } = require('../src/utils/nodemailer');

// Membership form verification
router.post('/membership/verify', async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000);
  try {
    await sendVerificationEmail(email, code);
    res.json({ message: 'Verification email sent', code });
  } catch (err) {
    res.status(500).json({ message: 'Error sending verification email', error: err.message });
  }
});

// Membership form submission (after verification)
router.post('/membership/submit', async (req, res) => {
  const { name, email, phone, question, code, userCode } = req.body;
  if (code && userCode && code.toString() === userCode.toString()) {
    try {
      await sendContactFormEmail(process.env.CONTACT_RECEIVER, req.body);
      res.json({ message: 'Membership form sent successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error sending membership form', error: err.message });
    }
  } else {
    res.status(400).json({ message: 'Verification code incorrect' });
  }
});


// Save gym enquiry (for demo, notifies and stores in memory)
router.post('/save', saveGymEnquiry);
// Get all gym enquiries
router.get('/', getAllGymEnquiries);
// Get single gym enquiry
router.get('/:id', getGymEnquiryById);
// Send gym enquiry (email only)
router.post('/', sendGymEnquiry);

// Contact form endpoint
router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message, inquiryType } = req.body;
  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000);
  try {
    // Send verification email first
    await sendVerificationEmail(email, code);
    // Save code in session or DB (for demo, just return)
    res.json({ message: 'Verification email sent', code });
  } catch (err) {
    res.status(500).json({ message: 'Error sending verification email', error: err.message });
  }
});

// After verification, send contact form email
router.post('/contact/submit', async (req, res) => {
  const { name, email, phone, subject, message, inquiryType, code, userCode } = req.body;
  // Only send mail if code matches
  if (code && userCode && code.toString() === userCode.toString()) {
    try {
      await sendContactFormEmail(process.env.CONTACT_RECEIVER, req.body);
      res.json({ message: 'Contact form sent successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error sending contact form', error: err.message });
    }
  } else {
    res.status(400).json({ message: 'Verification code incorrect' });
  }
});

module.exports = router;
