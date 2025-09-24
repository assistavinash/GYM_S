
const nodemailer = require('nodemailer');


exports.sendGymEnquiry = async (req, res) => {
  try {
    const { name, whatsapp, email, goal, time } = req.body;
    const message = `New Gym Enquiry:\nName: ${name}\nWhatsApp: ${whatsapp}\nEmail: ${email}\nGoal: ${goal}\nTime: ${time}`;

  // SMS/WhatsApp sending removed as per user request

    // Send email using nodemailer
    // Configure transporter (use your own SMTP credentials)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Gym Enquiry Received',
      text: message
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Enquiry sent!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Dummy in-memory storage for demo (replace with DB in production)
let gymEnquiries = [];

// Save gym enquiry (for GET endpoints)
exports.saveGymEnquiry = async (req, res) => {
  try {
    const enquiry = req.body;
    enquiry.id = gymEnquiries.length + 1;
    gymEnquiries.push(enquiry);
    res.status(201).json({ message: 'Enquiry saved', enquiry });
  } catch (err) {
    res.status(500).json({ message: 'Error saving enquiry', error: err.message });
  }
};

// Get all gym enquiries
exports.getAllGymEnquiries = async (req, res) => {
  try {
    res.json(gymEnquiries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enquiries', error: err.message });
  }
};

// Get single gym enquiry by ID
exports.getGymEnquiryById = async (req, res) => {
  try {
    const enquiry = gymEnquiries.find(e => e.id === parseInt(req.params.id));
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(enquiry);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enquiry', error: err.message });
  }
};
