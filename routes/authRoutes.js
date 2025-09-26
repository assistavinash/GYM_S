const express = require("express");
const router = express.Router();
const { register, login, logout, getUser, verifyEmail, resendVerification } = require("../controllers/authController");
const { googleLogin } = require("../controllers/googleAuthController");
const auth = require("../middleware/auth"); // ✅ Import middleware

// Register and login: POST
router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyEmail);
router.post("/resend-code", resendVerification);

// User and logout: GET - ✅ Add middleware to protected routes
router.get("/user", auth, getUser); // ✅ Protected route
router.get("/logout", logout);
router.post("/google", googleLogin);

module.exports = router;