
(function () {
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function activateNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    qa('[data-nav]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      const target = href.split('/').pop();
      if (target === path) a.classList.add('active');
    });
    const toggle = q('[data-nav-toggle]');
    const nav = q('[data-nav-links]');
    if (toggle && nav) {
      toggle.addEventListener('click', () => nav.classList.toggle('open'));
    }
  }

  function initCarousel() {
    const slider = q('[data-carousel]');
    if (!slider) return;
    const slides = qa('[data-slide]', slider);
    const dots = qa('[data-dot]', slider);
    const prev = q('[data-prev]', slider);
    const next = q('[data-next]', slider);
    let idx = 0;
    const show = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };
    const go = (n) => show(n);
    prev && prev.addEventListener('click', () => go(idx - 1));
    next && next.addEventListener('click', () => go(idx + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    show(0);
    setInterval(() => show(idx + 1), 5500);
  }

  function initLocalFilters() {
    qa('[data-filter-bar]').forEach(bar => {
      const targetSel = bar.getAttribute('data-filter-target');
      const target = q(targetSel);
      if (!target) return;
      const cards = qa('[data-card]', target);
      const search = q('[data-search]', bar);
      const type = q('[data-type]', bar);
      const region = q('[data-region]', bar);
      const year = q('[data-year]', bar);
      const apply = () => {
        const s = (search?.value || '').trim().toLowerCase();
        const t = (type?.value || '').trim();
        const r = (region?.value || '').trim();
        const y = (year?.value || '').trim();
        let visible = 0;
        cards.forEach(card => {
          const title = (card.dataset.title || '').toLowerCase();
          const genre = (card.dataset.genre || '').toLowerCase();
          const regionVal = card.dataset.region || '';
          const typeVal = card.dataset.type || '';
          const yearVal = card.dataset.year || '';
          const ok = (!s || title.includes(s) || genre.includes(s)) &&
                     (!t || typeVal === t) &&
                     (!r || regionVal === r) &&
                     (!y || yearVal === y);
          card.classList.toggle('hidden', !ok);
          if (ok) visible += 1;
        });
        const counter = q('[data-filter-count]', bar);
        if (counter) counter.textContent = String(visible);
      };
      [search, type, region, year].forEach(el => el && el.addEventListener('input', apply));
      [search, type, region, year].forEach(el => el && el.addEventListener('change', apply));
      const reset = q('[data-reset]', bar);
      if (reset) reset.addEventListener('click', () => {
        if (search) search.value = '';
        if (type) type.value = '';
        if (region) region.value = '';
        if (year) year.value = '';
        apply();
      });
      apply();
    });
  }

  async function initSearchPage() {
    const root = q('#search-page');
    if (!root) return;
    const input = q('[data-global-search]', root);
    const type = q('[data-global-type]', root);
    const region = q('[data-global-region]', root);
    const list = q('#search-results', root);
    const empty = q('#search-empty', root);
    let data = [];
    try {
      const res = await fetch('assets/catalog.json');
      data = await res.json();
    } catch (err) {
      list.innerHTML = '<div class="search-empty">搜索数据加载失败，请检查本地静态文件是否完整。</div>';
      return;
    }
    const render = (items) => {
      list.innerHTML = items.slice(0, 120).map(movie => `
        <a class="card movie-card" data-card href="movies/movie-${movie.id}.html"
           data-title="${movie.title.replace(/"/g,'&quot;')}"
           data-genre="${movie.genre.replace(/"/g,'&quot;')}"
           data-region="${movie.region.replace(/"/g,'&quot;')}"
           data-type="${movie.type.replace(/"/g,'&quot;')}"
           data-year="${movie.year}">
          <div class="poster"><img src="${movie.poster}" alt="${movie.title}"></div>
          <div class="movie-body">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="meta-row">
              <span class="pill">${movie.year}</span>
              <span class="pill">${movie.region}</span>
              <span class="pill">${movie.type}</span>
            </div>
            <p class="summary">${movie.genre}</p>
          </div>
        </a>
      `).join('');
      empty.classList.toggle('hidden', items.length !== 0);
      if (!items.length) empty.classList.remove('hidden');
    };
    const apply = () => {
      const s = (input?.value || '').trim().toLowerCase();
      const t = type?.value || '';
      const r = region?.value || '';
      const items = data.filter(movie => {
        const okText = !s || [movie.title, movie.genre, movie.region, movie.type, movie.tags, movie.summary].join(' ').toLowerCase().includes(s);
        const okType = !t || movie.type === t;
        const okRegion = !r || movie.region === r;
        return okText && okType && okRegion;
      }).sort((a,b) => b.score - a.score);
      render(items);
      const counter = q('[data-search-count]', root);
      if (counter) counter.textContent = String(items.length);
    };
    [input, type, region].forEach(el => el && el.addEventListener('input', apply));
    [input, type, region].forEach(el => el && el.addEventListener('change', apply));
    apply();
  }

  function initPlayer() {
    const video = q('[data-player]');
    if (!video) return;
    const m3u8 = video.dataset.m3u8;
    const mp4 = video.dataset.mp4;
    if (m3u8 && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(m3u8);
      hls.attachMedia(video);
      window.__hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = m3u8;
    } else {
      video.src = mp4;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    activateNav();
    initCarousel();
    initLocalFilters();
    initSearchPage();
    initPlayer();
  });
})();
