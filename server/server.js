const express = require("express");
const cors = require("cors");

require("dotenv").config();
require("./config/db");

const studentRoutes = require("./routes/studentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const teacherRoutes = require("./routes/teacherRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/teachers", teacherRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Student Management System API");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});