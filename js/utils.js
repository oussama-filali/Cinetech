export const renderMovieCard = (item, type) => {
  if (!item || !item.id) {
    console.error('Item invalide pour renderMovieCard:', item);
    return document.createElement('div'); // Retourne un div vide
  }

  const card = document.createElement('div');
  card.className = 'movie-card bg-white rounded-lg shadow overflow-hidden cursor-pointer transition hover:scale-105';
  card.dataset.id = item.id;
  card.dataset.type = type;

  // Vérification des données
  const title = item.title || item.name || 'Titre inconnu';
  const year = (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A';
  const rating = item.vote_average?.toFixed(1) || 'N/A';
  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : './assets/placeholder.jpg';

  card.innerHTML = `
    <img src="${posterUrl}" 
         alt="${title}"
         class="w-full h-64 object-cover"
         onerror="this.src='./assets/placeholder.jpg'">
    <div class="p-3">
      <h3 class="font-semibold truncate">${title}</h3>
      <div class="flex justify-between items-center mt-2">
        <span class="text-sm text-gray-600">${year}</span>
        <span class="flex items-center text-sm">
          ★ ${rating}
        </span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    window.location.hash = `#details-${type}-${item.id}`;
  });

  return card;
};

export const setupNavigation = () => {
  console.log("Configuration de la navigation..."); // Debug
  const navButtons = document.querySelectorAll('.nav-btn');
  
  if (navButtons.length === 0) {
    console.error("Aucun bouton de navigation trouvé");
    return;
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pageId = `${btn.dataset.page}-page`;
      const targetPage = document.getElementById(pageId);
      
      if (!targetPage) {
        console.error(`Page ${pageId} non trouvée`);
        return;
      }

      document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('active');
      });

      targetPage.classList.remove('hidden');
      targetPage.classList.add('active');
    });
  });

  // Gestion du logo
  const logo = document.getElementById('logo-home');
  if (logo) {
    logo.addEventListener('click', () => {
      window.location.hash = '';
    });
  } else {
    console.warn("Logo home non trouvé");
  }
};