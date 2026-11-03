const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// 1. Спочатку специфічні роути (з додатковими шляхами /ratings/ та /reviews/)
router.delete(
  "/:movieId/ratings/:ratingId",
  verifyAdmin,
  movieController.removeRating
);

router.put(
  "/:movieId/reviews/:reviewId",
  verifyToken,
  movieController.updateReview
);

router.delete(
  "/:movieId/reviews/:reviewId",
  verifyToken,
  movieController.deleteReview
);

router.post("/:id/rate", verifyToken, movieController.rateMovie);
router.post("/:id/reviews", verifyToken, movieController.addReview);

// 2. Потім адмінські операції створення фільмів
router.post("/", verifyAdmin, movieController.createMovie);

// 3. І тільки в самому кінці загальні роути з параметром `/:id` та отримання списку
router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovieById);
router.put("/:id", verifyAdmin, movieController.updateMovie);
router.delete("/:id", verifyAdmin, movieController.deleteMovie);

module.exports = router;
