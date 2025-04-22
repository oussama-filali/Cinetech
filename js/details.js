// Importation des fonctions utilitaires
import { getImageUrl } from './api.js';
import { isFavorite, toggleFavorite } from './favoris.js';

/**
 * Fonction principale pour afficher les détails d'un film ou d'une série.
 * @param {Object} data - Données du média (détails, casting, suggestions).
 * @param {string} type - Type du média ('movie' ou 'tv').
 */
export function renderDetailContent(data, type) {
  const { details, credits, similar } = data;
  const detailsPage = document.getElementById('details-page');
  
  // Vérifiez si les données sont valides avant de les utiliser
  if (!details) {
    detailsPage.innerHTML = '<p class="text-red-500">Erreur : Détails non disponibles.</p>';
    return;
  }
  
  // Génération du contenu HTML pour les détails
  detailsPage.innerHTML = `
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Affichage de l'image du média -->
      <div class="lg:w-1/3">
        <img src="${getImageUrl(details.poster_path)}" 
             alt="${details.title || details.name}"
             class="w-full rounded-lg shadow-lg">
      </div>
      
      <!-- Informations principales -->
      <div class="lg:w-2/3">
        <h1 class="text-3xl font-bold mb-2">${details.title || details.name}</h1>
        
        <!-- Informations supplémentaires : type, date, durée, note -->
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
            ${type === 'movie' ? 'Film' : 'Série'}
          </span>
          <span>${(details.release_date || details.first_air_date)?.split('-')[0] || 'N/A'}</span>
          ${type === 'movie' && details.runtime ? `
            <span>${Math.floor(details.runtime / 60)}h ${details.runtime % 60}min</span>
          ` : ''}
          <div class="flex items-center">
            <span class="text-yellow-500 mr-1">★</span>
            <span>${details.vote_average?.toFixed(1) || 'N/A'}/10</span>
          </div>
        </div>
        
        <!-- Genres -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Genres</h2>
          <div class="flex flex-wrap gap-2">
            ${details.genres?.map(genre => `
              <span class="bg-gray-200 px-3 py-1 rounded-full text-sm">${genre.name}</span>
            `).join('') || 'N/A'}
          </div>
        </div>
        
        <!-- Synopsis -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Synopsis</h2>
          <p class="text-gray-700">${details.overview || 'Aucune description disponible.'}</p>
        </div>
        
        <!-- Casting principal -->
        ${credits.cast?.length > 0 ? `
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Casting principal</h2>
          <div id="cast-container" class="flex gap-4 overflow-x-auto pb-4"></div>
        </div>
        ` : ''}
      </div>
    </div>
    
    <!-- Suggestions similaires -->
    ${similar?.length > 0 ? `
    <section class="mt-12">
      <h2 class="text-2xl font-semibold mb-4">Suggestions similaires</h2>
      <div id="similar-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
    </section>
    ` : ''}
    
    <!-- Section des commentaires -->
    <section class="mt-12">
      <h2 class="text-2xl font-semibold mb-4">Commentaires</h2>
      <div id="comments-container" class="space-y-4 mb-6"></div>
      
      <!-- Formulaire pour ajouter un commentaire -->
      <form id="comment-form" class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-semibold mb-3">Ajouter un commentaire</h3>
        
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
          <input type="text" id="comment-author" required 
                class="w-full p-2 border rounded">
        </div>
        
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <div class="rating-stars" id="rating-stars">
            ${Array.from({length: 5}, (_, i) => `
              <i class="fas fa-star star" data-rating="${i + 1}"></i>
            `).join('')}
          </div>
          <input type="hidden" id="comment-rating" value="0">
        </div>
        
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
          <textarea id="comment-text" required rows="3"
                   class="w-full p-2 border rounded"></textarea>
        </div>
        
        <button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Publier
        </button>
      </form>
    </section>
  `;
  
  // Configuration des fonctionnalités supplémentaires
  setupCommentForm(details.id, type); // Formulaire de commentaires
  setupRatingStars(); // Étoiles de notation
  loadComments(details.id); // Chargement des commentaires existants
}

/**
 * Configuration des étoiles de notation.
 */
function setupRatingStars() {
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('comment-rating');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      ratingInput.value = rating;
      
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < rating);
      });
    });
    
    star.addEventListener('mouseover', () => {
      const rating = parseInt(star.dataset.rating);
      
      stars.forEach((s, i) => {
        s.classList.toggle('hover', i < rating);
      });
    });
    
    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
  });
}

/**
 * Chargement des commentaires existants.
 * @param {number} mediaId - ID du média.
 */
function loadComments(mediaId) {
  const comments = JSON.parse(localStorage.getItem(`comments_${mediaId}`)) || [];
  const container = document.getElementById('comments-container');
  
  container.innerHTML = comments.map(comment => `
    <div class="comment-item">
      <div class="flex justify-between items-start mb-1">
        <div>
          <strong>${comment.author}</strong>
          <div class="rating-stars text-sm">
            ${Array.from({length: 5}, (_, i) => `
              <i class="fas fa-star ${i < comment.rating ? 'text-yellow-500' : 'text-gray-300'}"></i>
            `).join('')}
          </div>
        </div>
        <span class="text-xs text-gray-500">${new Date(comment.date).toLocaleDateString()}</span>
      </div>
      <p>${comment.text}</p>
    </div>
  `).join('');
}

/**
 * Configuration du formulaire de commentaires.
 * @param {number} mediaId - ID du média.
 * @param {string} type - Type du média ('movie' ou 'tv').
 */
function setupCommentForm(mediaId, type) {
  const form = document.getElementById('comment-form');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const author = document.getElementById('comment-author').value.trim();
    const rating = parseInt(document.getElementById('comment-rating').value);
    const text = document.getElementById('comment-text').value.trim();
    
    if (!author || rating === 0 || !text) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    const comment = {
      author,
      rating,
      text,
      date: new Date().toISOString()
    };
    
    // Sauvegarder le commentaire
    const comments = JSON.parse(localStorage.getItem(`comments_${mediaId}`)) || [];
    comments.unshift(comment);
    localStorage.setItem(`comments_${mediaId}`, JSON.stringify(comments));
    
    // Recharger les commentaires
    loadComments(mediaId);
    
    // Réinitialiser le formulaire
    form.reset();
    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    document.getElementById('comment-rating').value = '0';
  });
}

