require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db'); // tumhara MongoDB connection file
const app = express();

// Parse JSON requests
app.use(express.json());

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL, // frontend URL from .env
  credentials: true
}));

// Connect to MongoDB
connectDB();

// Example route
app.get('/', (req, res) => {
  res.send(`API is running on port ${PORT}`);
});

// Use the PORT from environment (Vercel) or fallback to 3000 (local)
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
