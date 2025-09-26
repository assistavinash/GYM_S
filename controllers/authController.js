
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to create JWT token
function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

// Register controller
async function register(req, res) {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin cannot be registered from UI' });
    }
    const newUser = new User({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      authProvider: 'local',
    });
    // Generate verification code and send email
    const code = newUser.generateVerificationCode();
    await newUser.save();
    try {
      const { sendVerificationEmail } = require('../utils/email');
      await sendVerificationEmail(email, code);
    } catch (mailErr) {
      console.error('Email send failed:', mailErr);
      // Even if email fails, user is created; allow client to request resend
    }

    console.log('New user registered (verification pending):', { name, email, role: newUser.role });
    // Do NOT set cookie yet; wait until verification
    res.status(201).json({
      message: 'Registration successful. Verification code sent to email.',
      verificationPending: true,
      userId: newUser._id,
      // For local dev you may expose code, but keep it commented in prod
      // devCode: code
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Get user controller
async function getUser(req, res) {
  try {
    // ✅ req.user middleware se aa raha hai, token verify ki zaroorat nahi
    // Token payload me 'id' store kiya gaya hai (not _id). Backward safety:
    const userId = req.user.id || req.user._id; // in case future tokens use _id
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    const user = await User.findById(userId).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User fetched successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      }
    });
  } catch (err) {
    console.error('GetUser error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Login controller
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }
    if (!user.password) {
      return res.status(400).json({ message: 'Please login with Google' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to false for localhost
      sameSite: 'lax', // Changed from 'strict' to 'lax'
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/'
    });
    console.log('User logged in:', { email, role: user.role });
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Logout controller
function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });
  res.status(200).json({ message: 'Logout successful' });
}

// Verify email via code
async function verifyEmail(req, res) {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ message: 'Missing parameters' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(200).json({ message: 'Already verified' });

    const valid = user.verifyCode(code);
    if (!valid) return res.status(400).json({ message: 'Invalid or expired code' });

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Set cookie now
    const token = createToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    return res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('verifyEmail error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Resend verification code
async function resendVerification(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    const code = user.generateVerificationCode();
    await user.save();
    try {
      const { sendVerificationEmail } = require('../utils/email');
      await sendVerificationEmail(user.email, code);
    } catch (mailErr) {
      console.error('Resend email failed:', mailErr);
    }
    return res.status(200).json({ message: 'Verification code resent' });
  } catch (err) {
    console.error('resendVerification error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  register,
  login,
  logout,
  getUser,
  verifyEmail,
  resendVerification,
};
