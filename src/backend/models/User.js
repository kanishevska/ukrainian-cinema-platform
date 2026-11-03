const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["Guest", "RegisteredUser", "Admin"],
      default: "RegisteredUser"
    },
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
    avatarUrl: { type: String, default: "" },
    isBanned: { type: Boolean, default: false } // Поле для блокування
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
