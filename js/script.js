// Forward item value calculator.
const canvasFont = '"Rubik", Arial, sans-serif';
let latestResult = {
  base: 0,
  condition: 1,
  conditionMax: 1,
  grade: 1,
  mutations: [],
  multi: 1,
  multiMax: 1,
  markup: 1,
  total: 1,
  totalMax: 1,
  final: 0,
  finalMax: 0,
};
function sortMutations(mutations) {
  return [...mutations].sort((a, b) => {
    if (a.name === "Dirty" && b.name !== "Dirty") return -1;
    if (b.name === "Dirty" && a.name !== "Dirty") return 1;
    return b.max - a.max || b.value - a.value || a.name.localeCompare(b.name);
  });
}

function mutationValueText(mutation) {
  return mutation.value === mutation.max
    ? `${mutation.value}x`
    : `${mutation.value}x – ${mutation.max}x`;
}

function renderActiveMultipliers(mutations) {
  const container = document.getElementById("activeMultipliers");
  renderMutationTokens(container, sortMutations(mutations), mutationValueText);
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function setCanvasFont(context, weight, size) {
  context.font = `${weight} ${size}px ${canvasFont}`;
}

function formatRange(minimum, maximum, digits = 3) {
  const format = (value) => value.toLocaleString("en-US", { maximumFractionDigits: digits });
  return minimum === maximum ? `${format(minimum)}x` : `${format(minimum)}x – ${format(maximum)}x`;
}

function formatFixedRange(minimum, maximum, digits = 3) {
  return minimum === maximum
    ? `${minimum.toFixed(digits)}x`
    : `${minimum.toFixed(digits)}x – ${maximum.toFixed(digits)}x`;
}

function getCanvasMutationFill(context, name, x, width) {
  const gradient = mutationGradients[name];
  const colors = gradient?.match(/#[0-9a-f]{3,8}|rgba?\([^)]+\)|\b(?:red|orange|yellow|green|blue|indigo|violet|white|black)\b/gi);
  if (!colors?.length) return mutationGlows[name] || "#a985ff";
  const fill = context.createLinearGradient(x, 0, x + width, 0);
  colors.forEach((color, index) => fill.addColorStop(colors.length === 1 ? 0 : index / (colors.length - 1), color));
  return fill;
}

function layoutCanvasMutationChips(context, mutations, maxWidth) {
  setCanvasFont(context, 800, 16);
  const chips = [];
  let x = 0;
  let y = 0;
  mutations.forEach((mutation) => {
    const valueText = mutationValueText(mutation);
    const nameWidth = context.measureText(mutation.name).width;
    setCanvasFont(context, 700, 14);
    const valueWidth = context.measureText(valueText).width;
    setCanvasFont(context, 800, 16);
    const width = Math.min(maxWidth, nameWidth + valueWidth + 42);
    if (x > 0 && x + width > maxWidth) {
      x = 0;
      y += 43;
    }
    chips.push({ mutation, valueText, nameWidth, x, y, width });
    x += width + 10;
  });
  return { chips, height: chips.length ? y + 33 : 26 };
}

function drawFittedCanvasText(context, text, x, y, maxWidth, weight, size, color, minSize = 16) {
  let currentSize = size;
  do {
    setCanvasFont(context, weight, currentSize);
    if (context.measureText(text).width <= maxWidth) break;
    currentSize -= 1;
  } while (currentSize >= minSize);
  context.fillStyle = color;
  context.fillText(text, x, y, maxWidth);
}

function drawCanvasResultRow(context, label, value, x, y, width, isTotal = false) {
  if (isTotal) {
    context.fillStyle = "#1b2230";
    context.fillRect(x, y, width, 58);
  }
  context.strokeStyle = "#303a4d";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x, y + 58);
  context.lineTo(x + width, y + 58);
  context.stroke();
  context.fillStyle = "#aeb9cc";
  setCanvasFont(context, 800, 12);
  context.textAlign = "left";
  context.fillText(label.toUpperCase(), x + 18, y + 36);
  context.textAlign = "right";
  drawFittedCanvasText(context, value, x + width - 18, y + 38, width * 0.52, 800, 17, isTotal ? "#f4c95d" : "#edf2fb", 13);
  context.textAlign = "left";
}

function createResultCanvas() {
  const width = 560;
  const cardX = 20;
  const cardY = 20;
  const cardWidth = width - cardX * 2;
  const rowX = cardX + 1;
  const rowWidth = cardWidth - 2;
  const contentX = cardX + 18;
  const contentWidth = cardWidth - 36;
  const mutations = sortMutations(latestResult.mutations);
  const measuringCanvas = document.createElement("canvas");
  const chipLayout = layoutCanvasMutationChips(measuringCanvas.getContext("2d"), mutations, contentWidth);
  const markupText = latestResult.markup === 25 || latestResult.markup === 1
    ? `${latestResult.markup}x`
    : `${latestResult.markup.toFixed(3)}x`;
  const selectedHeight = 59 + chipLayout.height;
  const finalHeight = 110;
  const cardHeight = 5 + 116 + selectedHeight + 232 + finalHeight;
  const height = cardHeight + cardY * 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  context.fillStyle = "#0d0f13";
  context.fillRect(0, 0, width, height);
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, 16);
  const cardGradient = context.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
  cardGradient.addColorStop(0, "#19212d");
  cardGradient.addColorStop(1, "#111720");
  context.fillStyle = cardGradient;
  context.fill();
  context.strokeStyle = "#384458";
  context.lineWidth = 2;
  context.stroke();

  context.save();
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, 16);
  context.clip();
  const accentGradient = context.createLinearGradient(cardX, 0, cardX + cardWidth, 0);
  accentGradient.addColorStop(0, "#f4c95d");
  accentGradient.addColorStop(1, "#ffe39a");
  context.fillStyle = accentGradient;
  context.fillRect(cardX, cardY, cardWidth, 6);

  let rowY = cardY + 5;
  drawCanvasResultRow(context, "Base value", `$${formatter.format(latestResult.base)}`, rowX, rowY, rowWidth);
  rowY += 58;
  drawCanvasResultRow(context, "Mutation multiplier", formatRange(latestResult.multi, latestResult.multiMax), rowX, rowY, rowWidth);
  rowY += 58;

  context.fillStyle = "#aeb9cc";
  setCanvasFont(context, 800, 12);
  context.fillText("SELECTED MUTATIONS", contentX, rowY + 27);
  const chipsY = rowY + 43;
  if (!mutations.length) {
    context.fillStyle = "#8f9bad";
    setCanvasFont(context, 600, 15);
    context.fillText("None", contentX, chipsY + 18);
  } else {
    chipLayout.chips.forEach((chip) => {
      const x = contentX + chip.x;
      const y = chipsY + chip.y;
      roundedRect(context, x, y, chip.width, 33, 6);
      context.fillStyle = "#10151e";
      context.fill();
      if (!mutationGradients[chip.mutation.name]) {
        context.save();
        context.globalAlpha = 0.09;
        context.fillStyle = mutationGlows[chip.mutation.name] || "#a985ff";
        context.fill();
        context.restore();
      }
      context.strokeStyle = getCanvasMutationFill(context, chip.mutation.name, x, chip.width);
      context.lineWidth = 1.5;
      context.stroke();
      context.fillStyle = getCanvasMutationFill(context, chip.mutation.name, x + 14, chip.width - 28);
      setCanvasFont(context, 800, 16);
      context.fillText(chip.mutation.name, x + 13, y + 22);
      context.fillStyle = "#aeb9cc";
      setCanvasFont(context, 700, 14);
      context.fillText(chip.valueText, x + 20 + chip.nameWidth, y + 22);
    });
  }
  rowY += selectedHeight;
  context.strokeStyle = "#303a4d";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(rowX, rowY);
  context.lineTo(rowX + rowWidth, rowY);
  context.stroke();

  drawCanvasResultRow(context, "Low items markup", markupText, rowX, rowY, rowWidth);
  rowY += 58;
  drawCanvasResultRow(context, "Condition factor", formatFixedRange(latestResult.condition, latestResult.conditionMax), rowX, rowY, rowWidth);
  rowY += 58;
  drawCanvasResultRow(context, "Grade factor", `${latestResult.grade}x`, rowX, rowY, rowWidth);
  rowY += 58;
  drawCanvasResultRow(context, "Total multiplier", formatFixedRange(latestResult.total, latestResult.totalMax), rowX, rowY, rowWidth, true);
  rowY += 58;

  const finalGradient = context.createLinearGradient(rowX, rowY, rowX + rowWidth, rowY);
  finalGradient.addColorStop(0, "#111620");
  finalGradient.addColorStop(1, "#24231d");
  context.fillStyle = finalGradient;
  context.fillRect(rowX, rowY, rowWidth, finalHeight);
  context.strokeStyle = "#354056";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(rowX, rowY);
  context.lineTo(rowX + rowWidth, rowY);
  context.stroke();
  context.fillStyle = "#aeb9cc";
  setCanvasFont(context, 800, 12);
  context.fillText("FINAL VALUE", contentX, rowY + 34);
  const finalValue = latestResult.final === latestResult.finalMax
    ? `$${formatter.format(latestResult.final)}`
    : `$${formatter.format(latestResult.final)} – $${formatter.format(latestResult.finalMax)}`;
  drawFittedCanvasText(context, finalValue, contentX, rowY + 84, contentWidth, 800, 42, "#75d37c", 14);
  context.restore();
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, 16);
  context.strokeStyle = "#384458";
  context.lineWidth = 2;
  context.stroke();
  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function downloadResultImage(blob) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "storage-hunters-result.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function copyResult() {
  const button = document.getElementById("copyResult");
  const status = document.getElementById("copyStatus");
  button.disabled = true;
  status.textContent = "Creating result image…";
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const blob = await canvasToBlob(createResultCanvas());
    if (!blob) throw new Error("Image creation failed");
    if (!window.ClipboardItem || !navigator.clipboard?.write) throw new Error("Image clipboard unavailable");
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    status.textContent = "Result image copied to the clipboard.";
  } catch (error) {
    const blob = await canvasToBlob(createResultCanvas());
    if (blob) {
      downloadResultImage(blob);
      status.textContent = "Image downloaded because direct copying is unavailable.";
    } else {
      status.textContent = "The result image could not be created.";
    }
  } finally {
    button.disabled = false;
  }
}

function handleMutationChange(input) {
  enforceMutationRules(input);
  input.closest(".mutation-card").classList.toggle("is-selected", input.checked);
  calc();
}

function fitFinalValueText() {
  const value = document.getElementById("value");
  if (!value) return;
  value.style.removeProperty("font-size");
  let size = Number.parseFloat(getComputedStyle(value).fontSize) || 40;
  while (value.scrollWidth > value.clientWidth && size > 15) {
    size -= 1;
    value.style.fontSize = `${size}px`;
  }
}

function calc() {
  clampCondition();
  syncPerfectConditionMutationAvailability();
  const base = parseFloat(document.getElementById("base").value) || 0;
  const conditionInput = document.getElementById("condition").value;
  const conditionPercent = conditionInput === "" ? 100 : parseFloat(conditionInput);
  const grade = parseFloat(document.getElementById("grade").value);
  const mutations = getSelectedMutations();
  const multi = mutations.reduce((total, mutation) => total * mutation.value, 1);
  const multiMax = mutations.reduce((total, mutation) => total * mutation.max, 1);

  let markup = 1;
  if (mutations.length) {
    if (base <= 1) markup = 25;
    else if (base <= 100) markup = 25 / Math.pow(base, 1 - Math.log10(2));
  }

  const mutatedBase = base * markup * multi;
  const mutatedBaseMax = base * markup * multiMax;
  const floor = mutatedBase >= 1000 ? 0.6 : 0.25 + 0.00035 * mutatedBase;
  const floorMax = mutatedBaseMax >= 1000 ? 0.6 : 0.25 + 0.00035 * mutatedBaseMax;
  const condition = floor + (1 - floor) * (conditionPercent / 100);
  const conditionMax = floorMax + (1 - floorMax) * (conditionPercent / 100);
  const total = Math.round(markup * multi * condition * grade * 10000) / 10000;
  const totalMax = Math.round(markup * multiMax * conditionMax * grade * 10000) / 10000;
  const final = Math.max(0, base * total - (base * total > 0 ? 1e-9 : 0));
  const finalMax = Math.max(0, base * totalMax - (base * totalMax > 0 ? 1e-9 : 0));

  latestResult = { base, condition, conditionMax, grade, mutations, multi, multiMax, markup, total, totalMax, final, finalMax };

  renderActiveMultipliers(mutations);
  document.getElementById("baseOut").textContent = `$${formatter.format(base)}`;
  document.getElementById("muti").textContent = multi === multiMax ? `${multi.toLocaleString()}x` : `${multi.toLocaleString()}x – ${multiMax.toLocaleString()}x`;
  document.getElementById("markupOut").textContent = markup === 25 || markup === 1 ? `${markup}x` : `${markup.toFixed(3)}x`;
  document.getElementById("cond").textContent = condition === conditionMax ? `${condition.toFixed(3)}x` : `${condition.toFixed(3)}x – ${conditionMax.toFixed(3)}x`;
  document.getElementById("gradeOut").textContent = `${grade}x`;
  document.getElementById("total").textContent = total === totalMax ? `${total.toFixed(3)}x` : `${total.toFixed(3)}x – ${totalMax.toFixed(3)}x`;
  document.getElementById("value").textContent = final === finalMax ? `$${formatter.format(final)}` : `$${formatter.format(final)} – $${formatter.format(finalMax)}`;
  fitFinalValueText();
}

function resetCalc() {
  document.getElementById("base").value = "";
  document.getElementById("condition").value = "";
  document.getElementById("grade").value = "1";
  document.querySelectorAll(".mutation-card input").forEach((input) => {
    input.checked = false;
    input.closest(".mutation-card").classList.remove("is-selected");
  });
  calc();
  document.getElementById("copyStatus").textContent = "";
  document.getElementById("base").focus();
}

document.getElementById("copyResult").addEventListener("click", copyResult);
window.addEventListener("resize", fitFinalValueText);
wireSharedInputEvents(calc);
calc();
loadMutationData(calc);
