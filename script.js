const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu a");
const reveals = document.querySelectorAll(".reveal");
const videoCards = document.querySelectorAll("[data-video-card]");
const cursorDot = document.querySelector(".cursor-dot");

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

videoCards.forEach((card) => {
  const video = card.querySelector("video");
  if (!video) {
    return;
  }

  const playVideo = () => {
    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  };

  const resetVideo = () => {
    video.pause();
    video.currentTime = 0;
  };

  card.addEventListener("mouseenter", playVideo);
  card.addEventListener("mouseleave", resetVideo);
  card.addEventListener("focusin", playVideo);
  card.addEventListener("focusout", resetVideo);
});

if (cursorDot && window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    body.classList.add("using-mouse");
    cursorDot.style.transform = `translate(${event.clientX - 8}px, ${event.clientY - 8}px)`;
  });

  window.addEventListener("mouseleave", () => {
    body.classList.remove("using-mouse");
  });
}
