const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Function to calculate Exponential Moving Average
const calculateEMA = (scores, period = 7) => {
  if (scores.length === 0) return 0;
  let multiplier = 2 / (period + 1);
  return scores.reduce((ema, score, index) => {
    return index === 0 ? score.score : (score.score - ema) * multiplier + ema;
  }, 0);
};

// Fetch leaderboard
// Fetch leaderboard
router.get("/", async (req, res) => {
  try {
    const { platform } = req.query;
    let filter = platform ? { platform: platform } : {};

    const users = await User.find(filter).sort({ score: -1 });
    
    // Transform the data to match what your frontend expects
    const transformedUsers = users.map(user => ({
      username: user.name,  // Map 'name' to 'username'
      latestScore: user.score, // Map 'score' to 'latestScore'
      ema: user.ema,
      emaGrowth: user.ema - 980 // Just as an example, ideally calculate this properly
    }));

    // Return in the structure expected by your frontend
    res.json({
      data: transformedUsers,
      totalPages: 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
