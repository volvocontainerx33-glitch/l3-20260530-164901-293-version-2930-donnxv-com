(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var navToggle = document.querySelector(".nav-toggle");
        var mobilePanel = document.querySelector(".mobile-panel");

        if (navToggle && mobilePanel) {
            navToggle.addEventListener("click", function () {
                var expanded = navToggle.getAttribute("aria-expanded") === "true";
                navToggle.setAttribute("aria-expanded", String(!expanded));
                mobilePanel.classList.toggle("is-open");
            });
        }

        initHero();
        initFilters();
        fillSearchQuery();
    });

    function initHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var previous = hero.querySelector(".hero-control.prev");
        var next = hero.querySelector(".hero-control.next");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-keyword]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var reset = panel.querySelector("[data-filter-reset]");
            var scopeSelector = panel.getAttribute("data-filter-scope") || ".movie-grid";
            var scope = document.querySelector(scopeSelector);
            var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
            var empty = document.querySelector(panel.getAttribute("data-empty-target") || "");

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
                    var matchType = !selectedType || normalize(card.dataset.type) === selectedType;
                    var ok = matchKeyword && matchYear && matchType;

                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, type].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function fillSearchQuery() {
        var searchInput = document.querySelector("[data-search-page-input]");
        if (!searchInput) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var value = params.get("q") || "";
        searchInput.value = value;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    window.initializeMoviePlayer = function (streamUrl) {
        var video = document.querySelector(".movie-video");
        var layer = document.querySelector(".play-layer");
        var attached = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            attached = true;
        }

        function play() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener("click", play);
        }

        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });

        video.addEventListener("emptied", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            attached = false;
        });
    };
})();
