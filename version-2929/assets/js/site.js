function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var filterForm = document.querySelector("[data-filter-form]");
  var filterList = document.querySelector("[data-filter-list]");
  if (filterForm && filterList) {
    var searchInput = filterForm.querySelector("[data-search-input]");
    var regionFilter = filterForm.querySelector("[data-region-filter]");
    var typeFilter = filterForm.querySelector("[data-type-filter]");
    var yearFilter = filterForm.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

    function applyFilters() {
      var keyword = (searchInput && searchInput.value ? searchInput.value : "").trim().toLowerCase();
      var region = regionFilter ? regionFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-genre") || ""
        ].join(" ").toLowerCase();
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedRegion = !region || card.getAttribute("data-region") === region;
        var matchedType = !type || card.getAttribute("data-type") === type;
        var matchedYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedRegion && matchedType && matchedYear));
      });
    }

    [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && searchInput) {
      searchInput.value = query;
      applyFilters();
    }
  }
});

function initMoviePlayer(videoUrl) {
  var shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var button = shell.querySelector("[data-play-button]");
  var initialized = false;
  var hlsInstance = null;

  function prepareVideo() {
    if (initialized || !videoUrl || !video) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = videoUrl;
    }

    initialized = true;
  }

  function startPlayback() {
    prepareVideo();
    shell.classList.add("is-playing");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      startPlayback();
    });
  }

  shell.addEventListener("click", function (event) {
    if (event.target === video || event.target === shell) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    shell.classList.add("is-playing");
  });

  video.addEventListener("ended", function () {
    shell.classList.remove("is-playing");
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
