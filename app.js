const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// ===== CORS configuration =====
const defaultOrigins = ["http://localhost:5173", "http://localhost:3000"];

const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // ✅ Allow server-to-server / curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("❌ Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ===== Middleware =====
app.use(express.json());       // ✅ Parse JSON body
app.use(cookieParser());       // ✅ Read cookies (for JWT)

// ===== Routes =====
const authRoutes = require("./routes/authRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gymEnquiryRoutes = require("./routes/gymEnquiryRoutes");
const classRoutes = require("./routes/classRoutes");
const userRoutes = require("./routes/userRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const popupFormRoutes = require("./routes/popupFormRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enquiry", gymEnquiryRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/popup-form", popupFormRoutes);

module.exports = app;
