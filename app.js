const STORAGE_KEY = "countdown-app";

const $ = (sel) => document.querySelector(sel);

const setup = $("#setup");
const countdown = $("#countdown");
const setupForm = $("#setup-form");
const eventNameInput = $("#event-name");
const targetInput = $("#target-datetime");
const displayName = $("#display-name");
const displayTarget = $("#display-target");
const timer = $("#timer");
const progressBar = $("#progress-bar");
const finished = $("#finished");
const editBtn = $("#edit-btn");
const resetBtn = $("#reset-btn");

const units = {
  days: $("#days"),
  hours: $("#hours"),
  minutes: $("#minutes"),
  seconds: $("#seconds"),
};

let tickInterval = null;
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDisplayDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toLocalDatetimeValue(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function setDefaultDatetime() {
  const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
  targetInput.value = toLocalDatetimeValue(inOneHour);
}

function applyPreset(preset) {
  const now = Date.now();
  let target;

  switch (preset) {
    case "1h":
      target = new Date(now + 60 * 60 * 1000);
      break;
    case "24h":
      target = new Date(now + 24 * 60 * 60 * 1000);
      break;
    case "7d":
      target = new Date(now + 7 * 24 * 60 * 60 * 1000);
      break;
    case "ny": {
      const year = new Date().getFullYear();
      const ny = new Date(year + 1, 0, 1, 0, 0, 0);
      target = ny;
      eventNameInput.value = "New Year";
      break;
    }
    default:
      return;
  }

  targetInput.value = toLocalDatetimeValue(target);
  document.querySelectorAll(".preset").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.preset === preset);
  });
}

function getRemaining(targetIso) {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return { total: diff, days, hours, minutes, seconds: secs, done: false };
}

function getProgress(targetIso, startedAt) {
  const target = new Date(targetIso).getTime();
  const start = startedAt || Date.now();
  const total = target - start;
  const elapsed = Date.now() - start;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function flashUnit(name) {
  const el = timer.querySelector(`[data-unit="${name}"]`);
  if (!el) return;
  el.classList.add("tick");
  setTimeout(() => el.classList.remove("tick"), 300);
}

let prevSeconds = null;

function render(data) {
  const { name, target, startedAt } = data;
  const remaining = getRemaining(target);
  const progress = getProgress(target, startedAt);

  displayName.textContent = name || "Countdown";
  displayTarget.textContent = formatDisplayDate(target);

  units.days.textContent = pad(remaining.days);
  units.hours.textContent = pad(remaining.hours);
  units.minutes.textContent = pad(remaining.minutes);
  units.seconds.textContent = pad(remaining.seconds);

  if (prevSeconds !== null && prevSeconds !== remaining.seconds) {
    flashUnit("seconds");
  }
  prevSeconds = remaining.seconds;

  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", Math.round(progress));

  if (remaining.done) {
    countdown.classList.add("complete");
    finished.classList.remove("hidden");
    stopTick();
  } else {
    countdown.classList.remove("complete");
    finished.classList.add("hidden");
  }
}

function showCountdown(data) {
  setup.classList.add("hidden");
  countdown.classList.remove("hidden");
  prevSeconds = null;
  render(data);
  startTick(data);
}

function showSetup(prefill) {
  stopTick();
  setup.classList.remove("hidden");
  countdown.classList.add("hidden");

  if (prefill) {
    eventNameInput.value = prefill.name || "";
    targetInput.value = toLocalDatetimeValue(prefill.target);
  }
}

function startTick(data) {
  stopTick();
  tickInterval = setInterval(() => render(data), 1000);
}

function stopTick() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

function startCountdown(e) {
  e.preventDefault();

  const name = eventNameInput.value.trim();
  const targetLocal = targetInput.value;
  if (!targetLocal) return;

  const target = new Date(targetLocal).toISOString();
  if (new Date(target) <= new Date()) {
    targetInput.setCustomValidity("Pick a future date and time.");
    targetInput.reportValidity();
    return;
  }
  targetInput.setCustomValidity("");

  const data = {
    name: name || "Countdown",
    target,
    startedAt: Date.now(),
  };

  state = data;
  saveState(data);
  showCountdown(data);
}

document.querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
});

targetInput.addEventListener("input", () => {
  targetInput.setCustomValidity("");
  document.querySelectorAll(".preset").forEach((b) => b.classList.remove("active"));
});

setupForm.addEventListener("submit", startCountdown);

editBtn.addEventListener("click", () => {
  if (state) showSetup(state);
});

resetBtn.addEventListener("click", () => {
  state = null;
  clearState();
  stopTick();
  eventNameInput.value = "";
  setDefaultDatetime();
  document.querySelectorAll(".preset").forEach((b) => b.classList.remove("active"));
  showSetup();
});

setDefaultDatetime();

if (state && new Date(state.target) > new Date()) {
  showCountdown(state);
} else if (state) {
  showCountdown(state);
} else {
  showSetup();
}
