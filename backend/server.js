const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/folders", require("./routes/folderRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/shares", require("./routes/shareRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("Storage Platform API is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
