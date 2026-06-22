const music = document.getElementById("bgMusic");
const musicGate = document.getElementById("musicGate");
const startInvite = document.getElementById("startInvite");
const musicToggle = document.getElementById("musicToggle");
const copyAddress = document.getElementById("copyAddress");
const loadingScreen = document.getElementById("loadingScreen");
const firstImage = document.querySelector(".invite img");

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
