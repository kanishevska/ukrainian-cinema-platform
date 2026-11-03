const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Доступ заборонено. Необхідна авторизація." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key_cinema"
    );

    // Перевірка чи акаунт існує та чи не заблокований адміністратором
    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      return res.status(403).json({ message: "Цей акаунт заблоковано." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Недійсний токен" });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === "Admin") {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Доступ дозволено лише адміністраторам." });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };
