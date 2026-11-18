(function () {
  "use strict";

  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 1080;
  const params = new URLSearchParams(window.location.search);
  const forcedMode = params.get("kiosk");
  const diagnosticsEnabled = params.get("diagnostics") === "1";
  let viewport;
  let shell;
  let stage;
  let diagnostics;
  let assetState = "checking";

  function physicalScreenSize() {
    const ratio = window.devicePixelRatio || 1;
    return {
      width: Math.round(window.screen.width * ratio),
      height: Math.round(window.screen.height * ratio)
    };
  }

  function shouldUseKioskMode() {
    if (forcedMode === "1") return true;
    if (forcedMode === "0") return false;
    const screenSize = physicalScreenSize();
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    return screenSize.width >= 1900 && screenSize.height >= 1000 && aspect >= 1.5 && aspect <= 2.2;
  }

  function mountAdapter() {
    const experience = document.getElementById("experience");
    if (!experience || document.querySelector(".kiosk-stage")) return;

    viewport = document.createElement("div");
    viewport.className = "kiosk-viewport";
    viewport.setAttribute("aria-hidden", "false");
    shell = document.createElement("div");
    shell.className = "kiosk-shell";
    stage = document.createElement("div");
    stage.className = "kiosk-stage";

    experience.parentNode.insertBefore(viewport, experience);
    viewport.appendChild(shell);
    shell.appendChild(stage);
    stage.appendChild(experience);

    if (diagnosticsEnabled) {
      diagnostics = document.createElement("output");
      diagnostics.className = "display-diagnostics";
      diagnostics.setAttribute("aria-live", "polite");
      document.body.appendChild(diagnostics);
    }
  }

  function updateDiagnostics(scale, mode) {
    if (!diagnostics) return;
    const screenSize = physicalScreenSize();
    diagnostics.textContent = [
      `Display mode: ${mode ? "KIOSK" : "RESPONSIVE"}`,
      `Viewport: ${window.innerWidth} × ${window.innerHeight} CSS px`,
      `Screen: ${screenSize.width} × ${screenSize.height} physical px`,
      `Device pixel ratio: ${(window.devicePixelRatio || 1).toFixed(2)}`,
      `Aspect ratio: ${(window.innerWidth / Math.max(1, window.innerHeight)).toFixed(3)}`,
      `Stage scale: ${scale.toFixed(3)}`,
      `Assets: ${assetState}`,
      `Fullscreen: ${document.fullscreenElement ? "yes" : "no"}`
    ].join("\n");
  }

  function updateDisplay() {
    if (!viewport || !shell || !stage) return;
    const mode = shouldUseKioskMode();
    document.body.classList.toggle("kiosk-mode", mode);
    document.body.dataset.displayMode = mode ? "kiosk" : "responsive";

    if (!mode) {
      shell.removeAttribute("style");
      stage.style.removeProperty("--kiosk-scale");
      updateDiagnostics(1, false);
      return;
    }

    const availableWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const availableHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const scale = Math.min(availableWidth / DESIGN_WIDTH, availableHeight / DESIGN_HEIGHT);
    shell.style.width = `${DESIGN_WIDTH * scale}px`;
    shell.style.height = `${DESIGN_HEIGHT * scale}px`;
    stage.style.setProperty("--kiosk-scale", String(scale));
    updateDiagnostics(scale, true);
  }

  async function validateAssets() {
    const images = Array.from(document.querySelectorAll("#experience img"));
    const failed = [];

    await Promise.all(images.map(async image => {
      try {
        if (!image.complete) {
          await new Promise((resolve, reject) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", reject, { once: true });
          });
        }
        if (!image.naturalWidth || !image.naturalHeight) throw new Error("empty image");
        if (typeof image.decode === "function") await image.decode();
      } catch (error) {
        failed.push(image.getAttribute("src") || "unknown image");
        const optionalLayer = image.closest(".vegetation-piece");
        if (optionalLayer) optionalLayer.hidden = true;
      }
    }));

    assetState = failed.length ? `${failed.length} failed` : `${images.length}/${images.length} ready`;
    document.body.dataset.assetStatus = failed.length ? "error" : "ready";
    if (failed.length) console.warn("Savings Lab asset validation failed:", failed);
    updateDisplay();
  }

  function init() {
    mountAdapter();
    updateDisplay();
    validateAssets();
    window.addEventListener("resize", updateDisplay, { passive: true });
    window.addEventListener("orientationchange", updateDisplay, { passive: true });
    document.addEventListener("fullscreenchange", updateDisplay);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", updateDisplay, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
