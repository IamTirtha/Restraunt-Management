const express = require("express");
const { Booking, Alteration } = require("../models/Booking");

const router = express.Router();

// Same constraints as the frontend, checked again on the server
function validateBooking(b) {
  const errors = [];
  if (!b.customerName || !/^[A-Za-z ]+$/.test(b.customerName))
    errors.push("Name is required and can contain letters only");
  if (!/^[6-9]\d{9}$/.test(b.phone))
    errors.push("Enter a valid 10-digit phone number");
  if (!(Number(b.guests) >= 1 && Number(b.guests) <= 10))
    errors.push("Guests must be between 1 and 10");
  const today = new Date().toISOString().split("T")[0];
  if (!b.bookingDate || b.bookingDate < today)
    errors.push("Booking date is required and cannot be in the past");
  if (!b.bookingTime || b.bookingTime < "11:00" || b.bookingTime > "23:00")
    errors.push("Booking time must be between 11:00 and 23:00");
  return errors;
}

// GET all bookings
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add a new booking (Exp 2)
router.post("/bookings", async (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update a booking (Exp 3 + Exp 4: increases updateCount by 1)
router.put("/bookings/:id", async (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  try {
    const { updateCount, _id, ...data } = req.body; // ignore these if sent
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: data, $inc: { updateCount: 1 } },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST alter: save a modified copy in the alterations collection (Exp 3)
router.post("/bookings/:id/alter", async (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  try {
    const original = await Booking.findById(req.params.id);
    if (!original) return res.status(404).json({ message: "Booking not found" });
    const { updateCount, _id, ...data } = req.body;
    const altered = await Alteration.create({ ...data, originalId: original._id });
    res.status(201).json(altered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all altered bookings
router.get("/alterations", async (req, res) => {
  try {
    const alterations = await Alteration.find();
    res.json(alterations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a booking and its altered copies (Exp 3)
router.delete("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    await Alteration.deleteMany({ originalId: req.params.id });
    res.json({ message: "Booking deleted from both collections" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;