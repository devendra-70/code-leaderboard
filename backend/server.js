//server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron"); // Add this line to import node-cron

// Import the Codeforces Scraper
const CodeforcesScraper = require("./scraper/codeforces.js");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// Initialize Codeforces Scraper
const cfScraper = new CodeforcesScraper();

// API routes
app.use("/api/leaderboard", require("./routes/leaderboard"));

// API to add dummy users
app.get("/api/populate", async (req, res) => {
  await User.deleteMany({});
  await User.insertMany([
    { name: "Alice", score: 1200, platform: "leetcode", ema: 1180 },
    { name: "Bob", score: 1150, platform: "codechef", ema: 1120 },
    { name: "Charlie", score: 1100, platform: "codeforces", ema: 1000 },
    { name: "David", score: 1050, platform: "leetcode", ema: 1020 },
    { name: "Eve", score: 1025, platform: "codeforces", ema: 990 },
  ]);
  res.json({ message: "Dummy users added!" });
});

// Manual trigger for Codeforces update
app.get("/api/update-codeforces", async (req, res) => {
  try {
    await cfScraper.scheduledUpdate();
    res.json({ message: "Codeforces users updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scheduled daily update for Codeforces users
cron.schedule('0 0 * * *', () => {
  console.log('Running daily Codeforces user update');
  cfScraper.scheduledUpdate();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
