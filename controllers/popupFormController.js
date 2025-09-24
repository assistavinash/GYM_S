const PopupForm = require('../models/PopupForm');

// Submit popup/feedback form
exports.submitPopupForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }
    const form = await PopupForm.create({ name, email, phone, message });
    res.status(201).json({ message: 'Form submitted successfully!', form });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting form', error: err.message });
  }
};

// (Optional) Get all popup forms (admin only)
exports.getAllPopupForms = async (req, res) => {
  try {
    const forms = await PopupForm.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching forms', error: err.message });
  }
};
