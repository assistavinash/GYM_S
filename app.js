const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// ✅ CORS configuration (keep it simple)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL, // ⚠️ ek hi frontend origin rakho
    credentials: true, // allow cookies
  })
);

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Routes import
const authRoutes = require("./routes/authRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gymEnquiryRoutes = require("./routes/gymEnquiryRoutes");
const classRoutes = require("./routes/classRoutes");
const userRoutes = require("./routes/userRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const popupFormRoutes = require("./routes/popupFormRoutes");

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enquiry", gymEnquiryRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/popup-form", popupFormRoutes);

module.exports = app;
