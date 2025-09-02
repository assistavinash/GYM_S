const nodemailer = require('nodemailer');

async function sendVerificationEmail(to, code) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify your email for Power Point Gym',
    html: `<h2>Email Verification</h2><p>Your verification code is: <b>${code}</b></p>`
  };

  await transporter.sendMail(mailOptions);
  console.log('Mail sent to:', to);
}

async function sendContactFormEmail(to, formData) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Fallback to EMAIL_USER if CONTACT_RECEIVER is not set or empty
  const recipient = to || process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: `New Contact Form Submission from ${formData.name}`,
    html: `<h2>Contact Form Details</h2>
      <p><b>Name:</b> ${formData.name}</p>
      <p><b>Email:</b> ${formData.email}</p>
      <p><b>Phone:</b> ${formData.phone}</p>
      <p><b>Selected Plan:</b> ${formData.planName || 'N/A'}</p>
      <p><b>Plan Price:</b> ${formData.planPrice ? `₹${formData.planPrice}` : 'N/A'}</p>
      <p><b>Subject:</b> ${formData.subject || 'Membership Form'}</p>
      <p><b>Inquiry Type:</b> ${formData.inquiryType || 'Membership'}</p>
      <p><b>Message:</b> ${formData.message || formData.question || ''}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Contact form mail sent to:', to);
  } catch (err) {
    console.error('Error sending contact form mail:', err);
    throw err;
  }
}

module.exports = { sendVerificationEmail, sendContactFormEmail };
