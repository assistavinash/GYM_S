const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        console.log('Received credential:', credential);
        console.log('Using CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        // Find existing user by email
        const user = await User.findOne({ email });

        // Block new Google registrations: require pre-registered account
        if (!user) {
            return res.status(403).json({
                message:
                    'Please register with email/password first and verify your email to enable Google login.',
            });
        }

        // Require verified email before allowing Google login
        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Please verify your email to use Google login.',
            });
        }

        // Issue JWT and set httpOnly cookie (consistent with normal login)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // set true behind HTTPS/proxy
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

        return res.json({
            message: 'Google login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Google auth error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
        });
        return res.status(401).json({
            message: 'Google authentication failed',
            error: error.message,
        });
    }
};
