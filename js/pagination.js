export function renderPagination(containerId, currentPage, totalPages, callback) {
  const container = document.getElementById(containerId);
  if (!container || totalPages <= 1) return;
  
  container.innerHTML = '';
  
  // Bouton Précédent
  if (currentPage > 1) {
    const prevBtn = createPageButton('←', currentPage - 1);
    prevBtn.addEventListener('click', () => callback(currentPage - 1));
    container.appendChild(prevBtn);
  }
  
  // Premières pages
  if (currentPage > 3) {
    container.appendChild(createPageButton(1, 1));
    if (currentPage > 4) container.appendChild(createEllipsis());
  }
  
  // Pages autour de la current
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  
  for (let i = start; i <= end; i++) {
    const btn = createPageButton(i, i);
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => callback(i));
    container.appendChild(btn);
  }
  
  // Dernières pages
  if (currentPage < totalPages - 2) {
    if (currentPage < totalPages - 3) container.appendChild(createEllipsis());
    container.appendChild(createPageButton(totalPages, totalPages));
  }
  
  // Bouton Suivant
  if (currentPage < totalPages) {
    const nextBtn = createPageButton('→', currentPage + 1);
    nextBtn.addEventListener('click', () => callback(currentPage + 1));
    container.appendChild(nextBtn);
  }
}

function createPageButton(text, page) {
  const btn = document.createElement('button');
  btn.className = 'pagination-btn bg-purple-600 text-white px-3 py-1 rounded mx-1';
  btn.textContent = text;
  btn.dataset.page = page;
  return btn;
}

function createEllipsis() {
  const span = document.createElement('span');
  span.className = 'px-2';
  span.textContent = '...';
  return span;
}