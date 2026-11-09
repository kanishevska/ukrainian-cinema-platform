const request = require('supertest');
const express = require('express');

// Створюємо спрощений екземпляр Express для тестування роутів
const app = express();
app.use(express.json());

// Тестовий ендпоінт перевірки API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API працює' });
});

// Тестовий ендпоінт каталогу фільмів
app.get('/api/movies', (req, res) => {
  res.status(200).json([
    { id: 1, title: 'Тіні забутих предків', year: 1965 },
    { id: 2, title: 'Мавка. Лісова пісня', year: 2023 }
  ]);
});

describe('Component & API Testing: Маршрути платформи', () => {
  test('GET /api/health має повертати 200 OK та статус JSON', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('GET /api/movies має повертати список фільмів у форматі JSON', async () => {
    const response = await request(app).get('/api/movies');
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0].title).toBe('Тіні забутих предків');
  });
});