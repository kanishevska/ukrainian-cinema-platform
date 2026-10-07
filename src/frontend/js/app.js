const API_URL = "http://localhost:5000/api/movies";

async function fetchMovies(genre = "") {
  try {
    let url = API_URL;
    if (genre) {
      url += `?genre=${encodeURIComponent(genre)}`;
    }

    const response = await fetch(url);
    const movies = await response.json();
    renderMovies(movies);
  } catch (error) {
    console.error("Помилка завантаження фільмів:", error);
  }
}

function renderMovies(movies) {
  const container = document.getElementById("movies-container");
  container.innerHTML = "";

  if (movies.length === 0) {
    container.innerHTML = '<p class="no-movies">Фільмів не знайдено.</p>';
    return;
  }

  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
            <h3>${movie.title} (${movie.year})</h3>
            <p><strong>Жанр:</strong> ${movie.genre}</p>
            <p><strong>Режисер:</strong> ${movie.director}</p>
            <p>${movie.description}</p>
        `;
    container.appendChild(card);
  });
}

document.getElementById("filter-btn").addEventListener("click", () => {
  const genre = document.getElementById("genre-select").value;
  fetchMovies(genre);
});

// Завантажити фільми при відкритті сторінки
fetchMovies();
