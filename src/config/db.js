const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ukr-cinema",
      {
        serverSelectionTimeoutMS: 5000
      }
    );
    console.log(`MongoDB підключено: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Помилка підключення до MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
