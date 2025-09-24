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

function sendVerificationEmail(to, code) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Verify your PowerPoint Gym account',
        text: `Your email verification code is: ${code}. This code will expire in 10 minutes.`
    };
    return transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail, sendVerificationEmail };
