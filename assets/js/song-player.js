(() => {
  const players = document.querySelectorAll("[data-song-player]");

  players.forEach((player) => {
    const slot = player.closest("[data-song-player-slot]");
    const article = player.closest("article");
    const bottomAnchor = document.querySelector("[data-song-player-bottom-anchor]");
    const bottomSentinel = document.querySelector("[data-song-player-bottom-sentinel]");
    const home = document.createComment("song-player-home");
    slot.before(home);
    const audio = player.querySelector(".song-audio");
    const toggle = player.querySelector(".song-player-toggle");
    const progress = player.querySelector("[data-song-progress]");
    const currentTime = player.querySelector("[data-song-current-time]");
    const duration = player.querySelector("[data-song-duration]");
    const volume = player.querySelector("[data-song-volume]");
    const volumeValue = player.querySelector("[data-song-volume-value]");
    const status = player.querySelector("[data-song-status]");
    const icon = toggle.querySelector("i");
    const progressMax = Number(progress.max);
    const desktopLayout = window.matchMedia("(min-width: 1200px)");
    let hasBeenFullyVisible = false;
    let homeIsFullyVisible = false;
    let bottomAnchorIsVisible = false;
    let positionAnimation = null;
    let sidebarGroup = null;

    const restoreSidebarToc = (panel) => {
      if (!sidebarGroup) {
        return;
      }

      const toc = sidebarGroup.querySelector("#toc-wrapper");
      if (toc) {
        panel.insertBefore(toc, sidebarGroup);
      }
      sidebarGroup.remove();
      sidebarGroup = null;
    };

    const animatePositionChange = (changePosition) => {
      const before = player.getBoundingClientRect();
      positionAnimation?.cancel();
      changePosition();
      const after = player.getBoundingClientRect();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const deltaX = before.left - after.left;
      const deltaY = before.top - after.top;
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
        return;
      }

      positionAnimation = player.animate(
        [
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: "translate(0, 0)" }
        ],
        {
          duration: 260,
          easing: "cubic-bezier(0.2, 0.75, 0.25, 1)"
        }
      );
    };

    const setStickyState = (sticky) => {
      if (sticky) {
        slot.style.height = `${slot.getBoundingClientRect().height}px`;
      } else {
        slot.style.removeProperty("height");
      }

      player.classList.toggle("song-player-mobile-sticky", sticky);
    };

    const setSticky = (sticky) => {
      animatePositionChange(() => setStickyState(sticky));
    };

    const updateMobilePosition = () => {
      const savedPosition = localStorage.getItem("song-control-position");
      player.dataset.mobilePosition = savedPosition === "top" ? "top" : "bottom";
    };

    const moveToHome = () => {
      animatePositionChange(() => {
        home.after(slot);
        slot.append(player);
        slot.style.removeProperty("height");
        player.classList.remove("song-player-sidebar", "song-player-mobile-sticky");
      });
    };

    const moveToBottomAnchor = () => {
      animatePositionChange(() => {
        if (player.parentElement !== bottomAnchor) {
          setStickyState(false);
        }
        bottomAnchor.append(player);
        player.classList.remove("song-player-sidebar", "song-player-mobile-sticky");
        player.classList.add("song-player-mobile");
      });
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (desktopLayout.matches) {
        return;
      }

      homeIsFullyVisible = entry.intersectionRatio >= 0.999;
      if (homeIsFullyVisible) {
        hasBeenFullyVisible = true;
        if (bottomAnchorIsVisible) {
          moveToBottomAnchor();
        } else if (player.parentElement !== slot) {
          moveToHome();
        }
        if (player.parentElement === slot) {
          setSticky(false);
        }
      } else if (hasBeenFullyVisible) {
        if (bottomAnchorIsVisible) {
          moveToBottomAnchor();
        } else if (player.parentElement === slot) {
          setSticky(true);
        }
      }
    }, { threshold: [0, 0.999, 1] });

    const bottomObserver = new IntersectionObserver(([entry]) => {
      if (desktopLayout.matches) {
        return;
      }

      bottomAnchorIsVisible = entry.isIntersecting;
      if (bottomAnchorIsVisible) {
        moveToBottomAnchor();
      } else if (player.parentElement === bottomAnchor) {
        moveToHome();
        if (hasBeenFullyVisible && !homeIsFullyVisible) {
          setSticky(true);
        }
      }
    }, { threshold: 0 });

    const placePlayer = () => {
      const panel = document.querySelector("#panel-wrapper");

      if (desktopLayout.matches && panel) {
        article.style.removeProperty("overflow-anchor");
        animatePositionChange(() => {
          setStickyState(false);
          player.classList.remove("song-player-mobile", "song-player-mobile-sticky", "song-player-sidebar");

          if (localStorage.getItem("desktop-song-position") === "bottom") {
            panel.classList.remove("has-song-player");
            restoreSidebarToc(panel);
            bottomAnchor.append(player);
          } else {
            panel.classList.add("has-song-player");
            player.classList.add("song-player-sidebar");
            const toc = panel.querySelector("#toc-wrapper");
            if (toc) {
              if (!sidebarGroup) {
                sidebarGroup = document.createElement("div");
                sidebarGroup.className = "song-player-sidebar-group";
                toc.before(sidebarGroup);
                sidebarGroup.append(toc);
              }
              sidebarGroup.append(player);
            } else {
              panel.append(player);
            }
          }
        });
        return;
      }

      if (panel) {
        restoreSidebarToc(panel);
      }
      player.classList.remove("song-player-sidebar");
      slot.classList.remove("song-player-sidebar");
      panel?.classList.remove("has-song-player");
      article.style.overflowAnchor = "none";
      if (player.parentElement !== slot) {
        moveToHome();
      }
      updateMobilePosition();
      player.classList.add("song-player-mobile");
      hasBeenFullyVisible = false;
      visibilityObserver.observe(slot);
      bottomObserver.observe(bottomSentinel);
    };

    placePlayer();
    desktopLayout.addEventListener("change", placePlayer);
    window.addEventListener("storage", (event) => {
      if (event.key === "song-max-volume") {
        updateVolume();
      }
      if (event.key === "song-control-position" && !desktopLayout.matches) {
        updateMobilePosition();
      }
      if (event.key === "desktop-song-position" && desktopLayout.matches) {
        placePlayer();
      }
    });

    const getMaxVolume = () => {
      const savedMaxVolumeSetting = localStorage.getItem("song-max-volume");
      const savedMaxVolume = Number(savedMaxVolumeSetting);
      return savedMaxVolumeSetting !== null
        && Number.isInteger(savedMaxVolume)
        && savedMaxVolume >= 0
        && savedMaxVolume <= 100
        ? savedMaxVolume
        : 50;
    };

    const updateVolume = () => {
      const percent = Number(volume.value);
      const maxVolume = getMaxVolume();
      audio.volume = (percent / 50) * (maxVolume / 100);
      const displayedPercent = percent * 2;
      volumeValue.value = `${displayedPercent}%`;
      volumeValue.textContent = `${displayedPercent}%`;
      volume.setAttribute(
        "aria-valuetext",
        `${displayedPercent}% player volume; maximum audio output is ${maxVolume}%`
      );
      volume.style.setProperty("--song-volume", `${(percent / 50) * 100}%`);
    };

    const formatTime = (time) => {
      if (!Number.isFinite(time)) {
        return "0:00";
      }

      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    };

    const updateProgress = () => {
      const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      progress.value = String(Math.round((percent / 100) * progressMax));
      progress.style.setProperty("--song-progress", `${percent}%`);
      currentTime.textContent = formatTime(audio.currentTime);
    };

    const updateToggle = () => {
      const isPlaying = !audio.paused;
      toggle.setAttribute("aria-label", isPlaying ? "Pause song" : "Play song");
      icon.classList.toggle("fa-play", !isPlaying);
      icon.classList.toggle("fa-pause", isPlaying);
    };

    audio.addEventListener("loadedmetadata", () => {
      progress.disabled = false;
      duration.textContent = formatTime(audio.duration);
      updateProgress();
    });

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("play", updateToggle);
    audio.addEventListener("pause", updateToggle);
    audio.addEventListener("ended", updateToggle);
    audio.addEventListener("error", () => {
      status.textContent = "The audio file could not be loaded.";
    });

    toggle.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().then(() => {
          status.textContent = "";
        }).catch(() => {
          status.textContent = "Playback could not start. Check the audio file and try again.";
        });
      } else {
        audio.pause();
      }
    });

    progress.addEventListener("input", () => {
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = (Number(progress.value) / progressMax) * audio.duration;
        updateProgress();
      }
    });

    volume.addEventListener("input", updateVolume);
    updateVolume();
  });
})();
