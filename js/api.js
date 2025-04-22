const API_KEY = 'f1b0288846f9733be263c52bcb501646';
const BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchPopularMovies(page = 1) {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
    if (!response.ok) throw new Error('Erreur API');
    return await response.json();
  } catch (error) {
    console.error('fetchPopularMovies:', error);
    return { results: [], total_pages: 1 };
  }
}

export async function fetchAllMovies(page = 1) {
  try {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=fr-FR&page=${page}&sort_by=popularity.desc`);
    if (!response.ok) throw new Error('Erreur API');
    return await response.json();
  } catch (error) {
    console.error('fetchAllMovies:', error);
    return { results: [], total_pages: 1 };
  }
}

export async function fetchPopularSeries(page = 1) {
  try {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
    if (!response.ok) throw new Error('Erreur API');
    return await response.json();
  } catch (error) {
    console.error('fetchPopularSeries:', error);
    return { results: [], total_pages: 1 };
  }
}

export async function fetchAllSeries(page = 1) {
  try {
    const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=fr-FR&page=${page}&sort_by=popularity.desc`);
    if (!response.ok) throw new Error('Erreur API');
    return await response.json();
  } catch (error) {
    console.error('fetchAllSeries:', error);
    return { results: [], total_pages: 1 };
  }
}

export async function fetchMovieDetails(id) {
  try {
    const [details, credits, similar] = await Promise.all([
      fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=fr-FR`),
      fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=fr-FR&page=1`)
    ]);
    
    if (!details.ok || !credits.ok || !similar.ok) throw new Error('Erreur API');
    
    return {
      details: await details.json(),
      credits: await credits.json(),
      similar: (await similar.json()).results
    };
  } catch (error) {
    console.error('fetchMovieDetails:', error);
    return null;
  }
}

export async function searchContent(query) {
  try {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=fr-FR&query=${query}`);
    if (!response.ok) throw new Error('Erreur API');
    const data = await response.json();
    return data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  } catch (error) {
    console.error('searchContent:', error);
    return [];
  }
}

export function getImageUrl(path, size = 'w500') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : './assets/placeholder.jpg';
}