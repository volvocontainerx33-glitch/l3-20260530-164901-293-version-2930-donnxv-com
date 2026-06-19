(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav-links]');
    var search = document.querySelector('[data-header-search]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
        if (search) {
          search.classList.toggle('open');
        }
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    if (slides.length) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var genreSelect = document.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var urlParams = new URLSearchParams(window.location.search);
    if (filterInput && urlParams.get('q')) {
      filterInput.value = urlParams.get('q');
    }
    function applyFilters() {
      var q = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var genre = genreSelect ? genreSelect.value : '';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region')).toLowerCase();
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchGenre = !genre || card.getAttribute('data-genre').indexOf(genre) !== -1 || card.getAttribute('data-tags').indexOf(genre) !== -1;
        card.classList.toggle('hide-card', !(matchText && matchYear && matchGenre));
      });
    }
    [filterInput, yearSelect, genreSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', applyFilters);
        el.addEventListener('change', applyFilters);
      }
    });
    if (cards.length) {
      applyFilters();
    }

    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    if (video) {
      var source = video.getAttribute('data-src');
      var initialized = false;
      function initPlayer() {
        if (initialized || !source) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      function playVideo() {
        initPlayer();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
      video.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay) {
          overlay.classList.remove('hidden');
        }
      });
      if (overlay) {
        overlay.addEventListener('click', playVideo);
      }
    }
  });
})();
