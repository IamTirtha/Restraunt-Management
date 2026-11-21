require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bookingRoutes = require("./routes/bookings");

const app = express();

app.use(cors());          // lets React (port 5173) call this server
app.use(express.json());  // lets Express read JSON bodies

app.get("/", (req, res) => res.send("Restaurant Management API is running"));
app.use("/api", bookingRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.log("MongoDB connection error:", err.message));