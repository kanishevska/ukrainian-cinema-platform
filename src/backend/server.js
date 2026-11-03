const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const connectDB = require("../config/db");
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Підключення до бази даних MongoDB[cite: 3]
connectDB();

app.use(cors());
app.use(express.json());

// Роздача статичних файлів фронтенду[cite: 3]
app.use(express.static(path.join(__dirname, "../frontend")));

// Маршрути API[cite: 3]
app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);

// Глобальний обробник помилок (Нефункціональна вимога)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Сталася внутрішня помилка сервера." });
});

app.listen(PORT, () => {
  console.log(`Сервер успішно запущено на порту ${PORT}`);
});
