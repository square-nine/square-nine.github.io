---
title: Settings
icon: fas fa-sliders
order: 5
---

Choose how this site looks and where the song player appears. Settings are saved in this browser and stay available on future visits. They are not synced between devices or browsers.

<form id="personal-settings-form" class="personal-settings-form">
  <div class="personal-settings-field">
    <label for="personal-theme-mode">Colour theme</label>
    <select id="personal-theme-mode" name="theme">
      <option value="system">Follow device setting</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </div>

  <div class="personal-settings-field" data-song-control-setting="mobile">
    <label for="personal-song-position">Song Control on mobile</label>
    <select id="personal-song-position" name="song-position">
      <option value="bottom">Keep the player at the bottom while scrolling</option>
      <option value="top">Keep the player at the top while scrolling</option>
    </select>
  </div>

  <div class="personal-settings-field" data-song-control-setting="desktop">
    <label for="personal-desktop-song-position">Song Control on desktop</label>
    <select id="personal-desktop-song-position" name="desktop-song-position">
      <option value="sidebar">Contents sidebar</option>
      <option value="bottom">Above the like button</option>
    </select>
  </div>

  <div class="personal-settings-field">
    <label for="personal-song-max-volume">Maximum song volume</label>
    <div class="personal-settings-volume">
      <input
        id="personal-song-max-volume"
        name="song-max-volume"
        type="range"
        min="0"
        max="100"
        step="1"
        value="50"
        aria-describedby="personal-song-max-volume-value"
      >
      <output id="personal-song-max-volume-value" for="personal-song-max-volume">50%</output>
    </div>
  </div>

  <p id="personal-settings-status" class="personal-settings-status" role="status" aria-live="polite">
    Settings save automatically in this browser.
  </p>
</form>

<script src="{{ '/assets/js/personal-settings.js' | relative_url }}" defer></script>
