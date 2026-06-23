const music = document.getElementById("bgMusic");
const musicGate = document.getElementById("musicGate");
const startInvite = document.getElementById("startInvite");
const musicToggle = document.getElementById("musicToggle");
const copyAddress = document.getElementById("copyAddress");
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");
const loadingBar = document.getElementById("loadingBar");
const autoToggle = document.getElementById("autoToggle");
const speedToggle = document.getElementById("speedToggle");
const petalCanvas = document.getElementById("petalCanvas");
const countDays = document.getElementById("countDays");
const countHours = document.getElementById("countHours");
const countMinutes = document.getElementById("countMinutes");
const countSeconds = document.getElementById("countSeconds");
const countMessage = document.getElementById("countMessage");
const sheets = [...document.querySelectorAll(".sheet")];
const renderedImages = [...document.querySelectorAll(".sheet img")];
const imageSources = [
  "assets/final3-page-01.webp?v=20",
  "assets/final3-page-02.webp?v=20",
  "assets/final3-page-03.webp?v=20",
  "assets/final3-page-04.webp?v=20",
  "assets/final3-page-05.webp?v=20",
  "assets/final3-page-06.webp?v=20",
  "assets/final3-page-07.webp?v=20",
  "assets/final3-page-08.webp?v=20",
  "assets/final3-page-09.webp?v=20",
];
const warmImageSources = imageSources.slice(1);

let autoPlay = true;
let autoTimer = null;
let currentPage = 0;
let userPauseTimer = null;
let speedIndex = 0;
let inviteStarted = false;
let inviteOpening = false;
let loadedAssets = 0;
let loadingFinished = false;
let petalsStarted = false;
let petalAnimationFrame = 0;
let petalResizeTimer = 0;
let petalContext = null;
let petalImage = null;
let petals = [];
const totalAssets = renderedImages.length;
const firstPageDelay = 1800;
const speeds = [
  { label: "\uC18D\uB3C4 \uBE60\uB984", delay: 3000 },
  { label: "\uC18D\uB3C4 \uBCF4\uD1B5", delay: 4500 },
  { label: "\uC18D\uB3C4 \uB290\uB9BC", delay: 6500 },
];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const weddingDate = new Date("2026-08-23T11:00:00+09:00");

document.body.classList.add("is-loading");
music.preload = "auto";
music.load();

class Petal {
  constructor(canvas, context, image) {
    this.canvas = canvas;
    this.context = context;
    this.image = image;
    this.x = Math.random() * canvas.clientWidth;
    this.y = Math.random() * canvas.clientHeight * 2 - canvas.clientHeight;
    this.initialize();
  }

  initialize() {
    this.width = 32 + Math.random() * 18;
    this.height = 26 + Math.random() * 12;
    this.opacity = 0.48 + Math.random() * 0.18;
    this.flip = Math.random();
    this.xSpeed = 0.6 + Math.random() * 0.8;
    this.ySpeed = 0.4 + Math.random() * 0.4;
    this.flipSpeed = Math.random() * 0.02;
  }

  draw() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    if (this.y > height || this.x > width) {
      this.initialize();
      const rand = Math.random() * (width + height);
      if (rand > width) {
        this.x = 0;
        this.y = rand - width;
      } else {
        this.x = rand;
        this.y = 0;
      }
    }

    this.context.globalAlpha = this.opacity;
    this.context.drawImage(
      this.image,
      this.x,
      this.y,
      this.width * (0.6 + Math.abs(Math.cos(this.flip)) / 3),
      this.height * (0.8 + Math.abs(Math.sin(this.flip)) / 5),
    );
  }

  animate() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.flip += this.flipSpeed;
    this.draw();
  }
}

function petalCount() {
  return Math.min(32, Math.max(12, Math.floor((window.innerWidth * window.innerHeight) / 23000)));
}

function resizePetalCanvas() {
  if (!petalCanvas || !petalContext) {
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  petalCanvas.width = Math.round(width * dpr);
  petalCanvas.height = Math.round(height * dpr);
  petalCanvas.style.width = `${width}px`;
  petalCanvas.style.height = `${height}px`;
  petalContext.setTransform(dpr, 0, 0, dpr, 0, 0);

  const nextCount = petalCount();
  if (petals.length > nextCount) {
    petals.length = nextCount;
  }
  while (petals.length < nextCount && petalImage) {
    petals.push(new Petal(petalCanvas, petalContext, petalImage));
  }
}

function renderPetals() {
  if (!petalCanvas || !petalContext || document.hidden) {
    return;
  }

  petalContext.clearRect(0, 0, petalCanvas.clientWidth, petalCanvas.clientHeight);
  petals.forEach((petal) => petal.animate());
  petalContext.globalAlpha = 1;
  petalAnimationFrame = requestAnimationFrame(renderPetals);
}

function startPetals() {
  if (petalsStarted || !petalCanvas || prefersReducedMotion) {
    return;
  }

  petalsStarted = true;
  petalContext = petalCanvas.getContext("2d");
  petalImage = new Image();
  petalImage.decoding = "async";
  petalImage.onload = () => {
    resizePetalCanvas();
    renderPetals();
  };
  petalImage.src = "assets/petal-v1.png";

  window.addEventListener("resize", () => {
    clearTimeout(petalResizeTimer);
    petalResizeTimer = setTimeout(resizePetalCanvas, 120);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(petalAnimationFrame);
    } else if (petalsStarted) {
      renderPetals();
    }
  });
}

function revealSheet(sheet) {
  sheet.classList.add("is-visible");
}

function setupSheetReveal() {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    sheets.forEach(revealSheet);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        revealSheet(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.34,
    rootMargin: "0px 0px -10% 0px",
  });

  sheets.forEach((sheet) => observer.observe(sheet));
}

function updateCountdown() {
  if (!countDays || !countHours || !countMinutes || !countSeconds) {
    return;
  }

  const diff = Math.max(0, weddingDate.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countDays.textContent = days;
  countHours.textContent = String(hours).padStart(2, "0");
  countMinutes.textContent = String(minutes).padStart(2, "0");
  countSeconds.textContent = String(seconds).padStart(2, "0");

  if (countMessage && diff === 0) {
    countMessage.textContent = "\uACBD\uAD6D \u00B7 \uBBF8\uC601\uC758 \uACB0\uD63C\uC2DD \uB0A0\uC785\uB2C8\uB2E4";
  }
}

function hideLoading() {
  if (loadingFinished) {
    return;
  }

  loadingFinished = true;
  setLoadingProgress(totalAssets);
  loadingScreen.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");
}

function setLoadingProgress(done) {
  const percent = Math.min(100, Math.round((done / totalAssets) * 100));
  loadingText.textContent = `청첩장을 준비하는 중 ${percent}%`;
  loadingBar.style.width = `${percent}%`;
  if (percent >= 100) {
    setTimeout(hideLoading, 250);
  }
}

function markAssetReady() {
  loadedAssets = Math.min(totalAssets, loadedAssets + 1);
  setLoadingProgress(loadedAssets);
}

function decodeRenderedImage(img) {
  img.loading = "eager";
  return new Promise((resolve) => {
    const finish = async () => {
      try {
        if (img.decode) {
          await img.decode();
        }
      } catch {
        // Some mobile WebViews reject decode for cached images that still render normally.
      }
      markAssetReady();
      resolve();
    };

    if (img.complete && img.naturalWidth > 0) {
      finish();
      return;
    }

    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
  });
}

async function preloadInvitationAssets() {
  setLoadingProgress(0);
  await Promise.all(renderedImages.map(decodeRenderedImage));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  hideLoading();
}

function warmImages(index = 0) {
  if (index >= warmImageSources.length) {
    return;
  }

  const img = new Image();
  img.decoding = "async";
  img.onload = img.onerror = () => setTimeout(() => warmImages(index + 1), 90);
  img.src = warmImageSources[index];
}

async function playMusic() {
  try {
    music.volume = 0.82;
    music.muted = false;
    await music.play();
    musicToggle.classList.add("is-playing");
    musicToggle.setAttribute("aria-label", "\uBC30\uACBD \uC74C\uC545 \uC815\uC9C0");
    musicToggle.querySelector("b").textContent = "\uC7AC\uC0DD\uC911";
    return true;
  } catch {
    musicToggle.classList.remove("is-playing");
    musicToggle.querySelector("b").textContent = "\uC74C\uC545 \uCF1C\uAE30";
    return false;
  }
}

function pauseMusic() {
  music.pause();
  musicToggle.classList.remove("is-playing");
  musicToggle.setAttribute("aria-label", "\uBC30\uACBD \uC74C\uC545 \uC7AC\uC0DD");
  musicToggle.querySelector("b").textContent = "\uC74C\uC545";
}

function openInvite() {
  if (inviteStarted) {
    return;
  }

  inviteStarted = true;
  document.body.classList.add("invite-opened");
  setupSheetReveal();
  revealSheet(sheets[0]);
  startPetals();
  goToPage(0, "auto");
  musicGate.classList.add("is-hidden");
  warmImages();
  setTimeout(() => {
    goToPage(1);
    startAutoPlay();
  }, firstPageDelay);
}

async function beginInvite(event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (inviteOpening || inviteStarted) {
    return false;
  }

  inviteOpening = true;
  const playAttempt = playMusic();
  openInvite();
  return playAttempt;
}

startInvite.addEventListener("pointerdown", beginInvite);
startInvite.addEventListener("touchstart", beginInvite, { passive: false });
startInvite.addEventListener("click", beginInvite);
musicGate.addEventListener("click", beginInvite);

musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    await playMusic();
  } else {
    pauseMusic();
  }
});

copyAddress.addEventListener("click", async () => {
  const address = "Western Benivis Sindorim, 7F Sindorim Techno Mart, 97 Saemal-ro, Guro-gu, Seoul";
  try {
    await navigator.clipboard.writeText(address);
    copyAddress.textContent = "\uBCF5\uC0AC \uC644\uB8CC";
    setTimeout(() => {
      copyAddress.textContent = "\uC8FC\uC18C \uBCF5\uC0AC";
    }, 1400);
  } catch {
    copyAddress.textContent = address;
  }
});

updateCountdown();
setInterval(updateCountdown, 1000);
preloadInvitationAssets();

function nearestPageIndex() {
  let best = 0;
  let bestDistance = Infinity;
  sheets.forEach((sheet, index) => {
    const distance = Math.abs(sheet.getBoundingClientRect().top);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

function updateActivePageState(index = nearestPageIndex()) {
  document.body.classList.toggle("is-location-active", index === sheets.length - 1);
}

function goToPage(index, behavior = "smooth") {
  currentPage = (index + sheets.length) % sheets.length;
  revealSheet(sheets[currentPage]);
  sheets[currentPage].scrollIntoView({ behavior, block: "start" });
  updateActivePageState(currentPage);
}

function startAutoPlay() {
  clearInterval(autoTimer);
  if (!autoPlay || !sheets.length) {
    return;
  }

  autoToggle.classList.add("is-playing");
  autoToggle.setAttribute("aria-label", "\uC790\uB3D9 \uB118\uAE40 \uC77C\uC2DC\uC815\uC9C0");
  autoToggle.querySelector("b").textContent = "\uC790\uB3D9";
  autoTimer = setInterval(() => {
    currentPage = nearestPageIndex();
    goToPage(currentPage + 1);
  }, speeds[speedIndex].delay);
}

function stopAutoPlay() {
  clearInterval(autoTimer);
  autoTimer = null;
  autoToggle.classList.remove("is-playing");
  autoToggle.setAttribute("aria-label", "\uC790\uB3D9 \uB118\uAE40 \uC2DC\uC791");
  autoToggle.querySelector("b").textContent = "\uC218\uB3D9";
}

function pauseAutoBriefly() {
  if (!inviteStarted || !musicGate.classList.contains("is-hidden")) {
    return;
  }

  if (!autoPlay) {
    return;
  }

  clearInterval(autoTimer);
  clearTimeout(userPauseTimer);
  userPauseTimer = setTimeout(startAutoPlay, 8000);
}

autoToggle.addEventListener("click", () => {
  autoPlay = !autoPlay;
  if (autoPlay) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
});

speedToggle.addEventListener("click", () => {
  speedIndex = (speedIndex + 1) % speeds.length;
  speedToggle.querySelector("b").textContent = speeds[speedIndex].label;
  if (autoPlay) {
    startAutoPlay();
  }
});

["wheel", "touchstart", "pointerdown", "keydown"].forEach((eventName) => {
  window.addEventListener(eventName, pauseAutoBriefly, { passive: true });
});

window.addEventListener("scroll", () => {
  requestAnimationFrame(() => updateActivePageState());
}, { passive: true });
