const express = require("express");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const TAX_RATE = 0.05; // 5% GST
const STATUSES = ["Placed", "Preparing", "Ready", "Delivered", "Cancelled"];
const round = (n) => Math.round(n * 100) / 100;

const canAccess = (order, user) =>
  user.role === "admin" || String(order.user._id || order.user) === String(user._id);

// POST /api/orders: place an order
router.post("/", async (req, res) => {
  const { items, orderType, tableNumber, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: "Your cart is empty" });
  if (!["Dine-in", "Takeaway"].includes(orderType))
    return res.status(400).json({ message: "Choose Dine-in or Takeaway" });
  if (orderType === "Dine-in" && !String(tableNumber || "").trim())
    return res.status(400).json({ message: "Table number is required for dine-in" });

  try {
    const orderItems = [];
    for (const line of items) {
      const qty = Number(line.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 20)
        return res.status(400).json({ message: "Quantity must be between 1 and 20" });

      const menuItem = await MenuItem.findById(line.menuItemId);
      if (!menuItem || !menuItem.available)
        return res.status(400).json({
          message: `${menuItem ? menuItem.name : "An item in your cart"} is no longer available`,
        });

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price, // price comes from the database
        quantity: qty,
      });
    }

    const subtotal = round(orderItems.reduce((s, i) => s + i.price * i.quantity, 0));
    const tax = round(subtotal * TAX_RATE);
    const total = round(subtotal + tax);

    const order = await Order.create({
      orderNumber: "ORD-" + Date.now().toString(36).toUpperCase(),
      user: req.user._id,
      items: orderItems,
      orderType,
      tableNumber: orderType === "Dine-in" ? String(tableNumber).trim() : "",
      notes: notes || "",
      subtotal,
      tax,
      total,
    });
    res.status(201).json(order);
  } catch (err) {
    const status = err.name === "CastError" ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
});

// GET /api/orders: admin sees all, customer sees own
router.get("/", async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id: one order (used by the invoice page)
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canAccess(order, req.user))
      return res.status(403).json({ message: "Not your order" });
    res.json(order);
  } catch (err) {
    const status = err.name === "CastError" ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status: admin changes the status
router.put("/:id/status", adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status))
    return res.status(400).json({ message: "Invalid status" });
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/cancel: customer cancels, only while still "Placed"
router.put("/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canAccess(order, req.user))
      return res.status(403).json({ message: "Not your order" });
    if (order.status !== "Placed")
      return res.status(400).json({ message: "Only orders that are still 'Placed' can be cancelled" });

    order.status = "Cancelled";
    await order.save();
    await order.populate("user", "name email");
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;