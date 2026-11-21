const express = require("express");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const { Booking } = require("../models/Booking");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET /api/admin/stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const [customers, menuItems, reservations, orders, revenueAgg] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      MenuItem.countDocuments(),
      Booking.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);
    res.json({
      customers,
      menuItems,
      reservations,
      orders,
      revenue: revenueAgg.length ? revenueAgg[0].total : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;