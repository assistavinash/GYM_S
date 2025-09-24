
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
    let { email, password } = req.body;
    // Normalize inputs
    email = (email || '').trim().toLowerCase();
    password = (password || '').trim();

    if (!email || !password) {
      console.log('[LOGIN FAIL] Missing fields', { emailPresent: !!email, passwordPresent: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('[LOGIN ATTEMPT]', { email });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('[LOGIN FAIL] User not found:', email);
      return res.status(400).json({ message: 'User not found' });
    }
    if (!user.isVerified) {
      console.log('[LOGIN FAIL] Email not verified:', email);
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }
    if (!user.password) {
      console.log('[LOGIN FAIL] No local password (Google account):', email);
      return res.status(400).json({ message: 'Please login with Google' });
    }
    let isMatch = false;
    // Normal bcrypt comparison
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (cmpErr) {
      console.error('Bcrypt compare error (possibly malformed hash):', cmpErr);
    }

    // Legacy fallback: if stored password not hashed (does not start with $2)
    if (!isMatch && !user.password.startsWith('$2')) {
      if (user.password === password) {
        // Upgrade legacy plain password -> rely on pre-save hook to hash ONCE
        user.password = password; // assign plain; pre('save') will hash
        await user.save();
        isMatch = true;
        console.log('Upgraded legacy plain-text password for user (single-hash applied):', email);
      }
    }

    if (!isMatch) {
      // Optional dev-only auto remediation: inline password reset if caller sends autoFix flag
      if (process.env.NODE_ENV !== 'production' && req.body && req.body.autoFix === true) {
        console.log('[LOGIN AUTO-FIX] Resetting password inline for:', email);
        user.password = password; // plain, pre-save hook will hash
        await user.save();
        isMatch = true;
      }
    }

    if (!isMatch) {
      console.log('[LOGIN FAIL] Invalid credentials for:', email);
      if (process.env.NODE_ENV !== 'production') {
        return res.status(400).json({
          message: 'Invalid credentials',
          debug: {
            userFound: true,
            isVerified: user.isVerified,
            hasPassword: !!user.password,
            passwordIsBcrypt: !!user.password && user.password.startsWith('$2'),
            autoFixAvailable: true,
            usage: 'Send { email, password, autoFix:true } once to force-set password in dev',
            note: 'Do NOT enable autoFix in production'
          }
        });
      }
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
    console.log('[LOGIN OK]', { email, role: user.role });
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

// -------- DEV DEBUG HELPERS (Do NOT enable in production) -------- //
// Exposed separately (not exported above) to avoid accidental import elsewhere
module.exports.__dev = {
  async debugUserMeta(req, res) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not allowed in production' });
    }
    const email = (req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'email query required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      authProvider: user.authProvider,
      hasPassword: !!user.password,
      passwordIsBcrypt: !!user.password && user.password.startsWith('$2'),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },
  async debugSetPassword(req, res) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not allowed in production' });
    }
    const { email, newPassword, verify } = req.body || {};
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'email and newPassword required' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
  // Set plain new password; pre-save hook will hash exactly once. Avoid double-hash.
  user.password = newPassword.trim();
    if (verify === true && !user.isVerified) user.isVerified = true;
    await user.save();
    return res.json({
      message: 'Password set successfully',
      email: user.email,
      isVerified: user.isVerified,
      passwordIsBcrypt: user.password.startsWith('$2')
    });
  }
};
