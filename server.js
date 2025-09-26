require('dotenv').config();
const app = require('./app');
const connectDB = require('./db/db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.get('/', (req, res) => {
  res.send('API is running...');
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});
