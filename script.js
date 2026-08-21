document.getElementById('year').textContent = new Date().getFullYear();

// header scroll shadow + back to top
const header = document.querySelector('.site-header');
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  // hysteresis so the header doesn't flicker right at the threshold
  if (!header.classList.contains('scrolled') && y > 60) header.classList.add('scrolled');
  else if (header.classList.contains('scrolled') && y < 20) header.classList.remove('scrolled');
  backToTop.classList.toggle('show', y > 400);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');
navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  siteNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', false);
}));

// active nav link on scroll
const navLinks = [...siteNav.querySelectorAll('a')];
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(s => navObserver.observe(s));

// scroll reveal
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const grid = document.getElementById('gallery-grid');
const filtersEl = document.getElementById('filters');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCat = document.getElementById('lightbox-cat');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');

let items = [];
let activeFilter = 'All';

function renderFilters(categories) {
  filtersEl.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === activeFilter ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeFilter = cat;
      renderFilters(categories);
      renderGrid();
    });
    filtersEl.appendChild(btn);
  });
}

function renderGrid() {
  grid.innerHTML = '';
  const visible = activeFilter === 'All' ? items : items.filter(i => i.category === activeFilter);

  if (!visible.length) {
    grid.innerHTML = '<p class="gallery-empty">No pieces in this category yet.</p>';
    return;
  }

  visible.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
      <div class="card-body">
        <div class="card-cat">${item.category}</div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `;
    card.addEventListener('click', () => openLightbox(item));
    grid.appendChild(card);
  });
}

function openLightbox(item) {
  lightboxImg.src = item.image;
  lightboxImg.alt = item.title;
  lightboxCat.textContent = item.category;
  lightboxTitle.textContent = item.title;
  lightboxDesc.textContent = item.description;
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open');
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

fetch('data.json?v=' + Date.now(), { cache: 'no-store' })
  .then(res => res.json())
  .then(data => {
    items = data.gallery || [];
    const categories = ['All', ...new Set(items.map(i => i.category))];
    renderFilters(categories);
    renderGrid();
  })
  .catch(err => {
    grid.innerHTML = '<p class="gallery-empty">Gallery could not be loaded.</p>';
    console.error('Failed to load data.json', err);
  });
