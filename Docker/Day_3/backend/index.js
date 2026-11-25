
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);

// Health check
app.get("/", (req, res) => {
  res.send("Express API is running!");
});

// Create user
app.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Hello, Server running on port ${PORT}!`);
});
