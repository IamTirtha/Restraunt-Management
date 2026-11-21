const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const userData = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register: always creates a customer
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const errors = [];
  if (!name || !/^[A-Za-z ]+$/.test(name)) errors.push("Name is required and can contain letters only");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Enter a valid email");
  if (!password || password.length < 6) errors.push("Password must be at least 6 characters");
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ token: makeToken(user._id), user: userData(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    res.json({ token: makeToken(user._id), user: userData(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;