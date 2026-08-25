const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware parsing JSON dari request body
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Gunakan Routes dengan Prefix URL
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Port aplikasi
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
