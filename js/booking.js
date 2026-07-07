/* ═══════════════════ CRIG® — booking flow ═══════════════════
   Static, no-backend booking: pick day → pick time → details, then hands
   the request off via a pre-filled email + calendar links.

   ┌─ TO GO FULLY AUTOMATED LATER ───────────────────────────────┐
   │ Self-host cal.diy / Cal.com (needs a server + database),     │
   │ then replace the body of submitBooking() with a fetch()      │
   │ POST to your booking API. Nothing else here needs to change. │
   └──────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════ */
const TO = "poz4gan@gmail.com";
const OPEN_HOUR = 9, CLOSE_HOUR = 18, SLOT_MIN = 30, DURATION_MIN = 30, MONTHS_AHEAD = 2;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const state = { view: null, date: null, time: null };
let els = {}, lastFocus = null;
const pad = (n) => String(n).padStart(2, "0");
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const monthStart = (offset = 0) => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth() + offset, 1); };

export function initBooking() {
  const root = document.getElementById("booking");
  if (!root) return;
  els = {
    root,
    grid: document.getElementById("calGrid"),
    month: document.getElementById("calMonth"),
    prev: document.getElementById("calPrev"),
    next: document.getElementById("calNext"),
    slotsLabel: document.getElementById("slotsLabel"),
    slots: document.getElementById("slotsGrid"),
    step1: root.querySelector('[data-step="1"]'),
    step2: root.querySelector('[data-step="2"]'),
    step3: root.querySelector('[data-step="3"]'),
    when: document.getElementById("bookingWhen"),
    form: document.getElementById("bookingForm"),
    name: document.getElementById("bkName"),
    email: document.getElementById("bkEmail"),
    msg: document.getElementById("bkMsg"),
    detailsBack: document.getElementById("detailsBack"),
    doneName: document.getElementById("doneName"),
    doneWhen: document.getElementById("doneWhen"),
    gcal: document.getElementById("gcalLink"),
    ics: document.getElementById("icsLink"),
    doneClose: document.getElementById("doneClose"),
  };
  state.view = monthStart(0);

  document.querySelectorAll("[data-book]").forEach((btn) => btn.addEventListener("click", open));
  root.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !root.hidden) close(); });
  els.prev.addEventListener("click", () => shiftMonth(-1));
  els.next.addEventListener("click", () => shiftMonth(1));
  els.detailsBack.addEventListener("click", () => showStep(1));
  els.doneClose.addEventListener("click", close);
  els.form.addEventListener("submit", onSubmit);

  renderCalendar();
}

/* ── open / close ── */
function open() {
  lastFocus = document.activeElement;
  els.root.hidden = false;
  document.body.classList.add("booking-open");
  window.lenis?.stop();
  showStep(1);
  els.root.querySelector(".booking-close").focus();
}
function close() {
  els.root.hidden = true;
  document.body.classList.remove("booking-open");
  window.lenis?.start();
  lastFocus?.focus?.();
}

/* ── calendar ── */
function shiftMonth(dir) {
  const v = new Date(state.view.getFullYear(), state.view.getMonth() + dir, 1);
  if (v < monthStart(0) || v > monthStart(MONTHS_AHEAD)) return;
  state.view = v;
  renderCalendar();
}
function renderCalendar() {
  const y = state.view.getFullYear(), m = state.view.getMonth();
  els.month.textContent = `${MONTH_NAMES[m]} ${y}`;
  els.prev.disabled = state.view <= monthStart(0);
  els.next.disabled = state.view >= monthStart(MONTHS_AHEAD);
  els.grid.innerHTML = "";

  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7; // Monday = 0
  const days = new Date(y, m + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  for (let i = 0; i < firstDow; i++) {
    const blank = document.createElement("div");
    blank.className = "cal-day is-empty";
    els.grid.appendChild(blank);
  }
  for (let d = 1; d <= days; d++) {
    const cell = new Date(y, m, d);
    const btn = document.createElement("button");
    btn.className = "cal-day";
    btn.type = "button";
    btn.textContent = d;
    if (cell < today || cell.getDay() === 0) {         // no past days, no Sundays
      btn.disabled = true;
    } else {
      btn.addEventListener("click", () => selectDate(cell, btn));
    }
    if (state.date && sameDay(cell, state.date)) btn.classList.add("is-sel");
    els.grid.appendChild(btn);
  }
}

/* ── slots ── */
function selectDate(date, btn) {
  state.date = date; state.time = null;
  els.grid.querySelectorAll(".is-sel").forEach((e) => e.classList.remove("is-sel"));
  btn.classList.add("is-sel");
  renderSlots();
}
function renderSlots() {
  els.slotsLabel.textContent = fmtDay(state.date);
  els.slots.innerHTML = "";
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let mi = 0; mi < 60; mi += SLOT_MIN) {
      if (h * 60 + mi + DURATION_MIN > CLOSE_HOUR * 60) continue;
      const s = document.createElement("button");
      s.className = "slot";
      s.type = "button";
      s.textContent = fmtTime(h, mi);
      s.addEventListener("click", () => selectTime(h, mi, s));
      els.slots.appendChild(s);
    }
  }
}
function selectTime(h, mi, el) {
  state.time = { h, m: mi };
  els.slots.querySelectorAll(".is-sel").forEach((e) => e.classList.remove("is-sel"));
  el.classList.add("is-sel");
  els.when.textContent = fmtWhen();
  showStep(2);
  setTimeout(() => els.name.focus(), 60);
}

function showStep(n) {
  els.step1.hidden = n !== 1;
  els.step2.hidden = n !== 2;
  els.step3.hidden = n !== 3;
}

/* ── submit ── */
function onSubmit(e) {
  e.preventDefault();
  if (!els.name.value.trim() || !els.email.value.trim()) { els.form.reportValidity?.(); return; }
  submitBooking({ name: els.name.value.trim(), email: els.email.value.trim(), msg: els.msg.value.trim() });
}

/* The one function to swap when you get a real cal.diy/Cal.com backend. */
function submitBooking(data) {
  const p = slotParts();
  const title = `CRIG consultation — ${data.name}`;
  const details = `30-min consultation with Abo Yussuf (CRIG).\nName: ${data.name}\nEmail: ${data.email}\nProject: ${data.msg || "—"}`;

  // 1) email the request to Abo (opens the visitor's own mail client, pre-filled)
  const subject = `Consultation request — ${data.name} — ${fmtWhen()}`;
  const body =
    `Hi Abo,\n\nI'd like to book a free consultation.\n\n` +
    `When: ${fmtWhen()} (Chicago / CT)\nName: ${data.name}\nEmail: ${data.email}\n` +
    `Project: ${data.msg || "—"}\n\nThanks!`;
  const mailto = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // 2) prepare calendar hand-offs
  els.gcal.href = gcalUrl(title, details, p);
  els.ics.href = icsUrl(title, details, p);

  els.doneName.textContent = data.name.split(/\s+/)[0] || "friend";
  els.doneWhen.textContent = fmtWhen();
  showStep(3);
  window.location.href = mailto;
}

/* ── date helpers (treat the picked time as Chicago wall-clock; no UTC math) ── */
function slotParts() {
  const d = state.date, t = state.time;
  const endTotal = t.h * 60 + t.m + DURATION_MIN;
  return { y: d.getFullYear(), mo: d.getMonth() + 1, da: d.getDate(), sh: t.h, sm: t.m, eh: Math.floor(endTotal / 60), em: endTotal % 60 };
}
const naive = (y, mo, da, h, mi) => `${y}${pad(mo)}${pad(da)}T${pad(h)}${pad(mi)}00`;

function gcalUrl(title, details, p) {
  const u = new URL("https://calendar.google.com/calendar/render");
  u.searchParams.set("action", "TEMPLATE");
  u.searchParams.set("text", title);
  u.searchParams.set("details", details);
  u.searchParams.set("dates", `${naive(p.y, p.mo, p.da, p.sh, p.sm)}/${naive(p.y, p.mo, p.da, p.eh, p.em)}`);
  u.searchParams.set("ctz", "America/Chicago");
  u.searchParams.set("add", TO);
  return u.toString();
}
function icsUrl(title, details, p) {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CRIG//Booking//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:${Date.now()}@crig`,
    `DTSTART;TZID=America/Chicago:${naive(p.y, p.mo, p.da, p.sh, p.sm)}`,
    `DTEND;TZID=America/Chicago:${naive(p.y, p.mo, p.da, p.eh, p.em)}`,
    `SUMMARY:${title}`, `DESCRIPTION:${details.replace(/\n/g, "\\n")}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
}

function fmtDay(d) { return `${WEEKDAYS[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`; }
function fmtTime(h, mi) { const ap = h < 12 ? "AM" : "PM"; const hh = h % 12 || 12; return `${hh}:${pad(mi)} ${ap}`; }
function fmtWhen() { const p = slotParts(); return `${fmtDay(state.date)} · ${fmtTime(p.sh, p.sm)}–${fmtTime(p.eh, p.em)} CT`; }
