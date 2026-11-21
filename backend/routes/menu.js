const express = require("express");
const MenuItem = require("../models/MenuItem");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

const errorStatus = (err) => (err.name === "ValidationError" ? 400 : 500);

// GET /api/menu (public)
router.get("/", async (req, res) => {
  try {
    res.json(await MenuItem.find());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(errorStatus(err)).json({ message: err.message });
  }
});

// PUT /api/menu/:id (admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    res.status(errorStatus(err)).json({ message: err.message });
  }
});

// DELETE /api/menu/:id (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;