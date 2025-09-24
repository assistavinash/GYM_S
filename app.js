const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // ✅ Required to read req.body JSON


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
