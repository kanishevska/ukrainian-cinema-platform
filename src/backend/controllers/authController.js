const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl // ✨ Обов'язково додаємо сюди
    },
    process.env.JWT_SECRET || "secret_key_cinema",
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Усі поля обов'язкові для заповнення" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Користувач з таким email або ім'ям вже існує" });
    }

    const user = new User({ username, email, passwordHash: password });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      message: "Реєстрація успішна",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Помилка сервера при реєстрації",
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Невірний email або пароль" });

    if (user.isBanned) {
      return res
        .status(403)
        .json({ message: "Ваш акаунт заблоковано адміністратором." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Невірний email або пароль" });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Помилка входу", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, password, avatarUrl } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Користувача не знайдено" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: "Профіль успішно оновлено",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        watchlist: user.watchlist,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Помилка оновлення профілю", error: error.message });
  }
};

exports.toggleWatchlist = async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.id);
    const index = user.watchlist.indexOf(movieId);
    if (index > -1) {
      user.watchlist.splice(index, 1);
    } else {
      user.watchlist.push(movieId);
    }
    await user.save();
    res.json({
      message: "Список «Подивитися пізніше» оновлено",
      watchlist: user.watchlist
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Помилка оновлення списку", error: error.message });
  }
};

exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("watchlist");
    if (!user)
      return res.status(404).json({ message: "Користувача не знайдено" });
    res.json(user.watchlist);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Помилка отримання списку", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Помилка завантаження користувачів",
      error: error.message
    });
  }
};

exports.toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Користувача не знайдено" });

    if (user.role === "Admin") {
      return res
        .status(400)
        .json({ message: "Неможливо заблокувати адміністратора." });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      message: `Користувача ${user.username} успішно ${user.isBanned ? "заблоковано" : "розблоковано"}.`,
      isBanned: user.isBanned
    });
  } catch (error) {
    res.status(500).json({
      message: "Помилка зміни статусу блокування",
      error: error.message
    });
  }
};
