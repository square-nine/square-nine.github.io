(() => {
  const form = document.querySelector("#personal-settings-form");

  if (!form) {
    return;
  }

  const theme = form.elements.namedItem("theme");
  const songPosition = form.elements.namedItem("song-position");
  const desktopSongPosition = form.elements.namedItem("desktop-song-position");
  const maxVolume = form.elements.namedItem("song-max-volume");
  const maxVolumeValue = document.querySelector("#personal-song-max-volume-value");
  const status = document.querySelector("#personal-settings-status");
  const desktopLayout = window.matchMedia("(min-width: 1200px)");
  let savedTheme = null;
  let savedSongPosition = null;
  let savedDesktopSongPosition = null;
  let savedMaxVolumeSetting = null;
  let storageAvailable = true;

  try {
    savedTheme = localStorage.getItem("theme");
    savedSongPosition = localStorage.getItem("song-control-position");
    savedDesktopSongPosition = localStorage.getItem("desktop-song-position");
    savedMaxVolumeSetting = localStorage.getItem("song-max-volume");
  } catch (error) {
    storageAvailable = false;
    console.error("Could not read saved settings.", error);
    status.textContent = "Browser storage is unavailable. Changes cannot be saved in this browser.";
  }

  const savedMaxVolume = Number(savedMaxVolumeSetting);

  theme.value = ["system", "light", "dark"].includes(savedTheme) ? savedTheme : "system";
  songPosition.value = ["top", "bottom"].includes(savedSongPosition) ? savedSongPosition : "bottom";
  desktopSongPosition.value = savedDesktopSongPosition === "bottom" ? "bottom" : "sidebar";
  maxVolume.value = savedMaxVolumeSetting !== null
    && Number.isInteger(savedMaxVolume)
    && savedMaxVolume >= 0
    && savedMaxVolume <= 100
    ? String(savedMaxVolume)
    : "50";

  const updateMaxVolumeValue = () => {
    maxVolumeValue.value = `${maxVolume.value}%`;
    maxVolumeValue.textContent = `${maxVolume.value}%`;
  };

  const updateSongControlSetting = () => {
    form.querySelector('[data-song-control-setting="mobile"]').hidden = desktopLayout.matches;
    form.querySelector('[data-song-control-setting="desktop"]').hidden = !desktopLayout.matches;
  };

  const saveSettings = () => {
    if (!storageAvailable) {
      status.textContent = "Browser storage is unavailable. Changes cannot be saved in this browser.";
      return;
    }

    try {
      if (!window.Theme || typeof window.Theme.update !== "function") {
        throw new Error("The theme controller is unavailable.");
      }

      window.Theme.update(theme.value);
      localStorage.setItem("song-control-position", songPosition.value);
      localStorage.setItem("desktop-song-position", desktopSongPosition.value);
      localStorage.setItem("song-max-volume", maxVolume.value);
      status.textContent = "Settings saved automatically in this browser.";
    } catch (error) {
      console.error("Could not save personal settings.", error);
      status.textContent = "Could not save settings. Check your browser’s local storage settings and try again.";
    }
  };

  theme.addEventListener("change", saveSettings);
  songPosition.addEventListener("change", saveSettings);
  desktopSongPosition.addEventListener("change", saveSettings);
  maxVolume.addEventListener("input", () => {
    updateMaxVolumeValue();
    saveSettings();
  });
  desktopLayout.addEventListener("change", updateSongControlSetting);
  updateMaxVolumeValue();
  updateSongControlSetting();
})();
