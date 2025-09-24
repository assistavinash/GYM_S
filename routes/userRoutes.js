const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// Get all users
router.get('/', auth, getAllUsers);
// Get single user
router.get('/:id', auth, getUserById);
// Create user
router.post('/', createUser);
// Update user
router.put('/:id', auth, updateUser);
// Delete user
router.delete('/:id', auth, deleteUser);

module.exports = router;
