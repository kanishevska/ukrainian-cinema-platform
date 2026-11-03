const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/profile", verifyToken, authController.updateProfile);
router.post("/watchlist", verifyToken, authController.toggleWatchlist);
router.get("/watchlist", verifyToken, authController.getWatchlist);
router.get("/users", verifyAdmin, authController.getAllUsers);
router.put("/users/:userId/ban", verifyAdmin, authController.toggleUserBan);

module.exports = router;
