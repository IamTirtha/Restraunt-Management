const express = require("express");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const { Booking } = require("../models/Booking");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET /api/admin/stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const [customers, menuItems, reservations] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      MenuItem.countDocuments(),
      Booking.countDocuments(),
    ]);
    res.json({ customers, menuItems, reservations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;