const express = require("express");
const cors = require("cors");
const movieService = require("./services/MovieCatalogService");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Перевірка статусу сервера
app.get("/api/status", (req, res) => {
  res.json({
    message: "Сервер Платформи українського кіно працює!",
    status: "OK"
  });
});

// Перегляд каталогу фільмів
app.get("/api/movies", (req, res) => {
  const { genre, year, sortBy } = req.query;
  const movies = movieService.getAllMovies(genre, year, sortBy);
  res.json(movies);
});

// Картка фільму за ID
app.get("/api/movies/:id", (req, res) => {
  const movie = movieService.getMovieById(req.params.id);
  if (!movie) {
    return res.status(404).json({ message: "Фільм не знайдено" });
  }
  res.json(movie);
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
