import { presets } from "./presets-expanded.js";

const $ = (selector) => document.querySelector(selector);
const stage = $("#stage");
const presetList = $("#preset-list");
const timeline = $("#timeline");
const toast = $("#toast");
let currentPreset = presets[0];
let activeFilter = "all";
let searchQuery = "";
let activeAnimations = [];
let replayTimer = null;
let intensity = 1;
let speed = 1;
let toastHandle;
let counterFrame = 0;
let collectionRun = 0;

const categoryNames = {
  feedback: "FEEDBACK",
  transition: "TRANSITION",
  interaction: "INTERACTION",
  reward: "REWARD",
  system: "SYSTEM MOTION"
};

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function getVisiblePresets() {
  const query = searchQuery.trim().toLocaleLowerCase();
  return presets.filter((preset) => {
    const categoryMatch = activeFilter === "all" || preset.category === activeFilter;
    if (!categoryMatch) return false;
    if (!query) return true;
    const haystack = [
      preset.title, preset.short, preset.description, preset.intent,
      preset.categoryLabel, ...(preset.stages || []),
      ...(preset.parameters || []).flat()
    ].join(" ").toLocaleLowerCase();
    return haystack.includes(query);
  });
}

function keepPresetVisible(button) {
  if (!button) return;
  const itemRect = button.getBoundingClientRect();
  const listRect = presetList.getBoundingClientRect();
  if (itemRect.top < listRect.top) presetList.scrollTop -= listRect.top - itemRect.top;
  else if (itemRect.bottom > listRect.bottom) presetList.scrollTop += itemRect.bottom - listRect.bottom;
}

function updatePresetNavigation(visible) {
  const currentIndex = visible.findIndex((preset) => preset.id === currentPreset.id);
  const previous = $("#previous-preset");
  const next = $("#next-preset");
  if (previous) previous.disabled = currentIndex <= 0;
  if (next) next.disabled = currentIndex < 0 || currentIndex >= visible.length - 1;
}

function renderLibrary({ preserveScroll = true } = {}) {
  const previousScrollTop = presetList.scrollTop;
  const visible = getVisiblePresets();
  $("#preset-count").textContent = String(visible.length).padStart(2, "0");
  $("#library-result-count").textContent = searchQuery.trim()
    ? `找到 ${visible.length} / ${presets.length} 个模板`
    : `显示 ${visible.length} / ${presets.length} 个模板`;

  document.querySelectorAll("[data-filter-count]").forEach((node) => {
    const category = node.dataset.filterCount;
    node.textContent = String(category === "all"
      ? presets.length
      : presets.filter((preset) => preset.category === category).length).padStart(2, "0");
  });
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const active = button.dataset.filter === activeFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (!visible.length) {
    presetList.innerHTML = `<div class="preset-empty">没有找到符合条件的模板。<br>试试其他关键词或切换分类。</div>`;
    updatePresetNavigation(visible);
    return;
  }

  presetList.innerHTML = visible.map((preset) => {
    const isActive = preset.id === currentPreset.id;
    return `<button class="preset-item ${isActive ? "active" : ""}" data-preset="${safeText(preset.id)}" aria-pressed="${isActive}">
      <span class="preset-thumb" style="--thumb-color:${preset.color};--thumb-bg:${preset.thumbBg}">${safeText(preset.icon)}</span>
      <span class="preset-copy"><strong>${safeText(preset.title)}</strong><small>${safeText(preset.short)}</small></span>
      <span class="preset-arrow" aria-hidden="true">›</span>
    </button>`;
  }).join("");

  presetList.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => selectPreset(button.dataset.preset, { focusLibrary: true }));
  });
  if (preserveScroll) presetList.scrollTop = previousScrollTop;
  keepPresetVisible(presetList.querySelector(`[data-preset="${CSS.escape(currentPreset.id)}"]`));
  updatePresetNavigation(visible);
}

function selectPreset(id, { focusLibrary = false } = {}) {
  const next = presets.find((item) => item.id === id);
  if (!next) return;
  currentPreset = next;
  renderLibrary();
  mountScene();
  renderDetails();
  playMotion();
  const activeButton = presetList.querySelector(`[data-preset="${CSS.escape(id)}"]`);
  keepPresetVisible(activeButton);
  if (focusLibrary) activeButton?.focus({ preventScroll: true });
}

function getTotalDuration() {
  return Math.max(currentPreset.durationMs || 0, ...currentPreset.tracks.map((track) =>
    (track.startMs || 0) + (track.durationMs || 300) * (track.iterations || 1) +
    Math.max(0, (stage.querySelectorAll(`[data-motion="${CSS.escape(track.target || trackTarget(track.name))}"]`).length || 1) - 1) * (track.staggerMs || 0)
  ));
}

function renderDetails() {
  $("#active-category").textContent = categoryNames[currentPreset.category] || "MOTION";
  $("#active-title").textContent = currentPreset.title;
  $("#active-desc").textContent = currentPreset.description;
  $("#stage-purpose").textContent = currentPreset.categoryLabel;
  const index = presets.findIndex((item) => item.id === currentPreset.id) + 1;
  $("#stage-index").textContent = `${String(index).padStart(2, "0")} / ${String(presets.length).padStart(2, "0")}`;
  const hint = $("#interaction-hint");
  const hintText = $("#interaction-hint-text");
  const message = currentPreset.interaction?.hint
    || (currentPreset.sequence?.model
      ? "观察动作阶段与事件编排；可在右侧调整参数并导出。"
      : "点击重播查看完整动作；右侧可调整力度、节奏并导出复刻资料。");
  hint.hidden = false;
  hintText.textContent = message;
  hintText.title = message;
  const total = getTotalDuration();
  $("#duration-label").textContent = `TOTAL ${Math.round(total)} MS`;

  $("#parameter-list").innerHTML = currentPreset.parameters.map(([label, value]) =>
    `<div class="parameter-item"><small>${safeText(label)}</small><strong>${safeText(value)}</strong></div>`
  ).join("");

  $("#track-count").textContent = `${String(currentPreset.tracks.length).padStart(2, "0")} TRACKS`;
  $("#track-list").innerHTML = currentPreset.tracks.map((track) =>
    `<div class="track-item"><i class="track-color ${safeText(track.type)}"></i><span>${safeText(track.name)}</span><small>${Math.round(track.startMs)}–${Math.round(track.startMs + track.durationMs)} ms</small></div>`
  ).join("");

  renderTimeline(total);
  $("#stage-purpose").title = currentPreset.interaction?.hint || "";
}

function renderTimeline(total) {
  timeline.innerHTML = currentPreset.tracks.map((track) => {
    const left = Math.max(0, track.startMs / total * 100);
    const width = Math.max(1.2, track.durationMs / total * 100);
    return `<div class="timeline-row">
      <span class="timeline-name" title="${safeText(track.name)}">${safeText(track.name)}</span>
      <div class="timeline-track" aria-label="${safeText(track.name)}">
        <span class="timeline-bar ${safeText(track.type)}" style="left:${left}%;width:${Math.min(width, 100-left)}%"></span>
      </div>
    </div>`;
  }).join("");
}

function mountScene() {
  cancelMotion();
  stage.innerHTML = currentPreset.scene;
  stage.dataset.preset = currentPreset.id;
  bindSceneInteractions();
}

function cancelMotion() {
  if (replayTimer) { clearTimeout(replayTimer); replayTimer = null; }
  if (counterFrame) { cancelAnimationFrame(counterFrame); counterFrame = 0; }
  collectionRun += 1;
  for (const animation of activeAnimations) {
    try { animation.cancel(); } catch { /* Ignore an already released animation. */ }
  }
  activeAnimations = [];
  stage.querySelectorAll(".runtime-coin").forEach((node) => node.remove());
  const source = stage.querySelector('[data-action="collect-coins"]');
  if (source) source.disabled = false;
}

function toKeyframe(frame) {
  const stageScale = Math.max(0.1, stage.clientWidth / 720);
  const x = (frame.x || 0) * intensity * stageScale;
  const y = (frame.y || 0) * intensity * stageScale;
  const rotate = (frame.rotate || 0) * intensity;
  const rotateY = (frame.rotateY || 0) * intensity;
  const sx = 1 + ((frame.sx ?? 1) - 1) * intensity;
  const sy = 1 + ((frame.sy ?? 1) - 1) * intensity;
  const transforms = [
    `translate3d(${x}px,${y}px,0)`,
    `rotate(${rotate}deg)`,
    `rotateY(${rotateY}deg)`,
    `scale(${sx},${sy})`
  ];
  const output = { transform: transforms.join(" "), opacity: frame.opacity ?? 1 };
  if (frame.at !== undefined) output.offset = frame.at;
  if (frame.blur !== undefined) output.filter = `blur(${Math.max(0, frame.blur * intensity)}px)`;
  if (frame.clipPath !== undefined) output.clipPath = frame.clipPath;
  if (frame.offset !== undefined) output.offset = frame.offset;
  return output;
}

function playMotion() {
  cancelMotion();
  const manualInteraction = currentPreset.interaction?.type;
  if (["popup-dismiss", "coin-tap", "accordion"].includes(manualInteraction)) return;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) {
    showToast("系统已启用减少动态效果；预览已静态展示");
    return;
  }

  for (const track of currentPreset.tracks) {
    const targetId = track.target || trackTarget(track.name);
    const targets = [...stage.querySelectorAll(`[data-motion="${CSS.escape(targetId)}"]`)];
    if (!targets.length) {
      console.warn(`Motion target not found: ${targetId}`);
      continue;
    }
    targets.forEach((element, index) => {
      const delay = (track.startMs || 0) + (track.staggerMs || 0) * index;
      const options = {
        duration: Math.max(40, (track.durationMs || 300) / speed),
        delay: Math.max(0, delay / speed),
        easing: track.easing || "ease-out",
        iterations: track.iterations || 1,
        fill: "both"
      };
      const animation = element.animate(track.frames.map(toKeyframe), options);
      activeAnimations.push(animation);
    });
  }

  if (currentPreset.interaction?.type === "counter") animateCounter();
  if (currentPreset.loopPauseMs && currentPreset.id === "merge-hint") {
    const playbackEndMs = getTotalDuration();
    replayTimer = setTimeout(() => { if (currentPreset.id === "merge-hint") playMotion(); }, playbackEndMs / speed + currentPreset.loopPauseMs);
  }
}

function trackTarget(trackName) {
  const known = {
    "按钮主体": "button", "高光扫过": "shine", "外圈呼吸": "orbit",
    "背景遮罩": "backdrop", "弹窗主体": "modal", "标题揭示": "title",
    "奖励组错峰": "reward", "确认按钮": "claim", "装饰星点": "spark",
    "来源奖励": "source", "金币飞行": "coin", "运动拖尾": "trail",
    "HUD 接收": "hud", "到账波纹": "ring", "左侧元素": "left",
    "右侧元素": "right", "共鸣光环": "pulse", "合成提示": "label",
    "卡牌翻转": "card", "卡牌轻抬": "card", "揭晓高光": "glint",
    "主体核心": "core", "碎片一": "shard1", "碎片二": "shard2",
    "碎片三": "shard3", "碎片四": "shard4", "重构光脉冲": "pulse-ring", "射线扩散": "rays",
    "能量光环": "halo", "中心徽章": "badge", "标题": "title",
    "星点": "spark", "等级数字": "number"
  };
  return known[trackName] || trackName;
}

function animateElement(element, keyframes, options = {}) {
  if (!element) return null;
  activeAnimations = activeAnimations.filter((existing) => {
    if (existing.effect?.target !== element) return true;
    try { existing.cancel(); } catch { /* Ignore an already completed animation. */ }
    return false;
  });
  const animation = element.animate(keyframes, {
    duration: 220,
    easing: "cubic-bezier(.2,.8,.2,1)",
    fill: "both",
    ...options
  });
  activeAnimations.push(animation);
  return animation;
}

function bindPressable(button) {
  const status = stage.querySelector("[data-demo-status]");
  const press = () => {
    if (button.disabled) return;
    button.classList.add("is-held");
    button.setAttribute("aria-pressed", "true");
    animateElement(button, [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(4px) scale(.97,.89)" }
    ], { duration: 85, easing: "cubic-bezier(.2,.85,.35,1)" });
    if (status) status.textContent = "按住中 · 受力状态保持";
  };
  const release = () => {
    if (!button.classList.contains("is-held")) return;
    button.classList.remove("is-held");
    button.setAttribute("aria-pressed", "false");
    animateElement(button, [
      { transform: "translateY(4px) scale(.97,.89)" },
      { transform: "translateY(-2px) scale(1.045,1.06)" },
      { transform: "translateY(0) scale(1,1)" }
    ], { duration: 250, easing: "cubic-bezier(.18,1.45,.42,1)" });
    if (status) status.textContent = "已松开 · 释放回弹完成";
  };
  button.addEventListener("pointerdown", (event) => {
    press();
    try { button.setPointerCapture(event.pointerId); } catch { /* Pointer capture is optional. */ }
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
  button.addEventListener("pointerleave", (event) => {
    if (event.buttons === 0) release();
  });
  button.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") press();
  });
  button.addEventListener("keyup", (event) => {
    if (event.key === " " || event.key === "Enter") release();
  });
}

function bindClickFeedback(button) {
  button.addEventListener("click", () => {
    const ripple = button.querySelector(".click-ripple");
    const check = button.querySelector(".click-check");
    animateElement(button, [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(3px) scale(.94,.9)", offset: .2 },
      { transform: "translateY(-2px) scale(1.06,1.07)", offset: .58 },
      { transform: "translateY(0) scale(1)" }
    ], { duration: 310 });
    if (ripple) {
      ripple.style.opacity = "1";
      animateElement(ripple, [{ transform: "scale(.12)", opacity: .8 }, { transform: "scale(2.3)", opacity: 0 }], { duration: 320 });
    }
    if (check) animateElement(check, [{ transform: "scale(.3)", opacity: 0 }, { transform: "scale(1.1)", opacity: 1, offset: .5 }, { transform: "scale(1)", opacity: 0 }], { duration: 260 });
    const status = stage.querySelector("[data-demo-status]");
    if (status) status.textContent = "✓ 输入已确认 · 可以再次点击";
  });
}

function bindPopupDismiss() {
  const modal = stage.querySelector('[data-motion="dismiss-modal"]');
  const backdrop = stage.querySelector('[data-motion="dismiss-backdrop"]');
  const close = stage.querySelector('[data-action="close-modal"]');
  const reopen = stage.querySelector('[data-action="reopen-modal"]');
  const closeNow = () => {
    animateElement(modal, [
      { transform: "translateY(0) scale(1)", opacity: 1 },
      { transform: "translateY(-18px) scale(.88)", opacity: 0 }
    ], { duration: 260, easing: "cubic-bezier(.5,0,.8,.3)" });
    animateElement(backdrop, [{ opacity: .72 }, { opacity: 0 }], { duration: 220 });
    if (reopen) reopen.hidden = false;
  };
  close?.addEventListener("click", closeNow);
  reopen?.addEventListener("click", () => {
    if (reopen) reopen.hidden = true;
    animateElement(backdrop, [{ opacity: 0 }, { opacity: .72 }], { duration: 220 });
    animateElement(modal, [
      { transform: "translateY(28px) scale(.86)", opacity: 0 },
      { transform: "translateY(-3px) scale(1.035)", opacity: 1, offset: .72 },
      { transform: "translateY(0) scale(1)", opacity: 1 }
    ], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
  });
  if (reopen) reopen.hidden = true;
}

function bindListScroll() {
  const viewport = stage.querySelector("[data-list-viewport]");
  stage.querySelector('[data-action="scroll-up"]')?.addEventListener("click", () => viewport?.scrollBy({ top: -132, behavior: "smooth" }));
  stage.querySelector('[data-action="scroll-down"]')?.addEventListener("click", () => viewport?.scrollBy({ top: 132, behavior: "smooth" }));
}

function bindTabs() {
  const buttons = [...stage.querySelectorAll("[data-tab]")];
  const indicator = stage.querySelector('[data-motion="tab-indicator"]');
  const content = stage.querySelector("[data-tab-content]");
  const select = (button) => {
    const key = button.dataset.tab;
    buttons.forEach((item) => item.classList.toggle("active", item === button));
    stage.querySelectorAll("[data-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === key));
    if (indicator) {
      const width = buttons[0]?.offsetWidth || button.offsetWidth;
      indicator.style.transform = `translateX(${buttons.indexOf(button) * width}px)`;
    }
    animateElement(content, [{ opacity: .45, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 190 });
  };
  buttons.forEach((button) => button.addEventListener("click", () => select(button)));
  if (buttons[0]) select(buttons[0]);
}

function bindAccordion() {
  const trigger = stage.querySelector('[data-action="toggle-accordion"]');
  const body = stage.querySelector("[data-accordion-body]");
  if (body) body.hidden = true;
  const arrow = stage.querySelector('[data-motion="accordion-arrow"]');
  const status = stage.querySelector("[data-accordion-status]");
  trigger?.addEventListener("click", () => {
    const opening = !trigger.classList.contains("expanded");
    trigger.classList.toggle("expanded", opening);
    if (!body) return;
    if (opening) {
      body.hidden = false;
      body.style.height = "auto";
      const targetHeight = body.scrollHeight;
      body.style.height = "0px";
      animateElement(body, [{ height: "0px", opacity: 0 }, { height: `${targetHeight}px`, opacity: 1 }], {
        duration: 300,
        easing: "cubic-bezier(.2,.8,.2,1)"
      })?.finished.then(() => { body.style.height = "auto"; }).catch(() => {});
      animateElement(arrow, [{ transform: "rotate(0deg)" }, { transform: "rotate(180deg)" }], { duration: 240 });
      if (status) status.textContent = "已展开 · 再次点击可收起";
    } else {
      const currentHeight = body.getBoundingClientRect().height;
      animateElement(body, [{ height: `${currentHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 240 })?.finished.then(() => { body.hidden = true; }).catch(() => {});
      animateElement(arrow, [{ transform: "rotate(180deg)" }, { transform: "rotate(0deg)" }], { duration: 220 });
      if (status) status.textContent = "已收起 · 再次点击可展开";
    }
  });
}

function quadraticPath(p0, p1, p2, samples = 5) {
  const points = [];
  for (let i = 0; i < samples; i += 1) {
    const t = i / (samples - 1);
    const mt = 1 - t;
    points.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
    });
  }
  return points;
}

function cubicPath(p0, p1, p2, p3, samples = 6) {
  const points = [];
  for (let i = 0; i < samples; i += 1) {
    const t = i / (samples - 1);
    const mt = 1 - t;
    points.push({
      x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
      y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y
    });
  }
  return points;
}

function linearPath(p0, p1, samples = 7) {
  return Array.from({ length: samples }, (_, index) => {
    const t = index / (samples - 1);
    return { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
  });
}

function pointFrames(points, rotation, scaleFrom = 1, scaleTo = .87) {
  return points.map((point, index) => {
    const progress = index / Math.max(1, points.length - 1);
    const scale = scaleFrom + (scaleTo - scaleFrom) * progress;
    return {
      transform: `translate(calc(-50% + ${point.x}px),calc(-50% + ${point.y}px)) rotate(${rotation * progress}deg) scale(${scale})`,
      opacity: 1,
      offset: progress
    };
  });
}
function collectCoins(button) {
  if (!button || button.disabled) return;
  const runId = ++collectionRun;
  const config = currentPreset.sequence || {};
  const spawn = config.scatter || config.spawn || {};
  const wait = config.wait || {};
  const flight = config.flight || {};
  const arrival = config.arrival || {};
  const countControl = stage.querySelector("[data-coin-count]");
  const radiusControl = stage.querySelector("[data-coin-radius]");
  const flightControl = stage.querySelector("[data-coin-flight]");
  const randomControl = stage.querySelector("[data-coin-random]");
  const lineControl = stage.querySelector("[data-coin-line]");
  const animControl = stage.querySelector("[data-coin-anim]");
  const arcControl = stage.querySelector("[data-coin-arc]");
  const count = Math.max(1, Number(countControl?.value) || Number(config.spawnCount) || 8);
  const scatterRadius = Math.max(10, Number(radiusControl?.value) || Number(spawn.radius) || 50);
  const randomScope = Math.max(0, Number(randomControl?.value) ?? Number(spawn.randomScope) ?? 40);
  const configuredFlightMs = Math.max(120, Number(flightControl?.value) || Number(flight.durationMs) || 300);
  const lineType = lineControl?.value || flight.lineType || "bezier";
  const arcHeight = Math.max(0, Number(arcControl?.value) || Number(flight.arcHeight) || 200);
  const animationType = animControl?.value || config.animationType || "defult";
  const baseScale = animationType === "scalebigger" ? .6 : 1.3;
  const flightEndScale = animationType === "scalebigger" ? 1.2 : 1;
  const valuePerItem = Number(arrival.valuePerItem) || 25;
  const stageRect = stage.getBoundingClientRect();
  const sourceRect = button.getBoundingClientRect();
  const hud = stage.querySelector("[data-coin-hud]");
  const total = stage.querySelector("[data-coin-total]");
  const status = stage.querySelector("[data-harvest-status]");
  if (!hud || !total) return;

  const origin = {
    x: sourceRect.left + sourceRect.width / 2 - stageRect.left,
    y: sourceRect.top + sourceRect.height / 2 - stageRect.top
  };
  const targetRect = hud.getBoundingClientRect();
  const destination = {
    x: targetRect.left + targetRect.width / 2 - stageRect.left,
    y: targetRect.top + targetRect.height / 2 - stageRect.top
  };
  const initialGold = Number(total.textContent.replace(/[^0-9.-]/g, "")) || 0;
  let arrived = 0;
  button.disabled = true;
  if (status) status.textContent = `金币散射中 · 0 / ${count} 已到账`;

  const scatterMs = (Number(spawn.durationMs) || 100) / speed;
  const flightMs = configuredFlightMs / speed;
  const showMin = Number(wait.showDelayRangeMs?.[0]) || 100;
  const showMax = Number(wait.showDelayRangeMs?.[1]) || 300;
  const flyBase = Number(wait.flyDelayBaseMs) || 200;
  const flyRange = Number(wait.flyDelayRangeMs?.[1]) || 300;

  for (let i = 0; i < count; i += 1) {
    const coin = document.createElement("span");
    coin.className = "runtime-coin";
    coin.textContent = "🪙";
    coin.style.left = `${origin.x}px`;
    coin.style.top = `${origin.y}px`;
    stage.appendChild(coin);

    // Deterministic pseudo-random spread: same index always produces the same preview.
    const phase = (i / count) * Math.PI * 2 - Math.PI / 2;
    const wobble = Math.sin((i + 1) * 2.37) * randomScope;
    const radius = scatterRadius + wobble;
    const spread = {
      x: Math.cos(phase) * radius,
      y: Math.sin(phase) * radius * .72
    };
    const showDelay = showMin + ((i * 37) % Math.max(1, showMax - showMin + 1));
    const flyDelay = flyBase + ((i * 53) % Math.max(1, flyRange + 1));
    const scatterAnimation = coin.animate([
      { transform: "translate(-50%,-50%) scale(.3)", opacity: 0, offset: 0 },
      { transform: `translate(calc(-50% + ${spread.x * .82}px),calc(-50% + ${spread.y * .82}px)) scale(${baseScale * 1.3})`, opacity: 1, offset: .62 },
      { transform: `translate(calc(-50% + ${spread.x}px),calc(-50% + ${spread.y}px)) scale(${baseScale * .9})`, opacity: 1, offset: .82 },
      { transform: `translate(calc(-50% + ${spread.x}px),calc(-50% + ${spread.y}px)) scale(${baseScale})`, opacity: 1, offset: 1 }
    ], { duration: scatterMs, delay: showDelay / speed, easing: "cubic-bezier(.15,.85,.3,1)", fill: "forwards" });
    activeAnimations.push(scatterAnimation);

    const p0 = spread;
    const p3 = { x: destination.x - origin.x, y: destination.y - origin.y };
    const dx = p3.x - p0.x;
    const dy = p3.y - p0.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const perpendicular = { x: -dy / length, y: dx / length };
    const arc = (i % 2 === 0 ? 1 : -1) * arcHeight;
    const control = {
      x: (p0.x + p3.x) / 2 + perpendicular.x * arc,
      y: (p0.y + p3.y) / 2 + perpendicular.y * arc
    };
    // Match the supplied Cocos reference: one perpendicular control point and a quadratic Bezier path.
    const path = lineType === "beeline" ? linearPath(p0, p3, 7) : quadraticPath(p0, control, p3, 7);
    const flightFrames = pointFrames(path, i % 2 === 0 ? 360 : -360, baseScale, flightEndScale);
    const flightAnimation = coin.animate(flightFrames, {
      duration: flightMs,
      delay: (showDelay + (Number(spawn.durationMs) || 100) + flyDelay) / speed,
      easing: "cubic-bezier(.3,.02,.72,.98)",
      fill: "forwards"
    });
    activeAnimations.push(flightAnimation);
    flightAnimation.finished.then(() => {
      if (runId !== collectionRun || !coin.isConnected) return;
      const endTransform = `translate(calc(-50% + ${p3.x}px),calc(-50% + ${p3.y}px)) rotate(${i % 2 === 0 ? 360 : -360}deg)`;
      if (animationType === "scalebigger" && status) status.textContent = `飞行结束 · 正在执行吸附收尾 ${arrived + 1}/${count}`;
      const arrivalAnimation = coin.animate([
        { transform: `${endTransform} scale(${flightEndScale})`, opacity: 1 },
        { transform: `${endTransform} scale(1.1)`, opacity: 1, offset: .42 },
        { transform: `${endTransform} scale(.5)`, opacity: 0 }
      ], { duration: 200 / speed, easing: "cubic-bezier(.2,.85,.35,1)", fill: "forwards" });
      activeAnimations.push(arrivalAnimation);
      arrivalAnimation.finished.then(() => {
        if (runId !== collectionRun || !coin.isConnected) return;
        coin.remove();
        arrived += 1;
        total.textContent = (initialGold + arrived * valuePerItem).toLocaleString("en-US");
        animateElement(hud, [
          { transform: "scale(1)" },
          { transform: "scale(1.16)" },
          { transform: "scale(1)" }
        ], { duration: 190 });
        if (status) status.textContent = `金币到账中 · ${arrived} / ${count}`;
        if (arrived === count) {
          button.disabled = false;
          if (status) status.textContent = `收获完成 · +${(count * valuePerItem).toLocaleString("en-US")} 金币`;
          button.querySelector("b").textContent = "再次收获";
          showToast(`+ ${(count * valuePerItem).toLocaleString("en-US")} 金币已到账`);
        }
      }).catch(() => {});
    }).catch(() => {});
  }
}

function bindCoinPickup() {
  const coin = stage.querySelector('[data-action="pickup-coin"]');
  const total = stage.querySelector("[data-pickup-total]");
  const hud = stage.querySelector("[data-pickup-hud]");
  const status = stage.querySelector("[data-pickup-status]");
  if (!coin || !total) return;
  coin.addEventListener("click", () => {
    if (coin.disabled) return;
    coin.disabled = true;
    const from = Number(total.textContent.replace(/[^0-9.-]/g, "")) || 0;
    animateElement(coin, [
      { transform: "translate(-50%,-50%) translateY(0) scale(1)", opacity: 1 },
      { transform: "translate(-50%,-50%) translateY(4px) scale(.82,.9)", opacity: 1, offset: .16 },
      { transform: "translate(-50%,-50%) translateY(-42px) rotate(180deg) scale(1.08)", opacity: 1, offset: .72 },
      { transform: "translate(-50%,-50%) translateY(-62px) rotate(220deg) scale(.3)", opacity: 0 }
    ], { duration: 380 }).finished.then(() => {
      total.textContent = (from + 100).toLocaleString("en-US");
      animateElement(hud, [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 230 });
      if (status) status.textContent = "拾取完成 · +100 金币";
      showToast("+100 金币已到账");
      setTimeout(() => {
        if (coin.isConnected) {
          coin.disabled = false;
          animateElement(coin, [{ opacity: 0, transform: "translate(-50%,-50%) translateY(12px) scale(.6)" }, { opacity: 1, transform: "translate(-50%,-50%) translateY(0) scale(1)" }], { duration: 220 });
        }
      }, 450);
    }).catch(() => {});
  });
}

function animateCounter() {
  const valueNode = stage.querySelector("[data-counter-value]");
  const status = stage.querySelector("[data-counter-status]");
  if (!valueNode) return;
  if (counterFrame) cancelAnimationFrame(counterFrame);
  const from = Number(valueNode.dataset.from) || 0;
  const to = Number(valueNode.dataset.to) || 0;
  const duration = 820 / speed;
  const started = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    valueNode.textContent = Math.round(from + (to - from) * eased).toLocaleString("en-US");
    if (progress < 1) counterFrame = requestAnimationFrame(step);
    else {
      counterFrame = 0;
      valueNode.textContent = to.toLocaleString("en-US");
      if (status) status.textContent = "数值已到达目标值";
    }
  };
  counterFrame = requestAnimationFrame(step);
}

function bindSceneInteractions() {
  const mode = currentPreset.interaction?.type;
  if (mode === "pressable") stage.querySelectorAll('[data-action="pressable"]').forEach(bindPressable);
  if (mode === "click-feedback") {
    const button = stage.querySelector('[data-action="click-feedback"]');
    if (button) bindClickFeedback(button);
  }
  if (mode === "popup-dismiss") bindPopupDismiss();
  if (mode === "list-scroll") bindListScroll();
  if (mode === "coin-harvest") {
    const button = stage.querySelector('[data-action="collect-coins"]');
    button?.addEventListener("click", () => collectCoins(button));
    const radius = stage.querySelector("[data-coin-radius]");
    const radiusValue = stage.querySelector("[data-radius-value]");
    radius?.addEventListener("input", () => { if (radiusValue) radiusValue.textContent = radius.value; });
    const flight = stage.querySelector("[data-coin-flight]");
    const flightValue = stage.querySelector("[data-flight-value]");
    flight?.addEventListener("input", () => { if (flightValue) flightValue.textContent = flight.value; });
    const arc = stage.querySelector("[data-coin-arc]");
    const arcValue = stage.querySelector("[data-arc-value]");
    arc?.addEventListener("input", () => { if (arcValue) arcValue.textContent = arc.value; });
    const random = stage.querySelector("[data-coin-random]");
    const randomValue = stage.querySelector("[data-random-value]");
    random?.addEventListener("input", () => { if (randomValue) randomValue.textContent = random.value; });
  }
  if (mode === "coin-tap") bindCoinPickup();
  if (mode === "tabs") bindTabs();
  if (mode === "accordion") bindAccordion();
  if (mode === "counter") {
    stage.querySelector('[data-action="counter"]')?.addEventListener("click", animateCounter);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastHandle);
  toastHandle = setTimeout(() => toast.classList.remove("show"), 1900);
}

async function copyText(text, successMessage) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand("copy");
      helper.remove();
      if (!copied) throw new Error("Clipboard API unavailable");
    }
    showToast(successMessage);
  } catch (error) {
    showToast("复制失败，请检查浏览器剪贴板权限");
    console.error(error);
  }
}

function exportPreset() {
  const preset = {
    schemaVersion: "1.1.0",
    presetId: currentPreset.id,
    name: currentPreset.title,
    category: currentPreset.category,
    intent: currentPreset.intent,
    source: "game-dev-skills/ui-motion-design/playground",
    coordinateSystem: "preview-relative; convert to target project's UI coordinate space",
    previewOverrides: { intensity, playbackRate: speed },
    durationMs: getTotalDuration(),
    referenceViewport: { width: 720, height: 405, unit: "preview px; scale to target UI space" },
    repeat: currentPreset.loopPauseMs ? { mode: "interval", pauseMs: currentPreset.loopPauseMs } : { mode: "once" },
    stages: currentPreset.stages,
    parameters: Object.fromEntries(currentPreset.parameters.map(([key, value]) => [key, value])),
    tracks: currentPreset.tracks.map((track) => ({
      name: track.name,
      target: track.target || trackTarget(track.name),
      role: track.type,
      startMs: track.startMs,
      durationMs: track.durationMs,
      staggerMs: track.staggerMs || 0,
      easing: track.easing,
      iterations: track.iterations || 1,
      keyframes: track.frames.map((frame) => ({ ...frame }))
    })),
    implementationNotes: [
      "该参数集是设计参考，不是 Cocos API 调用代码。",
      "按目标项目 Cocos 版本核实节点、Tween、遮罩、坐标转换和生命周期接口。",
      "同一属性同一时刻只能由一个明确的动画所有者控制。",
      "实现前检查支点、布局、触摸命中、打断、反向、销毁和对象池复用。",
      "必须在目标运行环境实测，并以截图/录屏确认实际表现。"
    ]
  };
  if (currentPreset.interaction) preset.interaction = { ...currentPreset.interaction };
  if (currentPreset.sequence) {
    preset.sequence = structuredClone(currentPreset.sequence);
    if (currentPreset.interaction?.type === "coin-harvest") {
      const count = Number(stage.querySelector("[data-coin-count]")?.value) || preset.sequence.spawnCount;
      const radius = Number(stage.querySelector("[data-coin-radius]")?.value) || preset.sequence.scatter.radius;
      const flightMs = Number(stage.querySelector("[data-coin-flight]")?.value) || preset.sequence.flight.durationMs;
      const randomScope = Number(stage.querySelector("[data-coin-random]")?.value) ?? preset.sequence.scatter.randomScope;
      const lineType = stage.querySelector("[data-coin-line]")?.value || preset.sequence.flight.lineType;
      const arcHeight = Number(stage.querySelector("[data-coin-arc]")?.value) || preset.sequence.flight.arcHeight;
      const animationType = stage.querySelector("[data-coin-anim]")?.value || preset.sequence.animationType;
      preset.sequence.spawnCount = count;
      preset.sequence.countIndex = preset.sequence.countMapping.indexOf(count);
      preset.sequence.scatter.radius = radius;
      preset.sequence.scatter.randomScope = randomScope;
      preset.sequence.flight.durationMs = flightMs;
      preset.sequence.flight.lineType = lineType;
      preset.sequence.flight.arcHeight = arcHeight;
      preset.sequence.animationType = animationType;
      const waitMax = preset.sequence.wait.showDelayRangeMs?.[1] || 300;
      const flyMax = (preset.sequence.wait.flyDelayBaseMs || 200) + (preset.sequence.wait.flyDelayRangeMs?.[1] || 300);
      const scatterMs = preset.sequence.scatter.durationMs || 100;
      const arrivalMs = 200;
      preset.durationMs = Math.max(preset.durationMs, waitMax + scatterMs + flyMax + flightMs + arrivalMs);
    }
  }
  return preset;
}

function exportMarkdown() {
  const preset = exportPreset();
  const trackLines = preset.tracks.map((track) =>
    `| ${track.name} | ${track.target} | ${track.startMs} | ${track.durationMs} | ${track.staggerMs} | ${track.easing} |`
  ).join("\n");
  const parameterLines = Object.entries(preset.parameters).map(([key, value]) => `- ${key}：${value}`).join("\n");
  const extra = [
    preset.interaction ? `## 交互演示\n${preset.interaction.hint || preset.interaction.type}` : "",
    preset.sequence ? `## 事件 / 运行序列\n\n\`\`\`json\n${JSON.stringify(preset.sequence, null, 2)}\n\`\`\`` : ""
  ].filter(Boolean).join("\n\n");
  return `# ${preset.name} · 游戏 UI 动效规格

## 动作意图
${preset.intent}

## 动作阶段
${preset.stages.map((item, i) => `${i + 1}. ${item}`).join("\n")}

## 核心参数
${parameterLines}

## 轨道时间轴
| 轨道 | 目标 | 开始 (ms) | 时长 (ms) | 错峰 (ms) | 缓动 |
|---|---|---:|---:|---:|---|
${trackLines}

${extra}

## 关键帧数据
\`\`\`json
${JSON.stringify(preset.tracks.map(({name,target,type,startMs,durationMs,staggerMs,easing,frames})=>({name,target:target||trackTarget(name),role:type,startMs,durationMs,staggerMs:staggerMs||0,easing,keyframes:frames})),null,2)}
\`\`\`

## 实现约束
- 将本规格视为动作/时间/参数参考，不要直接把 Web API 当作 Cocos API。
- 根据目标项目坐标系重新计算锚点、路径和分辨率适配尺度。
- 分离业务状态、视觉状态与交互状态；只有真实事件完成后才提交对应业务结果。
- 明确重复触发、中断、反向、重定向、完成和节点销毁的策略。
- 运行时验证主体动作、次动作、性能和多分辨率表现；提供截图/录屏证据。

## 当前预览覆盖
- 动作力度：${Math.round(intensity*100)}%
- 播放倍率：${speed.toFixed(2)}×
- 总体时长参考：${preset.durationMs} ms
`;
}

function exportPrompt() {
  const json = JSON.stringify(exportPreset(), null, 2);
  return `请参考以下游戏 UI 动效规格，在当前游戏项目中实现同等的动作意图与视觉节奏。

实现要求：
1. 先检查项目引擎与 Cocos 版本、节点结构、现有动画封装和布局/输入约束，不要臆测 API。
2. 按语义阶段搭建主体动作，再添加次级轨道；不要把全部效果简化成统一 Scale + Fade。
3. 保留主次关系、支点、轨迹、错峰、动作节奏和关键事件。
4. 明确动画打断、反向、重复触发、目标变化和节点销毁策略。
5. 将业务状态与视觉动画分离；如涉及资源到账，必须将数值提交与真实到达/拾取事件绑定，不能提前结算。
6. 将参考视口坐标、Bezier 控制点和 CSS 缓动映射到目标 Cocos 项目的坐标空间与动画系统。
7. 完成后在目标 Cocos 运行环境实测，提供关键帧截图/录屏，并报告未通过项。
8. 可以按项目约束映射参数，但若必须改变动作结构，请说明原因。

参考规格（JSON）：
${json}
`;
}

function replayCurrentPreset() {
  const mode = currentPreset.interaction?.type;
  if (mode === "popup-dismiss") {
    const modal = stage.querySelector('[data-motion="dismiss-modal"]');
    const reopen = stage.querySelector('[data-action="reopen-modal"]');
    if (reopen && !reopen.hidden) reopen.click();
    else stage.querySelector('[data-action="close-modal"]')?.click();
    return;
  }
  if (mode === "coin-tap") {
    stage.querySelector('[data-action="pickup-coin"]')?.click();
    return;
  }
  if (mode === "accordion") {
    stage.querySelector('[data-action="toggle-accordion"]')?.click();
    return;
  }
  playMotion();
}

function bindEvents() {
  $("#replay-btn").addEventListener("click", replayCurrentPreset);
  $("#reset-btn").addEventListener("click", () => {
    intensity = 1;
    speed = 1;
    $("#intensity").value = "100";
    $("#speed").value = "100";
    updateControlLabels();
    mountScene();
    playMotion();
  });
  $("#apply-btn").addEventListener("click", () => {
    intensity = Number($("#intensity").value) / 100;
    speed = Number($("#speed").value) / 100;
    updateControlLabels();
    playMotion();
  });
  $("#intensity").addEventListener("input", updateControlLabels);
  $("#speed").addEventListener("input", updateControlLabels);
  $("#copy-json").addEventListener("click", () => copyText(JSON.stringify(exportPreset(), null, 2), "参数 JSON 已复制"));
  $("#copy-spec").addEventListener("click", () => copyText(exportMarkdown(), "动效规格 Markdown 已复制"));
  $("#copy-prompt").addEventListener("click", () => copyText(exportPrompt(), "Agent 复刻指令已复制"));

  $("#previous-preset").addEventListener("click", () => movePreset(-1));
  $("#next-preset").addEventListener("click", () => movePreset(1));

  $("#preset-search").addEventListener("input", (event) => {
    searchQuery = event.currentTarget.value;
    $("#clear-search").hidden = !searchQuery.trim();
    renderLibrary();
    const visible = getVisiblePresets();
    if (visible.length && !visible.some((preset) => preset.id === currentPreset.id)) {
      selectPreset(visible[0].id);
    }
  });
  $("#clear-search").addEventListener("click", () => {
    $("#preset-search").value = "";
    searchQuery = "";
    $("#clear-search").hidden = true;
    renderLibrary();
    $("#preset-search").focus();
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      const visible = getVisiblePresets();
      if (visible.length && !visible.some((preset) => preset.id === currentPreset.id)) {
        selectPreset(visible[0].id);
      } else {
        renderLibrary();
      }
    });
  });

  presetList.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const buttons = [...presetList.querySelectorAll("[data-preset]")];
    const currentIndex = buttons.indexOf(document.activeElement);
    if (currentIndex < 0) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? buttons.length - 1
      : Math.max(0, Math.min(buttons.length - 1, currentIndex + (event.key === "ArrowDown" ? 1 : -1)));
    buttons[nextIndex]?.focus();
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const editing = target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    if (event.key === "/" && !editing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      $("#preset-search").focus();
    } else if (event.key === "Escape" && target === $("#preset-search")) {
      if (searchQuery) $("#clear-search").click();
      else $("#preset-search").blur();
    }
  });
}

function movePreset(direction) {
  const visible = getVisiblePresets();
  if (!visible.length) return;
  const currentIndex = visible.findIndex((preset) => preset.id === currentPreset.id);
  const nextIndex = Math.max(0, Math.min(visible.length - 1, (currentIndex < 0 ? 0 : currentIndex) + direction));
  if (nextIndex !== currentIndex) selectPreset(visible[nextIndex].id);
}

function updateControlLabels() {
  $("#intensity-value").textContent = `${$("#intensity").value}%`;
  $("#speed-value").textContent = `${(Number($("#speed").value) / 100).toFixed(1)}×`;
}

function init() {
  bindEvents();
  updateControlLabels();
  renderLibrary();
  mountScene();
  renderDetails();
  playMotion();
}

init();
