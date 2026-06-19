
(function() {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                show(i);
            });
        });
        setInterval(function() {
            show(index + 1);
        }, 5200);
    }

    var filterList = document.querySelector('.filter-list');
    if (filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
        var input = document.querySelector('.filter-input');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-pill'));
        var count = document.querySelector('[data-result-count]');
        var activeRegion = '';
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (input && q) {
            input.value = q;
        }
        function searchable(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
        }
        function apply() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function(card) {
                var regionOk = !activeRegion || card.getAttribute('data-region') === activeRegion;
                var textOk = !term || searchable(card).indexOf(term) !== -1;
                var ok = regionOk && textOk;
                card.classList.toggle('is-hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = '共 ' + visible + ' 部';
            }
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                buttons.forEach(function(item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                activeRegion = button.getAttribute('data-region') || '';
                apply();
            });
        });
        apply();
    }
}());
