// Gestion des favoris
export function getFavoris() {
    const favoris = localStorage.getItem('favoris');
    return favoris ? JSON.parse(favoris) : [];
  }
  
  export function saveFavoris(favoris) {
    localStorage.setItem('favoris', JSON.stringify(favoris));
  }
  
  export function toggleFavori(item) {
    const favoris = getFavoris();
    const index = favoris.findIndex(f => f.id === item.id && f.type === item.type);
    
    if (index === -1) {
      favoris.push({
        id: item.id,
        type: item.type,
        title: item.title || item.name,
        poster: item.poster_path,
        year: item.release_date ? item.release_date.split('-')[0] : item.first_air_date?.split('-')[0]
      });
    } else {
      favoris.splice(index, 1);
    }
    
    saveFavoris(favoris);
    return index === -1;
  }
  
  export function isFavori(id, type) {
    return getFavoris().some(f => f.id === id && f.type === type);
  }
  
  // Gestion des commentaires
  export function getCommentaires() {
    const commentaires = localStorage.getItem('commentaires');
    return commentaires ? JSON.parse(commentaires) : {};
  }
  
  export function getMediaCommentaires(mediaId) {
    const allComments = getCommentaires();
    return allComments[mediaId] || [];
  }
  
  export function addCommentaire(mediaId, user, content) {
    const allComments = getCommentaires();
    
    if (!allComments[mediaId]) {
      allComments[mediaId] = [];
    }
    
    allComments[mediaId].push({
      user,
      content,
      date: new Date().toISOString()
    });
    
    localStorage.setItem('commentaires', JSON.stringify(allComments));
    return allComments[mediaId];
  }