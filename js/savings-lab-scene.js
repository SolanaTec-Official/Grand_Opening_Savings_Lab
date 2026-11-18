(function () {
  "use strict";

  const stageForScreen = { welcome: 1, profile: 3, results: 5 };
  let scene;
  let pieces = [];
  let sequence = 0;
  let timers = [];
  let observer;

  function sizeVisualPlanes() {
    if (!scene) return;
    const width = scene.clientWidth;
    const height = scene.clientHeight;
    if (!width || !height) return;

    const sourceWidth = 1600;
    const sourceHeight = 900;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    const planeWidth = sourceWidth * scale;
    const planeHeight = sourceHeight * scale;
    const left = (width - planeWidth) / 2;
    const top = (height - planeHeight) / 2;

    scene.querySelectorAll(".visual-plane").forEach(plane => {
      plane.style.width = `${planeWidth}px`;
      plane.style.height = `${planeHeight}px`;
      plane.style.left = `${left}px`;
      plane.style.top = `${top}px`;
    });
  }

  function clearTimers() {
    timers.forEach(timer => window.clearTimeout(timer));
    timers = [];
  }

  function finishGrowth(piece, currentSequence) {
    const timer = window.setTimeout(() => {
      if (currentSequence === sequence) piece.classList.remove("is-growing");
    }, 1380);
    timers.push(timer);
  }

  function transitionVegetation(stage) {
    const currentSequence = ++sequence;
    clearTimers();
    pieces.forEach(piece => piece.classList.remove("is-growing"));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      pieces.forEach(piece => piece.classList.toggle("is-visible", Number(piece.dataset.stage) <= stage));
      return;
    }

    const leaving = pieces
      .filter(piece => Number(piece.dataset.stage) > stage && piece.classList.contains("is-visible"))
      .sort((a, b) => Number(b.dataset.order) - Number(a.dataset.order));
    const entering = pieces
      .filter(piece => Number(piece.dataset.stage) <= stage && !piece.classList.contains("is-visible"))
      .sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));

    leaving.forEach((piece, index) => {
      const timer = window.setTimeout(() => {
        if (currentSequence !== sequence) return;
        piece.classList.remove("is-visible", "is-growing");
      }, index * 80);
      timers.push(timer);
    });

    entering.forEach((piece, index) => {
      const timer = window.setTimeout(() => {
        if (currentSequence !== sequence) return;
        piece.classList.add("is-visible", "is-growing");
        finishGrowth(piece, currentSequence);
      }, 120 + index * 150);
      timers.push(timer);
    });
  }

  function setStep(screen) {
    const stage = stageForScreen[screen] || stageForScreen.welcome;
    transitionVegetation(stage);
    scene.dataset.step = screen;
  }

  function setProfileStep(step) {
    const boundedStep = Math.max(1, Math.min(4, Number(step) || 1));
    transitionVegetation(Math.min(4, boundedStep + 1));
    scene.dataset.step = "profile";
    scene.dataset.profileStep = String(boundedStep);
  }

  function init() {
    scene = document.getElementById("sceneCard");
    pieces = Array.from(scene.querySelectorAll(".vegetation-piece"));
    scene.style.setProperty("--morning", "0");
    scene.style.setProperty("--noon", "1");
    scene.style.setProperty("--evening", "0");
    scene.style.setProperty("--scene-brightness", "1");
    scene.style.setProperty("--scene-saturation", "1");
    scene.style.setProperty("--tree-brightness", "1");
    scene.style.setProperty("--tree-saturation", "1");
    sizeVisualPlanes();
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(sizeVisualPlanes);
      observer.observe(scene);
    } else {
      window.addEventListener("resize", sizeVisualPlanes, { passive: true });
    }
    window.addEventListener("orientationchange", sizeVisualPlanes, { passive: true });
    setStep("welcome");
  }

  window.SavingsLabScene = Object.freeze({ init, setStep, setProfileStep, sizeVisualPlanes });
})();
