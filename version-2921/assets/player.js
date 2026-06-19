const getHls = () => window.Hls || null;

const attachStream = (video, streamUrl) => {
  if (video.dataset.ready === 'true') {
    return;
  }

  video.dataset.ready = 'true';

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl;
    return;
  }

  const Hls = getHls();

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    video.hlsInstance = hls;
    return;
  }

  video.src = streamUrl;
};

const activatePlayer = async (player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('.player-play');
  const streamUrl = player.dataset.stream;

  if (!video || !streamUrl) {
    return;
  }

  attachStream(video, streamUrl);

  try {
    await video.play();
    if (button) {
      button.classList.add('is-hidden');
    }
  } catch (error) {
    if (button) {
      button.classList.remove('is-hidden');
    }
  }
};

Array.from(document.querySelectorAll('.stream-player')).forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('.player-play');

  if (button) {
    button.addEventListener('click', () => activatePlayer(player));
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        activatePlayer(player);
      }
    });

    video.addEventListener('play', () => {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', () => {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  }
});
