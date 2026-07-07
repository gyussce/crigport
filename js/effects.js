/* ═══ CRIG® — cursor, magnetic button, fiber strands, clock ═══ */
import { reduced, finePointer } from "./utils.js";

export function initCursor() {
  if (!finePointer) return;
  const cur = document.getElementById("cursor");
  const label = document.getElementById("cursorLabel");
  const xTo = gsap.quickTo(cur, "x", { duration: 0.18, ease: "power3.out" });
  const yTo = gsap.quickTo(cur, "y", { duration: 0.18, ease: "power3.out" });
  window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });
  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest("[data-cursor], a, button");
    if (t) { cur.classList.add("is-hover"); label.textContent = t.dataset?.cursor || "→"; }
    else cur.classList.remove("is-hover");
  });
}

export function initMagnet() {
  if (!finePointer) return;
  const btn = document.getElementById("magnet");
  const strength = 0.35;
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.4, ease: "power3.out" });
  });
  btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }));
}

export function initStrands() {
  const canvas = document.getElementById("strands");
  const ctx = canvas.getContext("2d");
  const COUNT = 34;
  let w, h, raf = null, t = 0;
  const strands = Array.from({ length: COUNT }, (_, i) => ({
    y: 0.18 + (i / COUNT) * 0.64 + (Math.random() - 0.5) * 0.06,
    amp1: 30 + Math.random() * 70,
    amp2: 12 + Math.random() * 30,
    k1: 0.8 + Math.random() * 1.4,
    k2: 2 + Math.random() * 3,
    speed: 0.25 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    hue: [280, 315, 265, 300][i % 4] + Math.random() * 16,
    len: 0.72 + Math.random() * 0.26,
  }));
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const yAt = (s, p) =>
    s.y * h + Math.sin(p * Math.PI * s.k1 + s.phase + t * s.speed) * s.amp1 * (0.35 + p)
            + Math.sin(p * Math.PI * s.k2 - t * s.speed * 1.4) * s.amp2 * p;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const s of strands) {
      const endX = w * s.len;
      ctx.beginPath();
      ctx.moveTo(-20, yAt(s, -20 / w));
      for (let x = -6, step = 14; x <= endX; x += step) ctx.lineTo(x, yAt(s, x / w));
      ctx.strokeStyle = `hsla(${s.hue}, 65%, 55%, 0.22)`;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      // glowing fiber tip
      const ye = yAt(s, s.len);
      const g = ctx.createRadialGradient(endX, ye, 0, endX, ye, 7);
      g.addColorStop(0, "rgba(255, 194, 240, 0.95)");
      g.addColorStop(1, "rgba(255, 194, 240, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(endX, ye, 7, 0, Math.PI * 2); ctx.fill();
    }
    t += 0.016;
  };
  const loop = () => { draw(); raf = requestAnimationFrame(loop); };
  resize();
  window.addEventListener("resize", resize);
  if (reduced) { draw(); return; }
  new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && !raf) loop();
      else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    });
  }, { threshold: 0.05 }).observe(canvas);
}

export function initProgress() {
  const bar = document.getElementById("progress");
  gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
  gsap.to(bar, {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });
}

export function initClock() {
  const el = document.getElementById("clock");
  const avail = document.getElementById("availClock");
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Chicago" });
  const fmtShort = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });
  const tickC = () => {
    const now = new Date();
    if (el) el.textContent = fmt.format(now) + " CHI";
    if (avail) avail.textContent = fmtShort.format(now);
  };
  tickC(); setInterval(tickC, 1000);
  document.getElementById("year").textContent = new Date().getFullYear();
}

/* floating bubblegum bubbles — ambient, passive */
export function initBubbles() {
  const wrap = document.getElementById("bubbles");
  if (!wrap || reduced) return;
  const N = 16;
  for (let i = 0; i < N; i++) {
    const b = document.createElement("span");
    b.className = "bubble";
    const size = 18 + Math.random() * 72;
    b.style.width = b.style.height = size + "px";
    b.style.left = Math.random() * 100 + "%";
    const dur = 14 + Math.random() * 16;
    b.style.animationDuration = dur + "s";
    b.style.animationDelay = -Math.random() * dur + "s";
    b.style.setProperty("--drift", Math.random() * 90 - 45 + "px");
    wrap.appendChild(b);
  }
}
