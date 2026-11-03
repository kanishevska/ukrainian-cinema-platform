const API_URL = "http://localhost:5000/api/movies";
const AUTH_URL = "http://localhost:5000/api/auth";

const moviesGrid = document.getElementById("movies-grid");
const searchInput = document.getElementById("search-input");
const genreFilter = document.getElementById("genre-filter");
const mediaTypeFilter = document.getElementById("mediatype-filter");
const yearFilter = document.getElementById("year-filter");
const sortSelect = document.getElementById("sort-select");
const applyFiltersBtn = document.getElementById("apply-filters");
const paginationContainer = document.getElementById("pagination-container");

let currentPage = 1;
const limitPerPage = 20;

let authToken = localStorage.getItem("token") || "";
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// ---- ПАНЕЛЬ КОРИСТУВАЧА ТА АВТОРИЗАЦІЯ ----
function updateHeaderUserPanel() {
  const userPanel = document.getElementById("user-panel");
  if (!userPanel) return;

  if (currentUser) {
    const avatarImg = currentUser.avatarUrl
      ? `<img src="${currentUser.avatarUrl}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 8px;">`
      : "👤";

    userPanel.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="display: flex; align-items: center;">
          ${avatarImg}
          <span style="font-weight: 600; color: var(--primary);">${currentUser.username}</span>
        </div>
        <button id="open-profile-btn" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.9rem;">Профіль</button>
        <button id="watchlist-btn" class="btn btn-outline">📋 Подивитися пізніше</button>
        <button id="logout-btn" class="btn btn-delete">Вийти</button>
      </div>
    `;

    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      location.reload();
    });

    const watchlistBtn = document.getElementById("watchlist-btn");
    if (watchlistBtn) {
      watchlistBtn.addEventListener("click", openWatchlistModal);
    }
  } else {
    userPanel.innerHTML = `
      <button id="login-btn" class="btn btn-outline">Увійти</button>
      <button id="register-btn" class="btn btn-primary">Реєстрація</button>
    `;
    setupAuthModalEvents();
  }
}

// --- ЛОГІКА МОДАЛЬНОГО ВІКНА ПРОФІЛЮ ---
const profileModal = document.getElementById("profile-modal");
const closeProfileModal = document.getElementById("close-profile-modal");
const profileForm = document.getElementById("profile-form");

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "open-profile-btn") {
    if (profileModal && currentUser) {
      document.getElementById("profile-username").value =
        currentUser.username || "";
      document.getElementById("profile-email").value = currentUser.email || "";
      document.getElementById("profile-avatar").value =
        currentUser.avatarUrl || "";
      document.getElementById("profile-password").value = "";

      const avatarPreview = document.getElementById("profile-avatar-preview");
      if (avatarPreview) {
        avatarPreview.src =
          currentUser.avatarUrl || "https://via.placeholder.com/80?text=Avatar";
      }

      profileModal.classList.remove("hidden");
    }
  }
});

if (closeProfileModal) {
  closeProfileModal.addEventListener("click", () => {
    profileModal.classList.add("hidden");
  });
}

window.addEventListener("click", (e) => {
  if (profileModal && e.target === profileModal) {
    profileModal.classList.add("hidden");
  }
});

if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("profile-username").value;
    const email = document.getElementById("profile-email").value;
    const password = document.getElementById("profile-password").value;
    const avatarUrl = document.getElementById("profile-avatar").value;

    const updateData = { username, email, avatarUrl };
    if (password.trim() !== "") {
      updateData.password = password;
    }

    try {
      const res = await fetch(`${AUTH_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Профіль успішно оновлено!");
        currentUser = data.user;
        localStorage.setItem("user", JSON.stringify(currentUser));
        profileModal.classList.add("hidden");
        updateHeaderUserPanel();
      } else {
        alert(data.message || "Помилка оновлення профілю");
      }
    } catch (err) {
      console.error("Помилка мережі:", err);
      alert("Не вдалося підключитися до сервера.");
    }
  });
}

function setupAuthModalEvents() {
  const authModal = document.getElementById("auth-modal");
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const closeModal = document.getElementById("close-modal");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const toRegisterLink = document.getElementById("to-register");
  const toLoginLink = document.getElementById("to-login");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      authModal.classList.remove("hidden");
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      authModal.classList.remove("hidden");
      registerForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", () =>
      authModal.classList.add("hidden")
    );
  }

  window.addEventListener("click", (e) => {
    if (e.target === authModal) authModal.classList.add("hidden");
  });

  if (toRegisterLink) {
    toRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.classList.add("hidden");
      registerForm.classList.remove("hidden");
    });
  }

  if (toLoginLink) {
    toLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      await handleAuthRequest(`${AUTH_URL}/login`, { email, password });
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("reg-username").value;
      const email = document.getElementById("reg-email").value;
      const password = document.getElementById("reg-password").value;
      await handleAuthRequest(`${AUTH_URL}/register`, {
        username,
        email,
        password
      });
    });
  }
}

async function handleAuthRequest(url, payload) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Успішно!");
      location.reload();
    } else {
      alert(data.message || "Помилка");
    }
  } catch (err) {
    console.error("Помилка:", err);
  }
}

// ---- КАТАЛОГ ТА ФІЛЬТРИ ----
async function fetchMovies(page = 1) {
  try {
    const search = searchInput ? searchInput.value.trim() : "";
    const genre = genreFilter ? genreFilter.value : "";
    const mediaType = mediaTypeFilter ? mediaTypeFilter.value : "";
    const year = yearFilter ? yearFilter.value : "";
    const sortBy = sortSelect ? sortSelect.value : "";

    let queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (genre) queryParams.append("genre", genre);
    if (mediaType) queryParams.append("mediaType", mediaType);
    if (year) queryParams.append("year", year);
    if (sortBy) queryParams.append("sortBy", sortBy);
    queryParams.append("page", page);
    queryParams.append("limit", limitPerPage);

    const response = await fetch(`${API_URL}?${queryParams.toString()}`);
    const data = await response.json();

    currentPage = data.page;
    renderMovies(data.movies);
    renderPagination(data.pages, data.page);
  } catch (error) {
    console.error("Помилка завантаження каталогу:", error);
  }
}

function renderMovies(movies) {
  if (!moviesGrid) return;
  moviesGrid.innerHTML = "";

  if (!movies || movies.length === 0) {
    moviesGrid.innerHTML = '<p class="no-movies">Фільмів не знайдено.</p>';
    if (paginationContainer) paginationContainer.innerHTML = "";
    return;
  }

  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.style.cursor = "pointer";

    let adminButtonsHTML = "";
    if (currentUser && currentUser.role === "Admin") {
      adminButtonsHTML = `
        <div class="admin-actions">
          <button class="btn btn-edit" onclick="event.stopPropagation(); openEditModal('${movie._id}')">Редагувати</button>
          <button class="btn btn-delete" onclick="event.stopPropagation(); deleteMovie('${movie._id}')">Видалити</button>
        </div>
      `;
    }

    card.innerHTML = `
      <img src="${movie.posterUrl || "https://via.placeholder.com/260x350?text=No+Image"}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title} (${movie.year})</h3>
        <span class="rating-badge">★ ${movie.averageRating || "0.0"}</span>
        <p><strong>Жанр:</strong> ${movie.genre} | <strong>Тип:</strong> ${movie.mediaType || "Фільм"}</p>
        <p>${movie.description ? movie.description.substring(0, 80) + "..." : ""}</p>
        ${adminButtonsHTML}
      </div>
    `;

    card.addEventListener("click", () => openMovieDetails(movie._id));
    moviesGrid.appendChild(card);
  });
}

function renderPagination(totalPages, activePage) {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `btn ${i === activePage ? "btn-primary" : "btn-outline"}`;
    btn.textContent = i;
    btn.addEventListener("click", () => {
      fetchMovies(i);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    paginationContainer.appendChild(btn);
  }
}

if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener("click", () => {
    fetchMovies(1);
  });
}

// ---- ДЕТАЛІ ФІЛЬМУ (МОДАЛЬНЕ ВІКНО) ----
async function openMovieDetails(movieId) {
  try {
    const response = await fetch(`${API_URL}/${movieId}`);
    const movie = await response.json();

    if (response.ok) {
      const modalBody = document.getElementById("movie-details-body");
      if (!modalBody) return;

      let embedUrl = movie.trailerUrl || "";
      if (embedUrl.includes("watch?v=")) {
        embedUrl = embedUrl.replace("watch?v=", "embed/");
      } else if (embedUrl.includes("youtu.be/")) {
        embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
      }

      let adminRatingsSection = "";
      if (currentUser && currentUser.role === "Admin") {
        const ratingsList =
          movie.ratings && movie.ratings.length > 0
            ? movie.ratings
                .map(
                  (r) => `
              <div style="background: #fff3cd; padding: 8px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; margin-bottom: 5px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="${r.avatarUrl || "https://via.placeholder.com/25?text=👤"}" alt="avatar" style="width: 25px; height: 25px; border-radius: 50%; object-fit: cover;">
                  <span>Користувач: <strong>${r.username || "Гість / Анонім"}</strong> — Оцінка: <strong>${r.score}/10</strong></span>
                </div>
                <button class="btn btn-delete" style="padding: 3px 8px; font-size: 0.75rem;" onclick="removeMovieRating('${movie._id}', '${r._id}')">Видалити оцінку</button>
              </div>
            `
                )
                .join("")
            : '<p style="font-size: 0.85rem;">Ще немає оцінок.</p>';

        adminRatingsSection = `
          <hr style="margin: 20px 0;">
          <h3>⚙️ Управління рейтингом (Адмін)</h3>
          <div style="margin: 10px 0; max-height: 150px; overflow-y: auto;">
            ${ratingsList}
          </div>
        `;
      }

      modalBody.innerHTML = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <img src="${movie.posterUrl || "https://via.placeholder.com/200x300?text=No+Image"}" alt="${movie.title}" style="max-width: 200px; width: 100%; border-radius: 8px; object-fit: cover;">
          <div style="flex: 1; min-width: 220px;">
            <h2 style="color: var(--primary); margin-bottom: 8px;">${movie.title} (${movie.year})</h2>
            <p><strong>Жанр:</strong> ${movie.genre} | <strong>Тип:</strong> ${movie.mediaType || "Фільм"}</p>
            <p><strong>Режисер:</strong> ${movie.director}</p>
            <p><strong>Акторський склад:</strong> ${movie.cast ? movie.cast.join(", ") : "Не вказано"}</p>
            <p style="margin: 10px 0;"><strong>Синопсис:</strong> ${movie.description}</p>
            <span class="rating-badge" style="font-size: 1rem; padding: 4px 10px; display: inline-block;">★ Середній бал: ${movie.averageRating || 0}</span>
            
            ${
              currentUser
                ? `
              <div style="margin: 15px 0; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="toggleWatchlist('${movie._id}')">📌 У список «Подивитися пізніше»</button>
                <div>
                  <label style="font-size: 0.9rem;">Оцінити (1-10):</label>
                  <input type="number" id="user-score" min="1" max="10" style="width: 55px; padding: 4px;" value="10">
                  <button class="btn btn-outline" onclick="rateMovie('${movie._id}')">Оцінити</button>
                </div>
              </div>
            `
                : '<p style="color: #666; margin-top: 10px; font-size: 0.85rem;"><em>Авторизуйтеся, щоб оцінювати стрічки та додавати їх у свій список.</em></p>'
            }
          </div>
        </div>

        ${
          embedUrl
            ? `
          <div style="position: relative; padding-bottom: 56.25%; height: 0; margin: 20px 0;">
            <iframe src="${embedUrl}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius: 8px;" allowfullscreen></iframe>
          </div>
        `
            : ""
        }

        ${adminRatingsSection}

        <hr style="margin: 20px 0;">
        <h3>Відгуки глядачів</h3>
        <div style="margin: 10px 0; display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
          ${
            movie.reviews && movie.reviews.length > 0
              ? movie.reviews
                  .map(
                    (r) => `
              <div style="background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="${r.avatarUrl || "https://via.placeholder.com/30?text=👤"}" alt="avatar" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                  <div>
                    <p style="font-size: 0.95rem;"><strong>${r.username}:</strong> ${r.comment}</p>
                  </div>
                </div>
                ${
                  currentUser &&
                  (currentUser.id === r.userId || currentUser.role === "Admin")
                    ? `
                  <div style="display: flex; gap: 5px;">
                    <button class="btn btn-edit" onclick="editReview('${movie._id}', '${r._id}', '${r.comment}')">Редагувати</button>
                    <button class="btn btn-delete" onclick="deleteReview('${movie._id}', '${r._id}')">Видалити</button>
                  </div>
                `
                    : ""
                }
              </div>
            `
                  )
                  .join("")
              : '<p style="font-size: 0.9rem;">Ще немає відгуків. Будьте першим!</p>'
          }
        </div>

        ${
          currentUser
            ? `
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <input type="text" id="new-review-text" placeholder="Напишіть ваш відгук..." style="flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
            <button class="btn btn-primary" onclick="addReview('${movie._id}')">Надіслати</button>
          </div>
        `
            : ""
        }
      `;

      document.getElementById("movie-details-modal").classList.remove("hidden");
    }
  } catch (err) {
    console.error("Помилка завантаження деталей:", err);
  }
}

const closeDetailsModal = document.getElementById("close-details-modal");
if (closeDetailsModal) {
  closeDetailsModal.addEventListener("click", () => {
    document.getElementById("movie-details-modal").classList.add("hidden");
  });
}

window.addEventListener("click", (e) => {
  const detailsModal = document.getElementById("movie-details-modal");
  if (detailsModal && e.target === detailsModal) {
    detailsModal.classList.add("hidden");
  }
});

async function rateMovie(movieId) {
  const score = document.getElementById("user-score").value;
  const res = await fetch(`${API_URL}/${movieId}/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ score: parseInt(score) })
  });
  if (res.ok) {
    alert("Оцінку збережено!");
    openMovieDetails(movieId);
  } else {
    alert("Помилка оцінювання");
  }
}

async function addReview(movieId) {
  const comment = document.getElementById("new-review-text").value;
  if (!comment.trim()) return alert("Введіть текст відгуку");

  const res = await fetch(`${API_URL}/${movieId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ comment })
  });
  if (res.ok) {
    alert("Відгук додано!");
    openMovieDetails(movieId);
  } else {
    alert("Помилка додавання відгуку");
  }
}

async function editReview(movieId, reviewId, oldComment) {
  const newComment = prompt("Редагувати відгук:", oldComment);
  if (newComment === null || !newComment.trim()) return;

  const res = await fetch(`${API_URL}/${movieId}/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ comment: newComment })
  });
  if (res.ok) {
    alert("Відгук оновлено!");
    openMovieDetails(movieId);
  } else {
    alert("Помилка оновлення відгуку");
  }
}

async function deleteReview(movieId, reviewId) {
  if (!confirm("Ви дійсно хочете видалити цей відгук?")) return;

  const res = await fetch(`${API_URL}/${movieId}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (res.ok) {
    alert("Відгук видалено!");
    openMovieDetails(movieId);
  } else {
    alert("Помилка видалення");
  }
}

// ---- СПИСОК «ПОДИВИТИСЯ ПІЗНІШЕ» ----
async function openWatchlistModal() {
  const watchlistModal = document.getElementById("watchlist-modal");
  const container = document.getElementById("watchlist-items-container");
  if (!watchlistModal || !container) return;

  container.innerHTML = "<p>Завантаження списку...</p>";
  watchlistModal.classList.remove("hidden");

  try {
    const res = await fetch(`${AUTH_URL}/watchlist`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const movies = await res.json();

    if (res.ok) {
      if (!movies || movies.length === 0) {
        container.innerHTML =
          "<p>Ваш список «Подивитися пізніше» порожній.</p>";
        return;
      }

      container.innerHTML = movies
        .map(
          (movie) => `
        <div style="display: flex; align-items: center; justify-content: space-between; background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 15px; cursor: pointer; flex: 1;" onclick="document.getElementById('watchlist-modal').classList.add('hidden'); openMovieDetails('${movie._id}')">
            <img src="${movie.posterUrl || "https://via.placeholder.com/50x70"}" alt="${movie.title}" style="width: 50px; height: 70px; object-fit: cover; border-radius: 4px;">
            <div>
              <h4 style="color: var(--primary); margin-bottom: 3px;">${movie.title} (${movie.year})</h4>
              <p style="font-size: 0.85rem; color: #666;">${movie.genre} | ★ ${movie.averageRating || 0}</p>
            </div>
          </div>
          <button class="btn btn-delete" style="padding: 5px 10px; font-size: 0.8rem;" onclick="removeFromWatchlist('${movie._id}')">Видалити</button>
        </div>
      `
        )
        .join("");
    } else {
      container.innerHTML = "<p>Не вдалося завантажити список.</p>";
    }
  } catch (err) {
    console.error("Помилка:", err);
    container.innerHTML = "<p>Помилка з'єднання з сервером.</p>";
  }
}

const closeWatchlistModal = document.getElementById("close-watchlist-modal");
if (closeWatchlistModal) {
  closeWatchlistModal.addEventListener("click", () => {
    document.getElementById("watchlist-modal").classList.add("hidden");
  });
}

window.addEventListener("click", (e) => {
  const watchlistModal = document.getElementById("watchlist-modal");
  if (watchlistModal && e.target === watchlistModal) {
    watchlistModal.classList.add("hidden");
  }
});

async function toggleWatchlist(movieId) {
  const res = await fetch(`${AUTH_URL}/watchlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ movieId })
  });
  const data = await res.json();
  if (res.ok) {
    alert(data.message || "Список оновлено!");
  } else {
    alert("Помилка оновлення списку");
  }
}

async function removeFromWatchlist(movieId) {
  try {
    const res = await fetch(`${AUTH_URL}/watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ movieId })
    });
    if (res.ok) {
      openWatchlistModal();
    } else {
      alert("Помилка видалення зі списку");
    }
  } catch (err) {
    console.error("Помилка:", err);
  }
}

// ---- АДМІН-ПАНЕЛЬ ----
const adminPanel = document.getElementById("admin-panel");
const openAddMovieModalBtn = document.getElementById("open-add-movie-modal");
const movieModal = document.getElementById("movie-modal");
const closeMovieAdminModal = document.getElementById("close-movie-modal");
const movieForm = document.getElementById("movie-form");
const modalTitle = document.getElementById("modal-title");

let editingMovieId = null;

function checkAdminPermissions() {
  if (currentUser && currentUser.role === "Admin") {
    if (adminPanel) adminPanel.classList.remove("hidden");
  } else {
    if (adminPanel) adminPanel.classList.add("hidden");
  }
}

if (openAddMovieModalBtn) {
  openAddMovieModalBtn.addEventListener("click", () => {
    editingMovieId = null;
    if (modalTitle) modalTitle.textContent = "Додати новий фільм";
    if (movieForm) movieForm.reset();
    if (movieModal) movieModal.classList.remove("hidden");
  });
}

if (closeMovieAdminModal) {
  closeMovieAdminModal.addEventListener("click", () =>
    movieModal.classList.add("hidden")
  );
}

window.deleteMovie = async function (id) {
  if (!confirm("Ви впевнені, що хочете видалити цей фільм?")) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (res.ok) {
      alert("Фільм видалено");
      fetchMovies(currentPage);
    } else {
      alert("Помилка видалення");
    }
  } catch (err) {
    console.error(err);
  }
};

window.openEditModal = async function (id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const movie = await res.json();
    if (res.ok) {
      editingMovieId = movie._id;
      if (modalTitle) modalTitle.textContent = "Редагувати фільм";
      document.getElementById("movie-title").value = movie.title;
      document.getElementById("movie-year").value = movie.year;
      document.getElementById("movie-genre").value = movie.genre;
      document.getElementById("movie-mediatype").value =
        movie.mediaType || "Фільм";
      document.getElementById("movie-director").value = movie.director;
      document.getElementById("movie-poster").value = movie.posterUrl;
      document.getElementById("movie-trailer").value = movie.trailerUrl;
      document.getElementById("movie-desc").value = movie.description;
      if (movieModal) movieModal.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
  }
};

if (movieForm) {
  movieForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const movieData = {
      title: document.getElementById("movie-title").value,
      year: parseInt(document.getElementById("movie-year").value),
      genre: document.getElementById("movie-genre").value,
      mediaType: document.getElementById("movie-mediatype").value,
      director: document.getElementById("movie-director").value,
      posterUrl: document.getElementById("movie-poster").value,
      trailerUrl: document.getElementById("movie-trailer").value,
      description: document.getElementById("movie-desc").value
    };

    const url = editingMovieId ? `${API_URL}/${editingMovieId}` : API_URL;
    const method = editingMovieId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(movieData)
      });
      if (res.ok) {
        alert("Збережено успішно!");
        movieModal.classList.add("hidden");
        fetchMovies(currentPage);
      } else {
        alert("Помилка збереження");
      }
    } catch (err) {
      console.error(err);
    }
  });
}

async function removeMovieRating(movieId, ratingId) {
  if (!confirm("Ви дійсно хочете видалити цю оцінку?")) return;

  try {
    const res = await fetch(`${API_URL}/${movieId}/ratings/${ratingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (res.ok) {
      alert("Оцінку успішно видалено!");
      openMovieDetails(movieId);
    } else {
      const data = await res.json();
      alert(data.message || "Помилка видалення оцінки");
    }
  } catch (err) {
    console.error("Помилка мережі:", err);
  }
}

const openUsersModalBtn = document.getElementById("open-users-modal");
const usersModal = document.getElementById("users-modal");
const closeUsersModal = document.getElementById("close-users-modal");

if (openUsersModalBtn) {
  openUsersModalBtn.addEventListener("click", fetchAndRenderUsers);
}

if (closeUsersModal) {
  closeUsersModal.addEventListener("click", () => {
    usersModal.classList.add("hidden");
  });
}

window.addEventListener("click", (e) => {
  if (usersModal && e.target === usersModal) {
    usersModal.classList.add("hidden");
  }
});

async function fetchAndRenderUsers() {
  const container = document.getElementById("users-list-container");
  if (!container || !usersModal) return;

  container.innerHTML = "<p>Завантаження користувачів...</p>";
  usersModal.classList.remove("hidden");

  try {
    const res = await fetch(`${AUTH_URL}/users`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const users = await res.json();

    if (res.ok) {
      if (!users || users.length === 0) {
        container.innerHTML = "<p>Користувачів не знайдено.</p>";
        return;
      }

      container.innerHTML = users
        .map(
          (user) => `
        <div style="display: flex; align-items: center; justify-content: space-between; background: #f9f9f9; padding: 10px 15px; border-radius: 6px; border: 1px solid #eee;">
          <div>
            <h4 style="margin-bottom: 3px; color: ${user.isBanned ? "#dc3545" : "#333"};">
              ${user.username} ${user.isBanned ? "(ЗАБЛОКОВАНО)" : ""}
            </h4>
            <p style="font-size: 0.85rem; color: #666;">Email: ${user.email} | Роль: ${user.role}</p>
          </div>
          ${
            user.role !== "Admin"
              ? `
            <button class="btn ${user.isBanned ? "btn-primary" : "btn-delete"}" style="padding: 5px 10px; font-size: 0.8rem;" onclick="toggleUserBan('${user._id}')">
              ${user.isBanned ? "Розблокувати" : "Заблокувати"}
            </button>
          `
              : '<span style="font-size: 0.8rem; color: #888;">Адміністратор</span>'
          }
        </div>
      `
        )
        .join("");
    } else {
      container.innerHTML =
        "<p>Не вдалося завантажити список користувачів.</p>";
    }
  } catch (err) {
    console.error("Помилка:", err);
    container.innerHTML = "<p>Помилка з'єднання з сервером.</p>";
  }
}

async function toggleUserBan(userId) {
  if (
    !confirm(
      "Ви впевнені, що хочете змінити статус блокування цього користувача?"
    )
  )
    return;

  try {
    const res = await fetch(`${AUTH_URL}/users/${userId}/ban`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      fetchAndRenderUsers();
    } else {
      alert(data.message || "Помилка зміни статусу");
    }
  } catch (err) {
    console.error("Помилка:", err);
  }
}

// Ініціалізація додатку при завантаженні сторінки
updateHeaderUserPanel();
checkAdminPermissions();
fetchMovies();
