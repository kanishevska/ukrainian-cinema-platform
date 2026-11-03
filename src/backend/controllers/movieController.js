const Movie = require("../models/Movie");

exports.getMovies = async (req, res) => {
  try {
    const {
      search,
      genre,
      year,
      mediaType,
      sortBy,
      page = 1,
      limit = 20
    } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { director: { $regex: search, $options: "i" } },
        { cast: { $regex: search, $options: "i" } }
      ];
    }
    if (genre) query.genre = genre;
    if (year) query.year = parseInt(year);
    if (mediaType) query.mediaType = mediaType;

    let sortOption = {};
    if (sortBy === "rating") {
      sortOption = { averageRating: -1 };
    } else if (sortBy === "popularity") {
      sortOption = { "ratings.length": -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const movies = await Movie.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Movie.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      movies
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Помилка при отриманні каталогу",
        error: error.message
      });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Фільм не знайдено" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    await newMovie.save();
    res.status(201).json({ message: "Фільм успішно додано", movie: newMovie });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Помилка валідації даних", error: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMovie)
      return res.status(404).json({ message: "Фільм не знайдено" });
    res.json({ message: "Фільм оновлено", movie: updatedMovie });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Помилка оновлення", error: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Фільм не знайдено" });
    res.json({ message: "Фільм видалено з каталогу" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Помилка видалення", error: error.message });
  }
};

exports.rateMovie = async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 10) {
      return res.status(400).json({ message: "Оцінка має бути від 1 до 10" });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Фільм не знайдено" });

    const existingRatingIndex = movie.ratings.findIndex(
      (r) => r.userId.toString() === req.user.id
    );

    if (existingRatingIndex > -1) {
      movie.ratings[existingRatingIndex].score = score;
      movie.ratings[existingRatingIndex].username = req.user.username;
      movie.ratings[existingRatingIndex].avatarUrl = req.user.avatarUrl || "";
    } else {
      movie.ratings.push({
        userId: req.user.id,
        username: req.user.username,
        avatarUrl: req.user.avatarUrl || "",
        score
      });
    }

    movie.calculateAverageRating();
    await movie.save();
    res.json({
      message: "Оцінку збережено",
      averageRating: movie.averageRating
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Помилка збереження оцінки", error: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || comment.trim() === "") {
      return res
        .status(400)
        .json({ message: "Коментар не може бути порожнім" });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Фільм не знайдено" });

    movie.reviews.push({
      userId: req.user.id,
      username: req.user.username,
      avatarUrl: req.user.avatarUrl || "",
      comment
    });

    await movie.save();
    res.status(201).json({ message: "Відгук додано", reviews: movie.reviews });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Помилка додавання відгуку", error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { movieId, reviewId } = req.params;
    const { comment } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Фільм не знайдено" });

    const review = movie.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Відгук не знайдено" });

    if (review.userId.toString() !== req.user.id && req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Ви можете редагувати лише власні відгуки" });
    }

    review.comment = comment;
    await movie.save();
    res.json({ message: "Відгук оновлено", reviews: movie.reviews });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Помилка оновлення відгуку", error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { movieId, reviewId } = req.params;
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Фільм не знайдено" });

    const review = movie.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Відгук не знайдено" });

    if (review.userId.toString() !== req.user.id && req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Недостатньо прав для видалення" });
    }

    review.deleteOne();
    await movie.save();
    res.json({ message: "Відгук видалено", reviews: movie.reviews });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Помилка видалення відгуку", error: error.message });
  }
};

exports.removeRating = async (req, res) => {
  try {
    const { movieId, ratingId } = req.params;
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Фільм не знайдено" });

    movie.ratings = movie.ratings.filter((r) => r._id.toString() !== ratingId);

    movie.calculateAverageRating();
    await movie.save();

    res.json({
      message: "Оцінку видалено",
      averageRating: movie.averageRating
    });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};
