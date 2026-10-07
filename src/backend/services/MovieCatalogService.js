const Movie = require("../models/Movie");

class MovieCatalogService {
  constructor() {
    // Тестовий список фільмів для базової структури
    this.movies = [
      new Movie(
        1,
        "Тіні забутих предків",
        1965,
        "Драма",
        "Класика українського кінематографа.",
        "",
        "",
        "Сергій Параджанов",
        ["Іван Миколайчук"]
      ),
      new Movie(
        2,
        "Мавка. Лісова пісня",
        2023,
        "Мультфільм",
        "Анімаційний фільм за мотивами драми Лесі Українки.",
        "",
        "",
        "Олександра Рубан",
        []
      )
    ];
  }

  getAllMovies(genre, year, sortBy) {
    let result = [...this.movies];
    if (genre) {
      result = result.filter(
        (m) => m.genre.toLowerCase() === genre.toLowerCase()
      );
    }
    if (year) {
      result = result.filter((m) => m.year === parseInt(year));
    }
    if (sortBy === "rating") {
      result.sort(
        (a, b) => b.calculateAverageRating() - a.calculateAverageRating()
      );
    }
    return result;
  }

  getMovieById(id) {
    return this.movies.find((m) => m.id === parseInt(id));
  }

  addMovie(movieData) {
    const newId = this.movies.length + 1;
    const newMovie = new Movie(
      newId,
      movieData.title,
      movieData.year,
      movieData.genre,
      movieData.description,
      movieData.posterUrl,
      movieData.trailerUrl,
      movieData.director,
      movieData.cast
    );
    this.movies.push(newMovie);
    return newMovie;
  }
}

module.exports = new MovieCatalogService();
