require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const USER_EMAIL = 'admin@gmail.com'; 

async function promoteToAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ukrainian-cinema');
    
    const user = await User.findOneAndUpdate(
      { email: USER_EMAIL.toLowerCase() },
      { role: 'Admin' },
      { new: true }
    );

    if (user) {
      console.log(` Успіх! Користувачу ${user.username} (${user.email}) надано роль Admin!`);
    } else {
      console.log(` Користувача з поштою ${USER_EMAIL} не знайдено в БД. Спочатку зареєструйтеся на сайті з цією поштою.`);
    }
    process.exit();
  } catch (err) {
    console.error('Помилка:', err);
    process.exit(1);
  }
}

promoteToAdmin();