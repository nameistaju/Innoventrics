const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu a");
const reveals = document.querySelectorAll(".reveal");
const videoCards = document.querySelectorAll("[data-video-card]");
const autoplaySections = document.querySelectorAll(".section-full video");
const cursorDot = document.querySelector(".cursor-dot");
const prefersTouchPlayback = window.matchMedia("(hover: none), (pointer: coarse)").matches;

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

reveals.forEach((element) => revealObserver.observe(element));

const safelyPlayVideo = (video) => {
  const playAttempt = video.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {});
  }
};

const resetVideo = (video) => {
  video.pause();
  video.currentTime = 0;
};

const pauseVideo = (video) => {
  video.pause();
};

const prepareVideo = (video) => {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
};

const primeVideo = (video) => {
  if (video.dataset.primed === "true") {
    return;
  }

  video.preload = "metadata";
  video.load();
  video.dataset.primed = "true";
};

const mobilePlaybackTargets = [];

videoCards.forEach((card) => {
  const video = card.querySelector("video");
  if (!video) {
    return;
  }

  prepareVideo(video);
  video.addEventListener("loadeddata", () => {
    card.classList.add("video-ready");
  });

  if (prefersTouchPlayback) {
    mobilePlaybackTargets.push({
      element: card,
      video,
      onExit: resetVideo,
    });
    return;
  }

  primeVideo(video);
  card.addEventListener("mouseenter", () => safelyPlayVideo(video));
  card.addEventListener("mouseleave", () => resetVideo(video));
  card.addEventListener("focusin", () => safelyPlayVideo(video));
  card.addEventListener("focusout", () => resetVideo(video));
});

autoplaySections.forEach((video) => {
  prepareVideo(video);
  const section = video.closest(".section-full") ?? video;

  video.addEventListener("loadeddata", () => {
    section.classList.add("video-ready");
  });

  if (!prefersTouchPlayback) {
    primeVideo(video);
    safelyPlayVideo(video);
    return;
  }

  mobilePlaybackTargets.push({
    element: section,
    video,
    onExit: pauseVideo,
  });
});

if (prefersTouchPlayback && mobilePlaybackTargets.length > 0) {
  const mobileVideoLoader = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const target = mobilePlaybackTargets.find(({ element }) => element === entry.target);
        if (!target) {
          return;
        }

        primeVideo(target.video);
        mobileVideoLoader.unobserve(target.element);
      });
    },
    {
      rootMargin: "240px 0px",
      threshold: 0.01,
    }
  );

  const mobileVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = mobilePlaybackTargets.find(({ element }) => element === entry.target);
        if (!target) {
          return;
        }

        if (entry.isIntersecting) {
          safelyPlayVideo(target.video);
        } else {
          target.onExit(target.video);
        }
      });
    },
    {
      threshold: 0.35,
    }
  );

  mobilePlaybackTargets.forEach(({ element }) => {
    mobileVideoLoader.observe(element);
    mobileVideoObserver.observe(element);
  });
}

if (cursorDot && window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    body.classList.add("using-mouse");
    cursorDot.style.transform = `translate(${event.clientX - 8}px, ${event.clientY - 8}px)`;
  });

  window.addEventListener("mouseleave", () => {
    body.classList.remove("using-mouse");
  });
}
