const User = require("../models/User");

// Get all users and trainers
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // You can filter by role if needed
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Approve a new user/trainer
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User approved ✅", user });
  } catch (err) {
    res.status(500).json({ message: "Error approving user", error: err.message });
  }
};

// Delete user/trainer
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted ❌" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

// Admin creates new user/trainer
exports.createUserByAdmin = async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      isApproved: true // Admin-created users are auto-approved
    });

    res.status(201).json({ message: "User created by admin ✅", user });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
};


// Get single user by ID (admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

// Update user by ID (admin)
exports.updateUserByAdmin = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};
