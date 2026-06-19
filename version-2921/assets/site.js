(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let currentSlide = 0;
  let slideTimer = null;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  };

  const startHero = () => {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(() => showSlide(currentSlide + 1), 5200);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot || 0));
      startHero();
    });
  });

  startHero();

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const applyFilter = (input, selector, category = 'all') => {
    const keyword = normalize(input.value);
    const items = Array.from(document.querySelectorAll(selector));

    items.forEach((item) => {
      const text = normalize(`${item.dataset.title || ''} ${item.dataset.keywords || ''} ${item.textContent || ''}`);
      const itemCategory = item.dataset.category || 'all';
      const matchText = !keyword || text.includes(keyword);
      const matchCategory = category === 'all' || itemCategory === category;
      item.classList.toggle('hidden', !(matchText && matchCategory));
    });
  };

  const pageFilters = Array.from(document.querySelectorAll('.page-filter'));
  pageFilters.forEach((input) => {
    const target = input.dataset.filterTarget || '.movie-card';
    input.addEventListener('input', () => applyFilter(input, target));
  });

  const searchInput = document.querySelector('#siteSearchInput');
  const categoryButtons = Array.from(document.querySelectorAll('[data-category-filter]'));
  let activeCategory = 'all';

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    const runSearch = () => applyFilter(searchInput, '.all-movies .movie-card', activeCategory);
    searchInput.addEventListener('input', runSearch);

    categoryButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeCategory = button.dataset.categoryFilter || 'all';
        categoryButtons.forEach((item) => item.classList.toggle('active', item === button));
        runSearch();
      });
    });

    runSearch();
  }

  document.addEventListener('error', (event) => {
    const target = event.target;
    if (target && target.tagName === 'IMG') {
      target.classList.add('image-missing');
    }
  }, true);
})();
