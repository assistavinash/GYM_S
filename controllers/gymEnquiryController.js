
// const twilio = require('../utils/twilio');
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
