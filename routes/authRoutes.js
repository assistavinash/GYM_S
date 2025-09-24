const express = require("express");
const router = express.Router();
const { register, login, logout, getUser, verifyEmail, resendVerification } = require("../controllers/authController");
// Dev helpers
const devHelpers = require('../controllers/authController').__dev;
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

// Dev-only debug routes
if (process.env.NODE_ENV !== 'production' && devHelpers) {
	router.get('/debug-user', devHelpers.debugUserMeta);
	router.post('/debug-set-password', devHelpers.debugSetPassword);
}

module.exports = router;