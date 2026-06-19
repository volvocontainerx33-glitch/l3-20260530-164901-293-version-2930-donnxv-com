(function () {
    const toggle = document.querySelector('.menu-toggle');
    const panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dots button'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        const root = panel.closest('main') || document;
        const cards = Array.from(root.querySelectorAll('.searchable-card'));
        const input = panel.querySelector('[data-search-input]');
        const region = panel.querySelector('[data-region-filter]');
        const type = panel.querySelector('[data-type-filter]');
        const empty = root.querySelector('[data-empty-state]');

        function apply() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            const regionValue = region ? region.value : '';
            const typeValue = type ? type.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title || '',
                    card.dataset.region || '',
                    card.dataset.type || '',
                    card.dataset.year || '',
                    card.dataset.genre || ''
                ].join(' ').toLowerCase();
                const regionMatch = !regionValue || card.dataset.region === regionValue;
                const typeMatch = !typeValue || card.dataset.type === typeValue;
                const keywordMatch = !keyword || haystack.includes(keyword);
                const matched = regionMatch && typeMatch && keywordMatch;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (region) {
            region.addEventListener('change', apply);
        }
        if (type) {
            type.addEventListener('change', apply);
        }
        apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (box) {
        const video = box.querySelector('video');
        const button = box.querySelector('[data-play-button]');
        const stream = box.getAttribute('data-stream');
        let ready = false;
        let hls = null;

        function bindStream() {
            if (ready || !video || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            ready = true;
        }

        function play() {
            bindStream();
            box.classList.add('is-playing');
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
