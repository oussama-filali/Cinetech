const FAVORITES_KEY = 'cinetech_favorites';

export function getFavorites() {
  const favorites = localStorage.getItem(FAVORITES_KEY);
  return favorites ? JSON.parse(favorites) : [];
}

export function isFavorite(id, type) {
  return getFavorites().some(fav => fav.id === id && fav.type === type);
}

export function toggleFavorite(media) {
  const favorites = getFavorites();
  const index = favorites.findIndex(fav => fav.id === media.id && fav.type === media.type);
  
  if (index === -1) {
    favorites.push({
      id: media.id,
      type: media.type,
      title: media.title,
      poster_path: document.querySelector(`#details-page img`)?.src.split('/').pop() || ''
    });
  } else {
    favorites.splice(index, 1);
  }
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return index === -1;
}

export function renderFavorites() {
  const favorites = getFavorites();
  const container = document.getElementById('favorites-grid');
  const emptyState = document.getElementById('empty-favorites');
  
  container.innerHTML = '';
  
  if (favorites.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  favorites.forEach(fav => {
    const card = document.createElement('div');
    card.className = 'media-card bg-white rounded-lg shadow overflow-hidden';
    card.innerHTML = `
      <img src="${getImageUrl(fav.poster_path)}" 
           class="w-full h-64 object-cover"
           alt="${fav.title}"
           onerror="this.src='./assets/placeholder.jpg'">
      <div class="p-3">
        <h3 class="font-semibold truncate">${fav.title}</h3>
        <div class="flex justify-between items-center mt-2">
          <button class="text-red-500 text-sm remove-favorite" data-id="${fav.id}" data-type="${fav.type}">
            ❌ Retirer
          </button>
        </div>
      </div>
    `;
    
    card.querySelector('.remove-favorite').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(fav);
      renderFavorites();
    });
    
    card.addEventListener('click', () => showDetails(fav.id, fav.type));
    container.appendChild(card);
  });
}