(function () {
  "use strict";

  const calculator = window.SavingsLabCalculator;
  const scene = window.SavingsLabScene;
  const numberAnimations = new WeakMap();

  const translations = {
    en: {
      boothLabel: "Booth 06 · Savings Lab", welcomeTitle: "How much can<br>your roof <em>save?</em>",
      welcomeCopy: "Tell us your electricity bill. In 30 seconds, see your estimated savings and payback.",
      selfPlay: "Self-play experience", start: "Calculate Savings",
      profileKicker: "Your savings profile", profileTitle: "Build your estimate.", profileStep: "Profile", resultsStep: "Results",
      billTitle: "Monthly TNB bill", billHint: "Tap the closest amount or drag.", supplyTitle: "Electricity supply",
      supplyHint: "Three-phase homes usually have three main switches in the DB box.",
      singlePhase: "Single-phase", threePhase: "Three-phase", notSure: "Not sure", daytimeTitle: "Daytime use",
      mostlyOut: "Mostly out", sometimes: "Sometimes", mostlyHome: "Mostly home", locationTitle: "Location",
      daytimeQuestion: "Is someone home in the daytime?", daytimeHint: "Solar works best when you use power while the sun is up.",
      mostlyOutDesc: "Work or school all day", sometimesDesc: "Someone home part of the day",
      mostlyHomeDesc: "Work from home, retirees or kids", daytimeShare: "Daytime share of your electricity",
      daytimeFineTune: "Drag to fine-tune. Aircon at night and EV charging at night lower this number.",
      locationHint: "Sunlight differs slightly by area.", next: "Next", stepOf: "Step {current} of 4",
      back: "Back", showResults: "Show my savings", daytimePill: "used in daytime", liveEstimate: "Live estimate",
      panels: "panels", saveAbout: "about", perMonth: "/ month", resultKicker: "Your savings result",
      recommended: "Recommended", batteryName: "Solar + battery", saveAboutCaps: "Save about",
      newBill: "Estimated new bill", solarPanels: "Solar panels", systemSize: "System size", simplePayback: "Simple payback",
      years: "years", keepResult: "Keep my result", startAgain: "Start again", compare: "Compare your options",
      solarOnly: "1. Solar only (on-grid inverter)", solarOnlyDesc: "Lowest cost, fastest payback", hybridReady: "2. Solar with hybrid inverter",
      hybridDesc: "Add a battery any time later", batteryShort: "3. Solar + battery + backup", batteryDesc: "Keeps your lights on in a blackout",
      blackoutBadge: "Power in blackout", billAfter: "Bill after", kwpPanels: "kWp (panels)",
      payback: "Payback", disclaimer: "Illustrative estimate · Final design confirmed after site assessment",
      finalKicker: "Station 06 complete", finalTitle: "Your Savings Lab result",
      finalCopy: "Take a photo of your result, then continue to the next station.",
      photoReady: "Photo checkpoint · Show your result at the next station", estimatedSaving: "Estimated monthly savings",
      close: "Close", resolvedSingle: "single-phase", resolvedThree: "three-phase"
    },
    zh: {
      boothLabel: "第 06 站 · 节能实验室", welcomeTitle: "您家的屋顶，<br>能<em>省多少？</em>",
      welcomeCopy: "告诉我们您的电费，30 秒就能看到预计节省金额和回本时间。",
      selfPlay: "自助互动体验", start: "计算节省金额",
      profileKicker: "您的节能资料", profileTitle: "建立您的估算。", profileStep: "资料", resultsStep: "结果",
      billTitle: "每月 TNB 电费", billHint: "选择最接近的金额或拖动滑杆。", supplyTitle: "家里的电力供应",
      supplyHint: "三相电住宅的配电箱通常有三个主开关。",
      singlePhase: "单相电", threePhase: "三相电", notSure: "不确定", daytimeTitle: "白天用电",
      mostlyOut: "大多不在家", sometimes: "有时在家", mostlyHome: "大多在家", locationTitle: "所在地区",
      daytimeQuestion: "白天有人在家吗？", daytimeHint: "太阳能在白天用电时效果最好。",
      mostlyOutDesc: "全天上班或上学", sometimesDesc: "白天部分时间有人在家",
      mostlyHomeDesc: "居家办公、退休人士或孩子在家", daytimeShare: "白天用电比例",
      daytimeFineTune: "拖动滑杆微调。夜间冷气和夜间电动车充电会降低这个比例。",
      locationHint: "不同地区的日照略有差异。", next: "下一步", stepOf: "第 {current} 步，共 4 步",
      back: "返回", showResults: "查看节省结果", daytimePill: "白天使用", liveEstimate: "即时估算",
      panels: "片板", saveAbout: "每月约省", perMonth: "/ 月", resultKicker: "您的节省结果",
      recommended: "根据资料推荐", batteryName: "太阳能 + 电池", saveAboutCaps: "每月约省",
      newBill: "安装后预计电费", solarPanels: "太阳能板", systemSize: "系统容量", simplePayback: "简单回本期",
      years: "年", keepResult: "保存结果", startAgain: "重新开始", compare: "比较三个方案",
      solarOnly: "1. 仅太阳能（并网逆变器）", solarOnlyDesc: "成本最低，回本最快", hybridReady: "2. 太阳能 + 混合逆变器",
      hybridDesc: "日后可随时加装电池", batteryShort: "3. 太阳能 + 电池 + 备用电力", batteryDesc: "停电时仍可维持照明",
      blackoutBadge: "停电时继续供电", billAfter: "安装后电费", kwpPanels: "kWp（太阳能板）",
      payback: "回本", disclaimer: "仅供活动估算 · 最终设计以现场勘察为准",
      finalKicker: "第 06 站完成", finalTitle: "您的节能实验室结果",
      finalCopy: "请拍下您的结果，然后前往下一站。",
      photoReady: "拍照打卡 · 在下一站出示您的结果", estimatedSaving: "预计每月节省",
      close: "关闭", resolvedSingle: "单相电", resolvedThree: "三相电"
    }
  };

  const state = {
    screen: "welcome",
    language: "en",
    bill: 400,
    phase: "auto",
    dayRatio: 0.3,
    area: "JB",
    result: null,
    profileStep: 1,
    transitioning: false,
    transitionTimer: 0
  };

  const byId = id => document.getElementById(id);
  const formatNumber = value => Math.round(Number(value) || 0).toLocaleString("en-MY");
  const money = value => `RM${formatNumber(value)}`;
  const payback = value => Number.isFinite(value) ? Number(value).toFixed(1) : "—";
  const text = key => translations[state.language][key] || translations.en[key] || key;

  function setScreen(nextScreen) {
    state.screen = nextScreen;
    byId("experience").dataset.screen = nextScreen;
    document.querySelectorAll(".lab-screen").forEach(screenElement => {
      const active = screenElement.id === `${nextScreen}Screen`;
      screenElement.classList.toggle("active", active);
      screenElement.setAttribute("aria-hidden", String(!active));
    });
    if (nextScreen === "profile" && scene.setProfileStep) scene.setProfileStep(state.profileStep);
    else scene.setStep(nextScreen);
    if (nextScreen !== "welcome") renderCalculation(nextScreen === "results");
    if (nextScreen === "profile") renderProfileStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateLanguage() {
    document.documentElement.lang = state.language === "zh" ? "zh-Hans" : "en";
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const value = text(element.dataset.i18n);
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(element => {
      const value = text(element.dataset.i18nHtml);
      if (value) element.innerHTML = value;
    });
    document.querySelectorAll("[data-lang]").forEach(button => {
      const active = button.dataset.lang === state.language;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderCalculation();
    renderProfileStep();
    if (!byId("resultModal").hidden) renderPhotoResult();
  }

  function updateRangeFill(range, value, minimum, maximum) {
    const percentage = (value - minimum) / (maximum - minimum) * 100;
    range.style.setProperty("--fill", `${Math.max(0, Math.min(100, percentage))}%`);
  }

  function animateNumber(element, target, formatter, options = {}) {
    const numericTarget = Number(target);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const existingFrame = numberAnimations.get(element);
    if (existingFrame) window.cancelAnimationFrame(existingFrame);

    if (!Number.isFinite(numericTarget)) {
      element.textContent = formatter(numericTarget);
      element.dataset.animatedValue = String(numericTarget);
      return;
    }

    const storedValue = Number(element.dataset.animatedValue);
    const forcedStart = Number(options.from);
    const startValue = Number.isFinite(forcedStart)
      ? forcedStart
      : (Number.isFinite(storedValue) ? storedValue : numericTarget);
    const duration = Math.max(180, Number(options.duration) || 560);

    if (reducedMotion || Math.abs(numericTarget - startValue) < 0.005) {
      element.textContent = formatter(numericTarget);
      element.dataset.animatedValue = String(numericTarget);
      return;
    }

    const startedAt = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (numericTarget - startValue) * eased;
      element.textContent = formatter(currentValue);
      element.dataset.animatedValue = String(currentValue);
      if (progress < 1) numberAnimations.set(element, window.requestAnimationFrame(tick));
      else {
        element.textContent = formatter(numericTarget);
        element.dataset.animatedValue = String(numericTarget);
        numberAnimations.delete(element);
      }
    };
    numberAnimations.set(element, window.requestAnimationFrame(tick));
  }

  function normalizeBill(value) {
    const numeric = Number(value);
    const bounded = Math.max(50, Math.min(3000, Number.isFinite(numeric) ? numeric : 400));
    return Math.round(bounded / 10) * 10;
  }

  function setBill(value) {
    state.bill = normalizeBill(value);
    renderCalculation();
  }

  function setDaytime(value) {
    const percentage = Math.max(10, Math.min(70, Number(value) || 30));
    state.dayRatio = percentage / 100;
    renderCalculation();
  }

  function setSelected(selector, dataName, value) {
    document.querySelectorAll(selector).forEach(button => {
      button.classList.toggle("active", button.dataset[dataName] === String(value));
    });
  }

  function renderCalculation(forceResultAnimation = false) {
    state.result = calculator.calculate(state);
    const result = state.result;
    const battery = result.battery;

    byId("billInput").value = state.bill;
    byId("billRange").value = Math.min(3000, state.bill);
    updateRangeFill(byId("billRange"), Math.min(3000, state.bill), 50, 3000);
    byId("daytimeRange").value = Math.round(state.dayRatio * 100);
    updateRangeFill(byId("daytimeRange"), state.dayRatio * 100, 10, 70);
    byId("daytimeReadout").textContent = `${Math.round(state.dayRatio * 100)}%`;
    animateNumber(byId("livePanels"), battery.panels, formatNumber);
    animateNumber(byId("liveSaving"), battery.saving, money);

    const resultAnimation = forceResultAnimation ? { from: 0, duration: 760 } : {};
    animateNumber(byId("heroSaving"), battery.saving, formatNumber, resultAnimation);
    animateNumber(byId("resultNewBill"), battery.after, money, resultAnimation);
    animateNumber(byId("resultPanels"), battery.panels, formatNumber, resultAnimation);
    animateNumber(byId("resultKwp"), battery.kwp, value => `${Number(value).toFixed(1)} kWp`, resultAnimation);
    animateNumber(byId("resultPayback"), battery.payback, payback, resultAnimation);

    animateNumber(byId("onGridSaving"), result.onGrid.saving, money, resultAnimation);
    animateNumber(byId("onGridPayback"), result.onGrid.payback, value => `${payback(value)} ${text("years")}`, resultAnimation);
    animateNumber(byId("onGridAfter"), result.onGrid.after, money, resultAnimation);
    animateNumber(byId("onGridKwp"), result.onGrid.kwp, value => `${Number(value).toFixed(1)} (${result.onGrid.panels})`, resultAnimation);
    animateNumber(byId("hybridSaving"), result.hybrid.saving, money, resultAnimation);
    animateNumber(byId("hybridPayback"), result.hybrid.payback, value => `${payback(value)} ${text("years")}`, resultAnimation);
    animateNumber(byId("hybridAfter"), result.hybrid.after, money, resultAnimation);
    animateNumber(byId("hybridKwp"), result.hybrid.kwp, value => `${Number(value).toFixed(1)} (${result.hybrid.panels})`, resultAnimation);
    animateNumber(byId("batterySaving"), battery.saving, money, resultAnimation);
    animateNumber(byId("batteryPayback"), battery.payback, value => `${payback(value)} ${text("years")}`, resultAnimation);
    animateNumber(byId("batteryAfter"), battery.after, money, resultAnimation);
    animateNumber(byId("batteryKwp"), battery.kwp, value => `${Number(value).toFixed(1)} (${battery.panels})`, resultAnimation);

    setSelected("[data-bill]", "bill", state.bill);
    setSelected("[data-phase]", "phase", state.phase);
    setSelected("[data-day]", "day", Math.round(state.dayRatio * 100));
    setSelected("[data-area]", "area", state.area);
  }

  function renderPhotoResult() {
    const battery = state.result.battery;
    byId("shareSummary").innerHTML = `
      <div class="share-hero">
        <span>${text("estimatedSaving")}</span>
        <strong>${money(battery.saving)} <small>${text("perMonth")}</small></strong>
      </div>
      <div class="share-metrics">
        <div><span>${text("solarPanels")}</span><b>${battery.panels} ${text("panels")}</b></div>
        <div><span>${text("systemSize")}</span><b>${battery.kwp.toFixed(1)} kWp</b></div>
        <div><span>${text("simplePayback")}</span><b>${payback(battery.payback)} ${text("years")}</b></div>
      </div>`;
  }

  function openResultModal() {
    const modal = byId("resultModal");
    renderPhotoResult();
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("open"));
    document.body.classList.add("modal-open");
    modal.querySelector(".modal-close").focus();
  }

  function closeResultModal() {
    const modal = byId("resultModal");
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    window.setTimeout(() => { modal.hidden = true; }, 220);
  }

  function resetExperience() {
    window.clearTimeout(state.transitionTimer);
    state.transitioning = false;
    byId("experience").classList.remove("is-returning");
    byId("profileScreen").classList.remove("is-returning");
    state.bill = 400;
    state.phase = "auto";
    state.dayRatio = 0.3;
    state.area = "JB";
    state.profileStep = 1;
    closeResultModal();
    renderCalculation();
    renderProfileStep();
    setScreen("welcome");
  }

  function returnToWelcome() {
    if (state.transitioning) return;
    state.transitioning = true;
    const experience = byId("experience");
    const profileScreen = byId("profileScreen");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    experience.classList.add("is-returning");
    profileScreen.classList.add("is-returning");
    state.transitionTimer = window.setTimeout(() => {
      setScreen("welcome");
      experience.classList.remove("is-returning");
      profileScreen.classList.remove("is-returning");
      state.transitioning = false;
      state.transitionTimer = 0;
    }, reducedMotion ? 0 : 500);
  }

  function renderProfileStep() {
    const step = state.profileStep;
    document.querySelectorAll("[data-profile-step]").forEach(panel => {
      const active = Number(panel.dataset.profileStep) === step;
      panel.classList.toggle("active", active);
      panel.setAttribute("aria-hidden", String(!active));
    });
    document.querySelectorAll("[data-step-dot]").forEach(dot => {
      const dotStep = Number(dot.dataset.stepDot);
      dot.classList.toggle("active", dotStep === step);
      dot.classList.toggle("complete", dotStep < step);
    });
    byId("profileStepLabel").textContent = text("stepOf").replace("{current}", step);
    const lastStep = step === 4;
    const nextLabel = byId("profileNextLabel");
    nextLabel.dataset.i18n = lastStep ? "showResults" : "next";
    nextLabel.textContent = text(nextLabel.dataset.i18n);
  }

  function setProfileStep(nextStep) {
    const boundedStep = Math.max(1, Math.min(4, Number(nextStep) || 1));
    const card = document.querySelector(".profile-card");
    card.dataset.profileDirection = boundedStep < state.profileStep ? "backward" : "forward";
    state.profileStep = boundedStep;
    renderProfileStep();
    if (scene.setProfileStep) scene.setProfileStep(state.profileStep);
  }

  function bindControls() {
    byId("startButton").addEventListener("click", () => {
      state.profileStep = 1;
      setScreen("profile");
    });
    byId("profileBackButton").addEventListener("click", () => {
      if (state.profileStep === 1) returnToWelcome();
      else setProfileStep(state.profileStep - 1);
    });
    byId("profileNextButton").addEventListener("click", () => {
      if (state.profileStep === 4) setScreen("results");
      else setProfileStep(state.profileStep + 1);
    });
    byId("startAgainButton").addEventListener("click", resetExperience);
    byId("keepResultButton").addEventListener("click", openResultModal);
    byId("resetButton").addEventListener("click", resetExperience);

    document.querySelectorAll("[data-lang]").forEach(button => button.addEventListener("click", () => {
      state.language = button.dataset.lang;
      updateLanguage();
    }));

    byId("billMinus").addEventListener("click", () => setBill(state.bill - 50));
    byId("billPlus").addEventListener("click", () => setBill(state.bill + 50));
    byId("billRange").addEventListener("input", event => setBill(event.target.value));
    byId("billInput").addEventListener("input", event => {
      const value = Number(event.target.value);
      if (value >= 50 && value <= 3000) setBill(value);
    });
    byId("billInput").addEventListener("blur", event => setBill(event.target.value));
    byId("billInput").addEventListener("keydown", event => { if (event.key === "Enter") event.currentTarget.blur(); });
    document.querySelectorAll("[data-bill]").forEach(button => button.addEventListener("click", () => setBill(button.dataset.bill)));

    document.querySelectorAll("[data-phase]").forEach(button => button.addEventListener("click", () => {
      state.phase = button.dataset.phase;
      renderCalculation();
    }));
    document.querySelectorAll("[data-day]").forEach(button => button.addEventListener("click", () => setDaytime(button.dataset.day)));
    byId("daytimeRange").addEventListener("input", event => setDaytime(event.target.value));
    document.querySelectorAll("[data-area]").forEach(button => button.addEventListener("click", () => {
      state.area = button.dataset.area;
      renderCalculation();
    }));

    document.querySelectorAll("[data-close-modal]").forEach(element => element.addEventListener("click", closeResultModal));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !byId("resultModal").hidden) closeResultModal();
    });
  }

  function init() {
    scene.init();
    bindControls();
    updateLanguage();
    setScreen("welcome");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
