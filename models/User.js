const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    match: /^[0-9]{10}$/, // phone validation
    required: function() {
      return this.authProvider !== 'google'; // Only required for non-Google users
    }
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider !== 'google'; // Only required for non-Google users
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'trainer'],
    default: 'user',
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
  },
  verificationCodeExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to generate verification code
userSchema.methods.generateVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  this.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return code;
};

// Method to verify code
userSchema.methods.verifyCode = function(inputCode) {
  return this.verificationCode === inputCode && 
         this.verificationCodeExpires > new Date();
};

module.exports = mongoose.model("User", userSchema);
