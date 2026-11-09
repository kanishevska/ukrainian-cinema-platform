require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

const movies = [
  {
    title: 'Мавка. Лісова пісня.',
    year: 2022,
    genre: 'Драма',
    mediaType: 'Мультфільм',
    description: '«Мавка. Лісова пісня» — це історія про протистояння чарівного Світу Лісу та прагматичного Світу Людей.',
    director: 'Олександра Рубан, Олег Маламуж',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNDlhNzRlY2QtNDBhMy00YjBhLWIzOGUtOWY0NWU2NGRlNDYyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=izQA8C3emt4',
    averageRating: 9,
    ratings: [],
    reviews: []
  },
  {
    title: 'Довбуш',
    year: 2021,
    genre: 'Екшн, пригоди',
    mediaType: 'Фільм',
    description: 'Карпати. Початок 18 століття. Жорстоке правління польської шляхти змушує гуцулів тікати в гори.',
    director: 'Олесь Санін',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNTBhNDc1NmEtMTJjYS00ZTk0LWEzYTctOWIyN2UwNDI5MWUxXkEyXkFqcGc@._V1_.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=D-mG8Vf4q6c',
    averageRating: 8,
    ratings: [],
    reviews: []
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ukrainian-cinema');
    await Movie.deleteMany({});
    await Movie.insertMany(movies);
    console.log(' БД успішно наповнена фільмами із якісними постерами!');
    process.exit();
  } catch (err) {
    console.error('Помилка:', err);
    process.exit(1);
  }
}

seed();