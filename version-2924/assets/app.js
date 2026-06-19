document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-slide')) || 0;
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var libraryInput = document.getElementById('library-search');
  var searchList = document.querySelector('[data-search-list]');

  if (libraryInput && searchList) {
    var query = new URLSearchParams(window.location.search).get('q') || '';
    var cards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));

    function applySearch(value) {
      var keyword = value.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? '' : 'none';
      });
    }

    libraryInput.value = query;
    applySearch(query);
    libraryInput.addEventListener('input', function () {
      applySearch(libraryInput.value);
    });
  }

  var chipFilter = document.querySelector('[data-chip-filter]');
  var cardList = document.querySelector('[data-card-list]');

  if (chipFilter && cardList) {
    var buttons = Array.prototype.slice.call(chipFilter.querySelectorAll('button'));
    var listCards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter') || 'all';

        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });

        listCards.forEach(function (card) {
          var value = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-tags')
          ].join(' ');
          card.style.display = filter === 'all' || value.indexOf(filter) !== -1 ? '' : 'none';
        });
      });
    });
  }
});
