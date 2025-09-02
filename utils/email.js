const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function sendOTPEmail(to, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your PowerPoint Gym OTP',
        text: `Your OTP for password reset is: ${otp}`
    };
    return transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };
