const TZ = "Europe/Istanbul";
const START_KEY = "ashura_start_ymd";

const dateLine = document.getElementById("dateLine");
const dayVal = document.getElementById("dayVal");
const hourVal = document.getElementById("hourVal");
const minuteVal = document.getElementById("minuteVal");
const secondVal = document.getElementById("secondVal");

function pad2(value) {
  return String(value).padStart(2, "0");
}

function getIstanbulParts(date) {
  // Use Intl to obtain wall-clock time in Istanbul regardless of the user's local timezone.
  const formatter = new Intl.DateTimeFormat("tr-TR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const out = {};
  for (const p of parts) {
    if (p.type !== "literal") out[p.type] = p.value;
  }
  return out; // {year, month, day, hour, minute, second}
}

function ymdFromParts(parts) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function utcMidnightMsFromYmd(ymd) {
  const [y, m, d] = ymd.split("-").map((x) => Number(x));
  return Date.UTC(y, m - 1, d);
}

function getStartYmd(nowParts) {
  let start = localStorage.getItem(START_KEY);
  if (!start) {
    start = ymdFromParts(nowParts);
    localStorage.setItem(START_KEY, start);
  }
  return start;
}

function getDayCount(startYmd, nowYmd) {
  const startMs = utcMidnightMsFromYmd(startYmd);
  const nowMs = utcMidnightMsFromYmd(nowYmd);
  const diffDays = Math.floor((nowMs - startMs) / 86400000);
  return Math.max(0, diffDays);
}

function render() {
  const now = new Date();
  const p = getIstanbulParts(now);
  const nowYmd = ymdFromParts(p);
  const startYmd = getStartYmd(p);
  const dayCount = getDayCount(startYmd, nowYmd);

  // Date line: DD.MM.YYYY
  dateLine.textContent = `${p.day}.${p.month}.${p.year}`;

  // Counter: day number (increments at Istanbul midnight) + Istanbul time
  dayVal.textContent = String(dayCount);
  hourVal.textContent = pad2(p.hour);
  minuteVal.textContent = pad2(p.minute);
  secondVal.textContent = pad2(p.second);
}

// Align the first paint close to the next second tick for a clean, "real time" feel.
function start() {
  render();
  const ms = Date.now();
  const delay = 1000 - (ms % 1000);
  setTimeout(() => {
    render();
    setInterval(render, 1000);
  }, delay);
}

start();
