const music = document.getElementById("bgMusic");
const musicGate = document.getElementById("musicGate");
const startInvite = document.getElementById("startInvite");
const musicToggle = document.getElementById("musicToggle");
const copyAddress = document.getElementById("copyAddress");
const loadingScreen = document.getElementById("loadingScreen");
const firstImage = document.querySelector(".invite img");
const autoToggle = document.getElementById("autoToggle");
const speedToggle = document.getElementById("speedToggle");
const sheets = [...document.querySelectorAll(".sheet")];

let autoPlay = true;
let autoTimer = null;
let currentPage = 0;
let userPauseTimer = null;
let speedIndex = 0;
const speeds = [
  { label: "\uC18D\uB3C4 \uBE60\uB984", delay: 3000 },
  { label: "\uC18D\uB3C4 \uBCF4\uD1B5", delay: 4500 },
  { label: "\uC18D\uB3C4 \uB290\uB9BC", delay: 6500 },
];

document.body.classList.add("is-loading");

function hideLoading() {
  loadingScreen.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
}

function preloadImage(img) {
  if (!img) {
    hideLoading();
    return;
  }

  if (img.complete && img.naturalWidth > 0) {
    hideLoading();
    return;
  }

  img.addEventListener("load", hideLoading, { once: true });
  img.addEventListener("error", hideLoading, { once: true });
  setTimeout(hideLoading, 2400);
}

async function playMusic() {
  try {
    music.volume = 0.82;
    await music.play();
    musicToggle.classList.add("is-playing");
    musicToggle.setAttribute("aria-label", "\uBC30\uACBD \uC74C\uC545 \uC815\uC9C0");
    musicToggle.querySelector("b").textContent = "\uC7AC\uC0DD\uC911";
    return true;
  } catch {
    musicToggle.classList.remove("is-playing");
    musicToggle.querySelector("b").textContent = "\uC74C\uC545";
    return false;
  }
}

function pauseMusic() {
  music.pause();
  musicToggle.classList.remove("is-playing");
  musicToggle.setAttribute("aria-label", "\uBC30\uACBD \uC74C\uC545 \uC7AC\uC0DD");
  musicToggle.querySelector("b").textContent = "\uC74C\uC545";
}

async function beginInvite() {
  await playMusic();
  musicGate.classList.add("is-hidden");
  startAutoPlay();
}

["pointerdown", "touchstart", "click"].forEach((eventName) => {
  startInvite.addEventListener(
    eventName,
    (event) => {
      event.preventDefault();
      beginInvite();
    },
    { once: true }
  );
});

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

preloadImage(firstImage);

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

function goToPage(index) {
  currentPage = (index + sheets.length) % sheets.length;
  sheets[currentPage].scrollIntoView({ behavior: "smooth", block: "start" });
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
