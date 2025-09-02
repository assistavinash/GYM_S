const express = require("express");
const cors = require("cors");
const app = express();

require('dotenv').config();
// CORS configuration using .env
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
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


app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enquiry", gymEnquiryRoutes);

app.use("/api/classes", classRoutes);

// Root route - Show backend status directly on localhost:3000
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>PowerPoint Gym Backend</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            border-radius: 10px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
          }
          h1 { margin: 0 0 1rem 0; }
          .status { color: #4ade80; font-weight: bold; }
          .info { margin-top: 1rem; opacity: 0.8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏋️ PowerPoint Gym Backend</h1>
          <div class="status">✅ Backend is Running Successfully!</div>
          <div class="info">
            <p>🌐 Server: http://localhost:3000</p>
            <p>📱 Frontend: http://localhost:5173</p>
            <p>⚡ Status: Online & Ready</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Health check route for frontend
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

module.exports = app;
