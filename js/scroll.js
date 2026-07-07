/* ═══ CRIG® — smooth scroll + scroll-driven animations ═══ */
import { reduced, splitChars, splitWords } from "./utils.js";
import { heroState } from "./particles.js";

export let lenis = null;

export function initSmoothScroll() {
  if (!reduced && typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.05 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }
  // route anchor jumps through Lenis (native jumps get fought by the smoother)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

export function initHero() {
  const chars = document.querySelectorAll(".hero-line .ch");
  const tl = gsap.timeline();
  tl.to(chars, { y: 0, rotate: 0, duration: 1.1, ease: "power4.out", stagger: 0.045 }, 0.1)
    .to(".reveal-line", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.15 }, 0.5);
  heroState.intro();

  if (reduced) return;
  // pinned three-act performance: text departs → head spins in deep relief → vortex blowout
  ScrollTrigger.create({
    trigger: "#hero",
    start: "top top",
    end: "+=230%",
    pin: true,
    anticipatePin: 1,
    scrub: 0.5,
    onUpdate: (self) => {
      const p = self.progress;
      heroState.choreograph(p);
      const t = Math.min(1, p / 0.28);
      gsap.set(".hero-inner", { y: t * -160, opacity: 1 - t * 1.2 });
      gsap.set(".hero-glow", { opacity: 1 - p * 1.4 });
      gsap.set(".hero-hint, .hero-index", { opacity: 1 - t * 3 });
    },
    onLeave: () => { heroState.setActive(false); gsap.to("#gl", { autoAlpha: 0, duration: 0.4 }); },
    onEnterBack: () => { heroState.setActive(true); gsap.to("#gl", { autoAlpha: 1, duration: 0.3 }); },
  });
}

export function initReveals() {
  document.querySelectorAll(".section-title[data-split], .contact-title[data-split]").forEach((el) => {
    const chars = splitChars(el);
    gsap.to(chars, {
      y: 0, rotate: 0, duration: 0.9, ease: "power4.out", stagger: 0.035,
      scrollTrigger: { trigger: el, start: "top 82%" },
    });
  });
  document.querySelectorAll("[data-words]").forEach((el) => {
    const words = splitWords(el);
    gsap.to(words, {
      opacity: 1, duration: 0.4, stagger: 0.02, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "top 40%", scrub: !reduced },
    });
  });
  if (!reduced) {
    gsap.utils.toArray(".tier").forEach((t, i) => {
      // clearProps drops the inline transform so the CSS :hover lift still works after
      gsap.fromTo(t, { opacity: 0, y: 42 }, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.08, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: ".tiers", start: "top 82%" } });
    });
  }
  document.querySelectorAll(".about-stats b[data-count]").forEach((el) => {
    const target = +el.dataset.count;
    ScrollTrigger.create({
      trigger: el, start: "top 85%", once: true,
      onEnter: () => gsap.fromTo(el, { innerText: 0 }, { innerText: target, duration: 1.6, ease: "power2.out", snap: { innerText: 1 } }),
    });
  });
}

export function initPhotoFan() {
  const card = document.querySelector("#photoStack .pcard");
  if (!card) return;
  // rest a little BELOW center so it always clears the "THE HUMAN BEHIND IT" heading
  gsap.set(card, { xPercent: -50, yPercent: -40 });
  if (reduced) return;
  // reveal uses px-y + scale/rotate/blur (leaves yPercent free for the parallax below)
  gsap.from(card, {
    y: 44, rotate: -4, scale: 0.92, autoAlpha: 0, filter: "blur(6px)",
    ease: "power3.out",
    scrollTrigger: { trigger: "#about", start: "top 76%", end: "center 62%", scrub: 1 },
  });
  // gentle downward drift only — never travels up toward the heading
  gsap.to(card, {
    yPercent: -26, ease: "none",
    scrollTrigger: { trigger: "#about", start: "top bottom", end: "bottom top", scrub: 1.4 },
  });
}
