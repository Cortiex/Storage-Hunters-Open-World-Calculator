// Shared live mutation loading, rendering, and calculator helpers.
const groups = {};
const mutationStyles = {};
const mutationGlows = {};
const mutationGradients = {};
const perfectConditionMutations = new Set(["Mint", "Perfect"]);
const mutationDataUrl =
  "https://storagehunters.fandom.com/api.php?action=query&prop=revisions&titles=Module:MutationData&rvprop=content&format=json&origin=*";

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatMutationValue(value) {
  if (typeof value === "string") return value;
  return value && typeof value === "object"
    ? `${value.min}x – ${value.max}x`
    : `${value}x`;
}

function addMutationCard(container, name, value, groupName) {
  const disabled = typeof value === "string";
  const min = value && typeof value === "object" ? value.min : disabled ? 0 : value;
  const max = value && typeof value === "object" ? value.max : disabled ? 0 : value;
  const card = document.createElement("label");
  card.className = `mutation-card${disabled ? " is-disabled" : ""}`;
  card.style.setProperty("--mutation-glow", mutationGlows[name] || "#a985ff");
  if (gradientColorCount(mutationGradients[name]) >= 5) {
    card.classList.add("has-gradient");
    card.style.setProperty("--mutation-gradient", mutationGradients[name]);
  }
  card.innerHTML = `<input type="checkbox" value="${min}" data-min="${min}" data-max="${max}" data-name="${escapeHtml(name)}" data-group="${escapeHtml(groupName)}" ${disabled ? "disabled" : ""}><span class="mutation-copy"><span class="mutation-name">${escapeHtml(name)}</span></span><span class="mutation-value">${formatMutationValue(value)}</span><span class="mutation-check" aria-hidden="true"></span>`;
  if (mutationStyles[name]) {
    card.querySelector(".mutation-name").style.cssText = mutationStyles[name];
  }
  card.querySelector("input").addEventListener("change", (event) => handleMutationChange(event.currentTarget));
  container.appendChild(card);
}

function renderMutations() {
  const area = document.getElementById("mutationArea");
  area.innerHTML = "";

  Object.entries(groups).forEach(([groupName, entries]) => {
    const hasSubgroups = Object.values(entries).some(
      (entry) => entry && typeof entry === "object" && !("min" in entry),
    );
    const groupSection = document.createElement("section");
    groupSection.className = "mutation-group";
    const groupCount = hasSubgroups
      ? Object.values(entries).reduce((count, values) => count + Object.keys(values).length, 0)
      : Object.keys(entries).length;
    groupSection.innerHTML = `<div class="mutation-group-heading"><h3>${escapeHtml(groupName)}</h3><span>${groupCount}</span></div>`;

    const renderGrid = (values, subgroupName = "") => {
      if (subgroupName) {
        const heading = document.createElement("h4");
        heading.className = "mutation-subgroup-heading";
        heading.classList.toggle("is-moonlit-event", subgroupName === "Moonlit Event");
        heading.classList.toggle("is-rain-event", subgroupName === "Rain Event");
        heading.textContent = subgroupName;
        const colorSource = subgroupName === "Moonlit Event"
          ? "Moonlit"
          : subgroupName === "Rain Event"
            ? "Wet"
            : "";
        if (colorSource) {
          heading.style.setProperty("--subgroup-color", mutationGlows[colorSource] || "#b79aff");
        }
        groupSection.appendChild(heading);
      }
      const grid = document.createElement("div");
      grid.className = "mutation-grid";
      Object.entries(values).forEach(([name, value]) => addMutationCard(grid, name, value, groupName));
      groupSection.appendChild(grid);
    };

    if (hasSubgroups) {
      Object.entries(entries).forEach(([subgroup, values]) => renderGrid(values, subgroup));
    } else {
      renderGrid(entries);
    }
    area.appendChild(groupSection);
  });
}

function enforceMutationRules(input) {
  if (!input.checked) return;
  if (perfectConditionMutations.has(input.dataset.name)) {
    document.getElementById("condition").value = "100";
    syncPerfectConditionMutationAvailability();
  }
  const isWashing = input.dataset.group === "Washing Mutations";
  const isTimeCapsule = input.dataset.group === "Time Capsule Mutations";
  const isDirty = input.dataset.name === "Dirty";

  document.querySelectorAll(".mutation-card input:checked").forEach((other) => {
    if (other === input) return;
    const otherIsWashing = other.dataset.group === "Washing Mutations";
    const otherIsTimeCapsule = other.dataset.group === "Time Capsule Mutations";
    const otherIsDirty = other.dataset.name === "Dirty";
    const sameExclusiveGroup =
      (isWashing && otherIsWashing) || (isTimeCapsule && otherIsTimeCapsule);
    if (sameExclusiveGroup || (isDirty && otherIsWashing) || (isWashing && otherIsDirty)) {
      other.checked = false;
      other.closest(".mutation-card").classList.remove("is-selected");
    }
  });
}

function syncPerfectConditionMutationAvailability() {
  const conditionInput = document.getElementById("condition");
  const condition = conditionInput.value === "" ? 100 : Number.parseFloat(conditionInput.value);
  const isAvailable = condition === 100;
  let selectionChanged = false;

  document.querySelectorAll(".mutation-card input").forEach((input) => {
    if (!perfectConditionMutations.has(input.dataset.name)) return;
    const card = input.closest(".mutation-card");
    if (!isAvailable && input.checked) {
      input.checked = false;
      card.classList.remove("is-selected");
      selectionChanged = true;
    }
    input.disabled = !isAvailable;
    card.classList.toggle("is-requirement-disabled", !isAvailable);
    card.setAttribute("aria-disabled", String(!isAvailable));
    card.title = isAvailable ? "" : `${input.dataset.name} requires 100% condition`;
  });
  return selectionChanged;
}

function clampCondition() {
  const input = document.getElementById("condition");
  if (input.value === "") return;
  const value = parseFloat(input.value);
  if (!Number.isNaN(value)) input.value = Math.min(100, Math.max(0, value));
}

function getSelectedMutations() {
  return Array.from(document.querySelectorAll(".mutation-card input:checked"), (input) => ({
    name: input.dataset.name,
    value: parseFloat(input.dataset.min),
    max: parseFloat(input.dataset.max),
  }));
}

function renderMutationTokens(container, mutations, valueFormatter) {
  container.replaceChildren();
  if (!mutations.length) {
    const empty = document.createElement("span");
    empty.className = "no-selection";
    empty.textContent = "None";
    container.appendChild(empty);
    return;
  }

  mutations.forEach((mutation) => {
    const token = document.createElement("span");
    token.className = "active-mutation";
    token.style.setProperty("--mutation-color", mutationGlows[mutation.name] || "#a985ff");
    if (mutationGradients[mutation.name]) {
      token.classList.add("has-gradient");
      token.style.setProperty("--mutation-gradient", mutationGradients[mutation.name]);
    }

    const name = document.createElement("span");
    name.className = "active-mutation-name";
    name.textContent = mutation.name;
    if (mutationStyles[mutation.name]) name.style.cssText = mutationStyles[mutation.name];
    token.appendChild(name);

    if (valueFormatter) {
      const value = document.createElement("span");
      value.className = "active-mutation-value";
      value.textContent = valueFormatter(mutation);
      token.appendChild(value);
    }
    container.appendChild(token);
  });
}

function wireSharedInputEvents(onCalculate, extraIds = []) {
  ["base", "grade", ...extraIds].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", onCalculate);
  });
  document.getElementById("condition")?.addEventListener("input", () => {
    clampCondition();
    syncPerfectConditionMutationAvailability();
    onCalculate();
  });
}

function getModuleContent(data) {
  const pages = data?.query?.pages || {};
  const page = pages[Object.keys(pages)[0]];
  const revision = page?.revisions?.[0] || {};
  return revision["*"] || revision.slots?.main?.["*"] || "";
}

function parseMutationModule(source) {
  const start = source.indexOf("p.mutations = {");
  if (start === -1) return [];
  const end = source.indexOf("function p.get", start);
  const mutationSource = source.slice(start, end === -1 ? source.length : end);

  return (mutationSource.match(/\{[^{}]+\}/g) || []).flatMap((block) => {
    const name = block.match(/name\s*=\s*["']([^"']+)["']/)?.[1];
    const multiplierMatch = block.match(/multiplier\s*=\s*(["']([^"']+)["']|([\d.]+))/);
    if (!name || !multiplierMatch) return [];
    const rawMultiplier = multiplierMatch[2] || multiplierMatch[3];
    const multiplier = Number.parseFloat(rawMultiplier);
    return [{
      name,
      multiplier: Number.isNaN(multiplier) ? rawMultiplier : multiplier,
      category: block.match(/category\s*=\s*["']([^"']+)["']/)?.[1] || "Standard",
      style: block.match(/style\s*=\s*["']([^"']+)["']/)?.[1] || "",
    }];
  });
}

function colorFromStyle(style) {
  if (!style) return "";
  const gradient = gradientFromStyle(style);
  const gradientColors = gradient?.match(/#[0-9a-f]{3,8}|rgba?\([^)]+\)|\b(?:red|orange|yellow|green|blue|indigo|violet|white|black)\b/gi);
  if (gradientColors?.length) {
    return [...gradientColors].reverse().find((color) => !isExtremeGradientColor(color))
      || gradientColors[Math.floor(gradientColors.length / 2)];
  }
  return style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)?.[1]?.trim() || "";
}

function isExtremeGradientColor(color) {
  const hex = color.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (!hex) return /^(?:black|white)$/i.test(color);
  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  return Math.max(...channels) <= 32 || Math.min(...channels) >= 235;
}

function gradientFromStyle(style) {
  return style?.match(/background\s*:\s*(linear-gradient\([^;]+\))/i)?.[1] || "";
}

function gradientColorCount(gradient) {
  return gradient?.match(/#[0-9a-f]{3,8}|rgba?\([^)]+\)|\b(?:red|orange|yellow|green|blue|indigo|violet|white|black)\b/gi)?.length || 0;
}

function storeMutationData(mutations) {
  Object.keys(groups).forEach((key) => delete groups[key]);
  Object.keys(mutationStyles).forEach((key) => delete mutationStyles[key]);
  Object.keys(mutationGlows).forEach((key) => delete mutationGlows[key]);
  Object.keys(mutationGradients).forEach((key) => delete mutationGradients[key]);

  mutations.forEach((mutation) => {
    if (typeof mutation.multiplier !== "number" && typeof mutation.multiplier !== "string") return;
    const category = mutation.category || "Standard";
    if (category.endsWith("Event")) {
      groups["Event Mutations"] ||= {};
      groups["Event Mutations"][category] ||= {};
      groups["Event Mutations"][category][mutation.name] = mutation.multiplier;
    } else {
      const groupName = `${category} Mutations`;
      groups[groupName] ||= {};
      groups[groupName][mutation.name] = mutation.multiplier;
    }
    if (mutation.style) {
      mutationStyles[mutation.name] = mutation.style;
      mutationGlows[mutation.name] = colorFromStyle(mutation.style);
      const gradient = gradientFromStyle(mutation.style);
      if (gradient) mutationGradients[mutation.name] = gradient;
    }
  });
}

async function loadMutationData(onLoad) {
  const area = document.getElementById("mutationArea");
  area.innerHTML = `<div class="mutation-loading" role="status"><span></span><div><strong>Loading mutations</strong><small>Fetching the current mutation list…</small></div></div>`;
  try {
    const response = await fetch(mutationDataUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Mutation data request failed (${response.status})`);
    const mutations = parseMutationModule(getModuleContent(await response.json()));
    if (!mutations.length) throw new Error("Mutation data was empty");
    storeMutationData(mutations);
    renderMutations();
    syncPerfectConditionMutationAvailability();
    onLoad();
  } catch (error) {
    console.error(error);
    area.innerHTML = `<div class="mutation-error"><strong>Mutations could not be loaded.</strong><span>Refresh the page to try again.</span></div>`;
  }
}
