const music = document.getElementById("bgMusic");
const musicGate = document.getElementById("musicGate");
const startInvite = document.getElementById("startInvite");
const musicToggle = document.getElementById("musicToggle");
const copyAddress = document.getElementById("copyAddress");
const loadingScreen = document.getElementById("loadingScreen");
const firstImage = document.querySelector(".invite img");
const autoToggle = document.getElementById("autoToggle");
const sheets = [...document.querySelectorAll(".sheet")];

let autoPlay = true;
let autoTimer = null;
let currentPage = 0;
let userPauseTimer = null;

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
    musicToggle.setAttribute("aria-label", "Pause background music");
    musicToggle.querySelector("b").textContent = "Playing";
    return true;
  } catch {
    musicToggle.classList.remove("is-playing");
    musicToggle.querySelector("b").textContent = "Music";
    return false;
  }
}

function pauseMusic() {
  music.pause();
  musicToggle.classList.remove("is-playing");
  musicToggle.setAttribute("aria-label", "Play background music");
  musicToggle.querySelector("b").textContent = "Music";
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
    copyAddress.textContent = "Copied";
    setTimeout(() => {
      copyAddress.textContent = "Copy Address";
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
  autoToggle.setAttribute("aria-label", "Pause auto page play");
  autoToggle.querySelector("b").textContent = "Auto";
  autoTimer = setInterval(() => {
    currentPage = nearestPageIndex();
    goToPage(currentPage + 1);
  }, 5200);
}

function stopAutoPlay() {
  clearInterval(autoTimer);
  autoTimer = null;
  autoToggle.classList.remove("is-playing");
  autoToggle.setAttribute("aria-label", "Start auto page play");
  autoToggle.querySelector("b").textContent = "Manual";
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

["wheel", "touchstart", "pointerdown", "keydown"].forEach((eventName) => {
  window.addEventListener(eventName, pauseAutoBriefly, { passive: true });
});
