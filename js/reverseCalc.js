// Reverse calculator for finding one unknown mutation multiplier.
function handleMutationChange(input) {
  enforceMutationRules(input);
  input.closest(".mutation-card").classList.toggle("is-selected", input.checked);
  reverseCalc();
}

function computeSellPrice(base, conditionPercent, grade, knownMulti, unknownMulti, smooth = false) {
  const totalMulti = knownMulti * unknownMulti;
  let markup = 1;
  if (base <= 1) markup = 25;
  else if (base <= 100) markup = 25 / Math.pow(base, 1 - Math.log10(2));

  const mutatedBase = base * markup * totalMulti;
  const floor = mutatedBase >= 1000 ? 0.6 : 0.25 + 0.00035 * mutatedBase;
  const condition = floor + (1 - floor) * (conditionPercent / 100);
  let total = markup * totalMulti * condition * grade;
  if (!smooth) total = Math.round(total * 10000) / 10000;
  const final = Math.max(0, base * total - (base * total > 0 ? 1e-9 : 0));
  return { final, markup, condition };
}

function solveMultiplier(base, sellPrice, conditionPercent, grade, knownMulti) {
  let unknown = 1;
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const result = computeSellPrice(base, conditionPercent, grade, knownMulti, unknown, true);
    const difference = result.final - sellPrice;
    if (Math.abs(difference) < 0.005) break;
    const step = Math.max(unknown * 0.0001, 1e-8);
    const next = computeSellPrice(base, conditionPercent, grade, knownMulti, unknown + step, true);
    const derivative = (next.final - result.final) / step;
    if (Math.abs(derivative) < 1e-12) break;
    unknown = Math.max(0.01, unknown - difference / derivative);
  }
  return unknown;
}

function reverseCalc() {
  clampCondition();
  syncPerfectConditionMutationAvailability();
  const base = parseFloat(document.getElementById("base").value) || 0;
  const sellPrice = parseFloat(document.getElementById("sellPrice").value) || 0;
  const conditionInput = document.getElementById("condition").value;
  const conditionPercent = conditionInput === "" ? 100 : parseFloat(conditionInput);
  const grade = parseFloat(document.getElementById("grade").value);
  const mutations = getSelectedMutations();
  const knownMulti = mutations.reduce((total, mutation) => total * mutation.value, 1);
  const knownMultiMax = mutations.reduce((total, mutation) => total * mutation.max, 1);

  renderMutationTokens(document.getElementById("knownMutationsOut"), mutations, (mutation) => `${mutation.value}x`);
  document.getElementById("knownMultiOut").textContent = knownMulti === knownMultiMax ? `${knownMulti}x` : `${knownMulti}x – ${knownMultiMax}x`;
  document.getElementById("gradeOut").textContent = `${grade}x`;

  if (base <= 0 || sellPrice <= 0) {
    document.getElementById("unknownMulti").textContent = "?";
    document.getElementById("markupOut").textContent = "?";
    document.getElementById("cond").textContent = "?";
    return;
  }

  const unknown = solveMultiplier(base, sellPrice, conditionPercent, grade, knownMulti);
  const unknownMax = knownMulti === knownMultiMax ? unknown : solveMultiplier(base, sellPrice, conditionPercent, grade, knownMultiMax);
  const result = computeSellPrice(base, conditionPercent, grade, knownMulti, unknown);
  const rounded = Math.round(unknown * 10000) / 10000;
  const roundedMax = Math.round(unknownMax * 10000) / 10000;

  document.getElementById("markupOut").textContent = result.markup === 25 || result.markup === 1 ? `${result.markup}x` : `${result.markup.toFixed(3)}x`;
  document.getElementById("cond").textContent = `${result.condition.toFixed(3)}x`;
  document.getElementById("unknownMulti").textContent = rounded === roundedMax ? `${rounded.toFixed(4)}x` : `${Math.min(rounded, roundedMax).toFixed(4)}x – ${Math.max(rounded, roundedMax).toFixed(4)}x`;
}

function resetCalc() {
  ["base", "sellPrice", "condition"].forEach((id) => { document.getElementById(id).value = ""; });
  document.getElementById("grade").value = "1";
  document.querySelectorAll(".mutation-card input").forEach((input) => {
    input.checked = false;
    input.closest(".mutation-card").classList.remove("is-selected");
  });
  reverseCalc();
  document.getElementById("base").focus();
}

function setupFinderGuide() {
  const dialog = document.getElementById("finderGuide");
  const openButton = document.getElementById("finderHelp");
  const closeButton = document.getElementById("guideClose");
  const backButton = document.getElementById("guideBack");
  const nextButton = document.getElementById("guideNext");
  const counter = document.getElementById("guideCounter");
  const steps = Array.from(dialog.querySelectorAll(".guide-step"));
  const progress = Array.from(dialog.querySelectorAll(".guide-progress span"));
  let currentStep = 0;

  function renderStep() {
    steps.forEach((step, index) => step.classList.toggle("active", index === currentStep));
    progress.forEach((item, index) => item.classList.toggle("active", index === currentStep));
    backButton.disabled = currentStep === 0;
    counter.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    nextButton.textContent = currentStep === steps.length - 1 ? "Start calculating" : "Next";
  }

  function markSeen() {
    try {
      sessionStorage.setItem("mutationFinderGuideSeen", "true");
    } catch {
      // Storage is optional; the guide still works without it.
    }
  }

  function openGuide() {
    currentStep = 0;
    renderStep();
    if (!dialog.open) dialog.showModal();
  }

  function closeGuide() {
    markSeen();
    dialog.close();
  }

  openButton.addEventListener("click", openGuide);
  closeButton.addEventListener("click", closeGuide);
  backButton.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    renderStep();
  });
  nextButton.addEventListener("click", () => {
    if (currentStep === steps.length - 1) {
      closeGuide();
      document.getElementById("base").focus();
      return;
    }
    currentStep += 1;
    renderStep();
  });
  dialog.addEventListener("cancel", markSeen);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeGuide();
  });

  let hasSeenGuide = false;
  try {
    hasSeenGuide = sessionStorage.getItem("mutationFinderGuideSeen") === "true";
  } catch {
    hasSeenGuide = false;
  }
  if (!hasSeenGuide) openGuide();
}

wireSharedInputEvents(reverseCalc, ["sellPrice"]);
reverseCalc();
loadMutationData(reverseCalc);
setupFinderGuide();
