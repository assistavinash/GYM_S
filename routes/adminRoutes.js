const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  approveUser,
  deleteUser,
  createUserByAdmin,
} = require("../controllers/adminController");

const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

// All admin routes protected and role-restricted
router.get("/users", auth, authorize("admin"), getAllUsers);
router.patch("/users/:id/approve", auth, authorize("admin"), approveUser);
router.delete("/users/:id", auth, authorize("admin"), deleteUser);
router.post("/users", auth, authorize("admin"), createUserByAdmin);

module.exports = router;
