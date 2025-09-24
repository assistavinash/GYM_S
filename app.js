const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// ===== CORS configuration =====
// You can supply a comma separated list in ALLOWED_ORIGINS, e.g.
// ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-frontend.vercel.app
const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];

// Merge & de-duplicate
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

// If you also want to allow all Vercel preview URLs, uncomment below:
// const allowVercelPreviews = true;
// function isAllowedOrigin(origin) {
//   if (!origin) return true; // non-browser or same-origin requests
//   if (allowedOrigins.includes(origin)) return true;
//   if (allowVercelPreviews && /\.vercel\.app$/.test(new URL(origin).hostname)) return true;
//   return false;
// }

app.use(cors({
  origin: function(origin, callback) {
    // Handle non-browser requests (like curl / server-to-server) which have no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Optional preview handling (see commented function above)
    // if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // ✅ Required to read req.body JSON
app.use(cookieParser()); // ✅ Needed so auth middleware can read JWT from cookies


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
