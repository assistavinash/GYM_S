const User = require('../models/User');
const bcrypt = require('bcryptjs');


// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.requestReset = async (req, res) => {
    try {
        const { email, phone, method } = req.body;
        let user;
        let identifier;

        // Find user based on method
        if (method === 'email') {
            user = await User.findOne({ email });
            identifier = email;
        } else if (method === 'phone') {
            user = await User.findOne({ phone });
            identifier = phone;
        }

        if (!user) {
            return res.status(404).json({ 
                message: `No account found with this ${method === 'email' ? 'email' : 'phone number'}`
            });
        }

        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with timestamp (expires in 10 minutes)
        otpStore.set(identifier, {
            otp,
            timestamp: Date.now(),
            attempts: 0
        });


            // Send OTP via email if method is email
            if (method === 'email') {
                const { sendOTPEmail } = require('../utils/email');
                try {
                    await sendOTPEmail(email, otp);
                } catch (err) {
                    console.error('Error sending OTP email:', err);
                    return res.status(500).json({ message: 'Failed to send OTP email' });
                }
            }

        // Mask the identifier for privacy
        let maskedIdentifier;
        if (method === 'email') {
            const [username, domain] = identifier.split('@');
            maskedIdentifier = `${username.charAt(0)}****@${domain}`;
        } else {
            maskedIdentifier = identifier.replace(/(\d{2})(\d{6})(\d{2})/, '$1******$3');
        }

        res.status(200).json({ 
            message: `OTP sent successfully to ${maskedIdentifier}`,
            maskedIdentifier
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, phone, otp, newPassword } = req.body;
        const identifier = email || phone;

        // Validate OTP
        const otpData = otpStore.get(identifier);
        if (!otpData) {
            return res.status(400).json({ message: "OTP expired or not requested" });
        }

        // Check OTP expiration (10 minutes)
        if (Date.now() - otpData.timestamp > 10 * 60 * 1000) {
            otpStore.delete(identifier);
            return res.status(400).json({ message: "OTP expired" });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            otpData.attempts += 1;
            if (otpData.attempts >= 3) {
                otpStore.delete(identifier);
                return res.status(400).json({ message: "Too many incorrect attempts. Please request a new OTP" });
            }
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Find and update user
        const user = await User.findOne(email ? { email } : { phone });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Clear OTP
        otpStore.delete(email);

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// For demo: get all OTP requests (not for production)
exports.getAllOtpRequests = (req, res) => {
  const all = Array.from(otpStore.entries()).map(([identifier, data]) => ({ identifier, ...data }));
  res.json(all);
};

// For demo: get single OTP request by identifier (not for production)
exports.getOtpRequestByIdentifier = (req, res) => {
  const identifier = req.params.identifier;
  const data = otpStore.get(identifier);
  if (!data) return res.status(404).json({ message: 'OTP request not found' });
  res.json({ identifier, ...data });
};
