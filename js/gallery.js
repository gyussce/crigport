/* ═══ CRIG® — work section: card build + horizontal pin ═══ */
import { PROJECTS } from "./data.js";
import { reduced } from "./utils.js";

export function buildCards() {
  const track = document.getElementById("workTrack");
  PROJECTS.forEach((p, i) => {
    const el = document.createElement(p.href ? "a" : "div");
    el.className = "card";
    if (p.href) { el.href = p.href; el.target = "_blank"; el.rel = "noopener"; el.dataset.cursor = "VIEW"; }
    else el.dataset.cursor = "SOON";
    el.style.setProperty("--accent", p.accent);
    el.style.setProperty("--card-grad", `linear-gradient(160deg, ${p.accent}26, #101016 65%)`);
    const media = p.img
      ? `<div class="card-media"><img src="${p.img}" alt="${p.title}" loading="lazy" /></div>`
      : `<div class="card-big">${p.big.replace("\n", "<br/>")}</div>`;
    el.innerHTML = `
      ${media}
      <div class="card-scrim"></div>
      <div class="card-idx">${String(i + 1).padStart(2, "0")}</div>
      <div class="card-body">
        <span class="card-tag">${p.tag}</span>
        <h3 class="card-title">${p.title}</h3>
        <div class="card-meta"><span>${p.year}</span><span>${p.href ? "Visit live build ↗" : "Brand & asset kit"}</span></div>
      </div>`;
    track.appendChild(el);
  });
  const outro = document.createElement("div");
  outro.className = "work-outro";
  outro.innerHTML = `<p>Yours could be<br/><b>№ 11</b> —</p>`;
  track.appendChild(outro);
}

export function initWork() {
  const track = document.getElementById("workTrack");
  const cards = gsap.utils.toArray(".card");
  const work = document.getElementById("work");
  const shouldStack = reduced || window.matchMedia("(max-width: 760px), (max-height: 620px)").matches;
  if (shouldStack) {
    work.classList.add("work--stacked");
    return;
  }
  const getDist = () => track.scrollWidth - window.innerWidth;
  gsap.to(track, {
    x: () => -getDist(),
    ease: "none",
    scrollTrigger: {
      trigger: "#work",
      start: "top top",
      end: () => "+=" + getDist(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: () => {
        const cx = window.innerWidth / 2;
        cards.forEach((card) => {
          const r = card.getBoundingClientRect();
          const rel = (r.left + r.width / 2 - cx) / cx; // -1..1-ish
          gsap.set(card, { rotationY: gsap.utils.clamp(-16, 16, rel * 14), z: -Math.abs(rel) * 60, transformPerspective: 1000 });
          const img = card.querySelector(".card-media img");
          if (img) gsap.set(img, { xPercent: gsap.utils.clamp(-8, 8, rel * 7) });
        });
      },
    },
  });
}
