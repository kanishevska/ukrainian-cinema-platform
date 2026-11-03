const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  avatarUrl: { type: String, default: "" },
  comment: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true, index: true },
    mediaType: {
      type: String,
      enum: ["Фільм", "Серіал", "Мультфільм"],
      default: "Фільм"
    },
    description: { type: String, required: true },
    director: { type: String, required: true },
    cast: [{ type: String }],
    posterUrl: { type: String, required: true },
    trailerUrl: { type: String, required: true },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: { type: String }, // Зберігаємо ім'я користувача для зручності
        score: { type: Number, min: 1, max: 10 },
        avatarUrl: { type: String, default: "" }
      }
    ],
    averageRating: { type: Number, default: 0 },
    reviews: [reviewSchema]
  },
  { timestamps: true }
);

movieSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.score, 0);
    this.averageRating = parseFloat((sum / this.ratings.length).toFixed(1));
  }
};

module.exports = mongoose.model("Movie", movieSchema);
