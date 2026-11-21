require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const MenuItem = require("./models/MenuItem");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const adminEmail = "admin@restaurant.com";
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    });
    console.log("Admin created: admin@restaurant.com / admin123");
  } else {
    console.log("Admin already exists");
  }

  if ((await MenuItem.countDocuments()) === 0) {
    await MenuItem.insertMany([
      { name: "Paneer Tikka", description: "Grilled cottage cheese with spices", category: "Starters", price: 220 },
      { name: "Veg Spring Rolls", description: "Crispy rolls with vegetable filling", category: "Starters", price: 160 },
      { name: "Butter Chicken", description: "Creamy tomato gravy with tender chicken", category: "Main Course", price: 340 },
      { name: "Veg Biryani", description: "Aromatic basmati rice with vegetables", category: "Main Course", price: 260 },
      { name: "Dal Makhani", description: "Slow-cooked black lentils", category: "Main Course", price: 230 },
      { name: "Gulab Jamun", description: "Warm milk dumplings in sugar syrup", category: "Desserts", price: 90 },
      { name: "Chocolate Brownie", description: "Served warm with ice cream", category: "Desserts", price: 150 },
      { name: "Masala Chai", description: "Traditional spiced tea", category: "Beverages", price: 50 },
      { name: "Fresh Lime Soda", description: "Sweet or salted", category: "Beverages", price: 70 },
    ]);
    console.log("Sample menu added");
  }

  await mongoose.disconnect();
}

run();