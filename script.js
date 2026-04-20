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

const mobilePlaybackTargets = [];

videoCards.forEach((card) => {
  const video = card.querySelector("video");
  if (!video) {
    return;
  }

  prepareVideo(video);

  if (prefersTouchPlayback) {
    mobilePlaybackTargets.push({
      element: card,
      video,
      onExit: resetVideo,
    });
    return;
  }

  card.addEventListener("mouseenter", () => safelyPlayVideo(video));
  card.addEventListener("mouseleave", () => resetVideo(video));
  card.addEventListener("focusin", () => safelyPlayVideo(video));
  card.addEventListener("focusout", () => resetVideo(video));
});

autoplaySections.forEach((video) => {
  prepareVideo(video);

  if (!prefersTouchPlayback) {
    safelyPlayVideo(video);
    return;
  }

  mobilePlaybackTargets.push({
    element: video.closest(".section-full") ?? video,
    video,
    onExit: pauseVideo,
  });
});

if (prefersTouchPlayback && mobilePlaybackTargets.length > 0) {
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
