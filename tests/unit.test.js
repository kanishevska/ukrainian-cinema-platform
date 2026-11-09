// Чиста функція обчислення середнього рейтингу для Unit-тестування
function calculateAverageRating(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, curr) => acc + curr.score, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
}

describe('Unit Testing: Розрахунок середнього рейтингу', () => {
  test(' calculateAverageRating() має правильно рахувати середній бал', () => {
    const ratings = [
      { score: 8 },
      { score: 9 },
      { score: 10 }
    ];

    const avg = calculateAverageRating(ratings);

    // Очікуваний результат: (8 + 9 + 10) / 3 = 9.0
    expect(avg).toBe(9);
  });

  test('calculateAverageRating() має повертати 0, якщо оцінок немає', () => {
    const ratings = [];

    const avg = calculateAverageRating(ratings);
    expect(avg).toBe(0);
  });
});