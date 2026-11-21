const mongoose = require("mongoose");

const fields = {
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  seatingArea: {
    type: String,
    enum: ["Indoor", "Outdoor", "Private Dining", "Bar"],
    default: "Indoor",
  },
  guests: { type: Number, required: true, min: 1, max: 10 },
  bookingDate: { type: String, required: true },
  bookingTime: { type: String, required: true },
  remarks: { type: String, default: "" },
};

// Main bookings (keeps the update count)
const bookingSchema = new mongoose.Schema({
  ...fields,
  updateCount: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// Altered copies, linked to the original booking
const alterationSchema = new mongoose.Schema({
  ...fields,
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Booking = mongoose.model("Booking", bookingSchema);
const Alteration = mongoose.model("Alteration", alterationSchema);

module.exports = { Booking, Alteration };