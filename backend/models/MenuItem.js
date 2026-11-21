const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  category: {
    type: String,
    enum: ["Starters", "Main Course", "Desserts", "Beverages"],
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: "" },
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model("MenuItem", menuItemSchema);