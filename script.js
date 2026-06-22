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
const sheets = [...document.querySelectorAll(".sheet")];
const renderedImages = [...document.querySelectorAll(".sheet img")];
const imageSources = [
  "assets/final3-page-01.webp?v=15",
  "assets/final3-page-02.webp?v=15",
  "assets/final3-page-03.webp?v=15",
  "assets/final3-page-04.webp?v=15",
  "assets/final3-page-05.webp?v=15",
  "assets/final3-page-06.webp?v=15",
  "assets/final3-page-07.webp?v=15",
  "assets/final3-page-08.webp?v=15",
  "assets/final3-page-09.webp?v=15",
];
const warmImageSources = imageSources.slice(1);
const musicSource = "assets/wedding-music-fast.mp3?v=15";

let autoPlay = true;
let autoTimer = null;
let currentPage = 0;
let userPauseTimer = null;
let speedIndex = 0;
let inviteStarted = false;
let inviteOpening = false;
let loadedAssets = 0;
let loadingFinished = false;
const totalAssets = renderedImages.length + 1;
const speeds = [
  { label: "\uC18D\uB3C4 \uBE60\uB984", delay: 3000 },
  { label: "\uC18D\uB3C4 \uBCF4\uD1B5", delay: 4500 },
  { label: "\uC18D\uB3C4 \uB290\uB9BC", delay: 6500 },
];

document.body.classList.add("is-loading");
music.preload = "auto";
music.load();

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

function loadAudioAsset() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      markAssetReady();
      resolve();
    };

    if (music.readyState >= 2) {
      finish();
      return;
    }

    music.addEventListener("loadeddata", finish, { once: true });
    music.addEventListener("canplay", finish, { once: true });
    music.addEventListener("error", finish, { once: true });
    setTimeout(finish, 4500);
  });
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
  const timeout = new Promise((resolve) => setTimeout(resolve, 18000));
  const assets = Promise.all([
    ...renderedImages.map(decodeRenderedImage),
    loadAudioAsset(),
  ]);
  await Promise.race([assets, timeout]);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  hideLoading();
}

setTimeout(() => {
  if (!loadingFinished) {
    hideLoading();
  }
}, 19000);

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
  goToPage(0, "auto");
  musicGate.classList.add("is-hidden");
  warmImages();
  setTimeout(startAutoPlay, 8000);
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

function goToPage(index, behavior = "smooth") {
  currentPage = (index + sheets.length) % sheets.length;
  sheets[currentPage].scrollIntoView({ behavior, block: "start" });
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
