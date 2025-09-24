const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  approveUser,
  deleteUser,
  createUserByAdmin,
  updateUserByAdmin
} = require("../controllers/adminController");

const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

// All admin routes protected and role-restricted

// Get all users
router.get("/users", auth, authorize("admin"), getAllUsers);
// Get single user
router.get("/users/:id", auth, authorize("admin"), getUserById);
// Approve user
router.patch("/users/:id/approve", auth, authorize("admin"), approveUser);
// Update user
router.put("/users/:id", auth, authorize("admin"), updateUserByAdmin);
// Delete user
router.delete("/users/:id", auth, authorize("admin"), deleteUser);
// Create user
router.post("/users", auth, authorize("admin"), createUserByAdmin);

module.exports = router;
