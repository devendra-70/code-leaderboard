const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  score: Number,
  platform: String,
  ema: Number, // Exponential Moving Average
});

// Only export the model, don't create it again if it exists
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);