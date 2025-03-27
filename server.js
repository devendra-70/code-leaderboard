const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import Routes
const userRoutes = require('./routes/userRoutes');
const leaderboardRoutes = require('./routes/leaderboard');  // ✅ Add this

app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);  // ✅ Register leaderboard routes

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
