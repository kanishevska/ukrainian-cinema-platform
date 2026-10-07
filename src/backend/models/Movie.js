class Movie {
  constructor(
    id,
    title,
    year,
    genre,
    description,
    posterUrl,
    trailerUrl,
    director,
    cast
  ) {
    this.id = id;
    this.title = title;
    this.year = year;
    this.genre = genre;
    this.description = description;
    this.posterUrl = posterUrl;
    this.trailerUrl = trailerUrl;
    this.director = director;
    this.cast = cast || [];
    this.ratings = [];
    this.reviews = [];
  }

  calculateAverageRating() {
    if (this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, curr) => acc + curr.score, 0);
    return parseFloat((sum / this.ratings.length).toFixed(1));
  }
}

module.exports = Movie;
