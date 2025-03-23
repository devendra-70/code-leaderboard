//server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// User Schema
/*const UserSchema = new mongoose.Schema({
  name: String,
  score: Number,
  platform: String,
  ema: Number, // Exponential Moving Average
});
const User = mongoose.model("User", UserSchema);
*/

// API to get leaderboard
/*app.get("/api/leaderboard", async (req, res) => {
const users = await User.find().sort({ score: -1 });
  res.json(users);
}); 
*/

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
