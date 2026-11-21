const express = require("express");
const { Booking, Alteration } = require("../models/Booking");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // every route below needs a logged-in user

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

// Owner or admin only
const canAccess = (booking, user) =>
  user.role === "admin" || String(booking.user) === String(user._id);

// GET bookings: admin sees all, customer sees own
router.get("/bookings", async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    res.json(await Booking.find(filter));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add booking
router.post("/bookings", async (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  try {
    const { updateCount, _id, user, ...data } = req.body;
    const booking = await Booking.create({ ...data, user: req.user._id });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update booking (increases updateCount by 1)
router.put("/bookings/:id", async (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!canAccess(booking, req.user))
      return res.status(403).json({ message: "Not your booking" });

    const { updateCount, _id, user, ...data } = req.body;
    Object.assign(booking, data);
    booking.updateCount += 1;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST alter: save a modified copy in the alterations collection
router.post("/bookings/:id/alter", async (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  try {
    const original = await Booking.findById(req.params.id);
    if (!original) return res.status(404).json({ message: "Booking not found" });
    if (!canAccess(original, req.user))
      return res.status(403).json({ message: "Not your booking" });

    const { updateCount, _id, user, ...data } = req.body;
    const altered = await Alteration.create({
      ...data,
      originalId: original._id,
      user: original.user,
    });
    res.status(201).json(altered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET altered bookings: admin sees all, customer sees own
router.get("/alterations", async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    res.json(await Alteration.find(filter));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE booking and its altered copies
router.delete("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!canAccess(booking, req.user))
      return res.status(403).json({ message: "Not your booking" });

    await booking.deleteOne();
    await Alteration.deleteMany({ originalId: req.params.id });
    res.json({ message: "Booking deleted from both collections" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;