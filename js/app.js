import { fetchPopularMovies, fetchPopularSeries, fetchAllMovies, fetchAllSeries, fetchMovieDetails, searchContent } from './api.js';
import { renderPagination } from './pagination.js';
import { renderFavorites, isFavorite, toggleFavorite } from './favoris.js';
import { renderDetailContent } from './details.js';

// État global
const state = {
  currentPage: {
    movies: 1,
    series: 1
  },
  maxPages: 20,
  heroCurrentSlide: 0,
  heroInterval: null
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  const welcomePage = document.getElementById('welcome-page');
  const mainContent = document.getElementById('main-content');

  // Afficher la page principale après 3 secondes
  setTimeout(() => {
    welcomePage.classList.add('hidden'); // Masquer la page de bienvenue
    mainContent.classList.remove('hidden'); // Afficher le contenu principal
    showPage('home'); // Afficher la page d'accueil par défaut
  }, 3000); // Durée de 3 secondes

  setupEventListeners();
  await loadHomePage();
  initHeroSlider();
});

// Configuration des événements
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  // Bouton retour
  document.getElementById('back-btn').addEventListener('click', () => {
    const currentPage = document.querySelector('.page.active').id.replace('-page', '');
    if (currentPage === 'details') {
      const prevPage = localStorage.getItem('prevPage') || 'home';
      showPage(prevPage);
    } else {
      showPage('home');
    }
  });

  // Recherche
  document.getElementById('search-input').addEventListener('input', debounce(handleSearch, 300));
}

// Initialisation du slider hero
function initHeroSlider() {
  const heroImages = [
    './assets/images/hero1.jpg',
    './assets/images/hero2.jpg',
    './assets/images/hero3.jpg',
    './assets/images/hero4.jpg',
    './assets/images/hero5.jpg',
    './assets/images/hero6.jpg',
    './assets/images/hero7.jpg',
    './assets/images/hero8.jpg',
    './assets/images/hero9.jpg',
    './assets/images/hero10.jpg'
  ];

  const slidesContainer = document.getElementById('hero-slides');
  const dotsContainer = document.getElementById('hero-dots');

  heroImages.forEach((img, index) => {
    // Slide
    const slide = document.createElement('div');
    slide.className = 'hero-slide';
    slide.style.backgroundImage = `url(${img})`;
    slidesContainer.appendChild(slide);

    // Dot
    const dot = document.createElement('div');
    dot.className = 'hero-dot';
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  // Auto-play
  state.heroInterval = setInterval(nextSlide, 5000);
}

function nextSlide() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  
  state.heroCurrentSlide = (state.heroCurrentSlide + 1) % slides.length;
  
  document.getElementById('hero-slides').style.transform = `translateX(-${state.heroCurrentSlide * 100}%)`;
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === state.heroCurrentSlide);
  });
}

function goToSlide(index) {
  state.heroCurrentSlide = index;
  document.getElementById('hero-slides').style.transform = `translateX(-${index * 100}%)`;
  
  const dots = document.querySelectorAll('.hero-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
  
  // Reset timer
  clearInterval(state.heroInterval);
  state.heroInterval = setInterval(nextSlide, 5000);
}

// Chargement de la page d'accueil
async function loadHomePage() {
  try {
    const [movies, series] = await Promise.all([
      fetchPopularMovies(),
      fetchPopularSeries()
    ]);
    
    renderMediaSection('popular-movies', movies.results.slice(0, 10), 'movie');
    renderMediaSection('popular-series', series.results.slice(0, 10), 'tv');
  } catch (error) {
    console.error("Erreur chargement page d'accueil:", error);
  }
}

// Affichage d'une page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
    page.classList.remove('active');
  });

  const page = document.getElementById(`${pageId}-page`);
  if (page) {
    page.classList.remove('hidden');
    page.classList.add('active');
  }

  // Sauvegarder la page précédente
  if (pageId !== 'details') {
    localStorage.setItem('prevPage', pageId);
  }

  // Afficher/masquer le bouton retour
  document.getElementById('back-btn').classList.toggle('hidden', pageId === 'home');

  // Charger le contenu si nécessaire
  switch(pageId) {
    case 'films':
      loadMoviesPage();
      break;
    case 'series':
      loadSeriesPage();
      break;
    case 'favoris':
      renderFavorites();
      break;
  }
}

// Chargement des films
async function loadMoviesPage(page = 1) {
  state.currentPage.movies = page;
  const moviesData = await fetchAllMovies(Math.min(page, state.maxPages));
  
  renderMediaSection('movies-grid', moviesData.results, 'movie');
  renderPagination('movies-pagination', page, Math.min(moviesData.total_pages, state.maxPages), loadMoviesPage);
}

// Chargement des séries
async function loadSeriesPage(page = 1) {
  state.currentPage.series = page;
  const seriesData = await fetchAllSeries(Math.min(page, state.maxPages));
  
  renderMediaSection('series-grid', seriesData.results, 'tv');
  renderPagination('series-pagination', page, Math.min(seriesData.total_pages, state.maxPages), loadSeriesPage);
}

// Affichage des médias dans une section
function renderMediaSection(containerId, items, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  items.forEach(item => {
    if (!item.poster_path) return;
    
    const card = document.createElement('div');
    card.className = 'media-card bg-white rounded-lg shadow overflow-hidden';
    
    const title = type === 'movie' ? item.title : item.name;
    const date = type === 'movie' ? item.release_date : item.first_air_date;
    const year = date ? date.split('-')[0] : 'N/A';
    
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" 
           alt="${title}"
           class="w-full media-poster"
           onerror="this.src='./assets/placeholder.jpg'">
      <div class="p-3">
        <h3 class="font-semibold truncate">${title}</h3>
        <div class="flex justify-between items-center mt-2">
          <span class="text-sm text-gray-600">${year}</span>
          <span class="flex items-center text-sm">
            ★ ${item.vote_average?.toFixed(1) || 'N/A'}
          </span>
        </div>
      </div>
    `;
    
    card.addEventListener('click', () => showDetails(item.id, type));
    container.appendChild(card);
  });
}

// Affichage des détails
async function showDetails(id, type) {
  localStorage.setItem('prevPage', document.querySelector('.page.active').id.replace('-page', ''));
  
  const detailsPage = document.getElementById('details-page');
  detailsPage.innerHTML = '<div class="text-center py-12">Chargement...</div>';
  
  showPage('details');
  
  try {
    const data = await fetchMovieDetails(id);
    if (!data) throw new Error('Détails non disponibles');
    
    renderDetailContent(data, type);
  } catch (error) {
    detailsPage.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Erreur lors du chargement des détails
      </div>
    `;
    console.error('Erreur showDetails:', error);
  }
}

// Gestion de la recherche
async function handleSearch(e) {
  const query = e.target.value.trim();
  const resultsContainer = document.getElementById('search-results');
  
  if (query.length < 2) {
    resultsContainer.classList.add('hidden');
    return;
  }
  
  try {
    const results = await searchContent(query);
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="p-2 text-gray-500">Aucun résultat</div>';
    } else {
      results.slice(0, 5).forEach(item => {
        const result = document.createElement('div');
        result.className = 'p-2 hover:bg-gray-100 cursor-pointer flex items-center';
        
        const type = item.media_type === 'movie' ? 'Film' : 'Série';
        const title = item.title || item.name;
        const poster = item.poster_path 
          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
          : './assets/placeholder.jpg';
        
        result.innerHTML = `
          <img src="${poster}" 
               class="w-10 h-10 object-cover rounded mr-2">
          <div>
            <p class="font-medium">${title}</p>
            <p class="text-xs text-gray-500">${type}</p>
          </div>
        `;
        
        result.addEventListener('click', () => {
          showDetails(item.id, item.media_type);
          resultsContainer.classList.add('hidden');
          document.getElementById('search-input').value = '';
        });
        
        resultsContainer.appendChild(result);
      });
    }
    
    resultsContainer.classList.remove('hidden');
  } catch (error) {
    console.error('Erreur recherche:', error);
  }
}

// Utilitaires
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
