/* ═══════════════════ CRIG® — boot sequence ═══════════════════
   data.js      → PROJECTS array (add new work there)
   utils.js     → shared flags + text splitting
   particles.js → WebGL particle portrait
   scroll.js    → Lenis + hero/reveals/photo fan
   gallery.js   → work cards + horizontal pin
   effects.js   → cursor, magnet, strands, clock, bubbles
   booking.js   → consultation booking modal
   preloader.js → loading screen
════════════════════════════════════════════════════════════════ */
window.__crigBoot = true; // signals the no-fx fallback in index.html that modules loaded

import { splitChars } from "./utils.js";
import { initParticles } from "./particles.js";
import { initSmoothScroll, initHero, initReveals, initPhotoFan } from "./scroll.js";
import { buildCards, initWork } from "./gallery.js";
import { initCursor, initMagnet, initStrands, initClock, initProgress, initBubbles } from "./effects.js";
import { initBooking } from "./booking.js";
import { runPreloader } from "./preloader.js";

splitChars(document.querySelector(".hero-line"));
splitChars(document.querySelector(".hero-line--offset"));
buildCards();
initSmoothScroll();
initCursor();
initMagnet();
initClock();
initStrands();
initBubbles();
initBooking();

const assets = initParticles();
runPreloader(assets).then(() => {
  initHero();
  initReveals();
  initPhotoFan();
  initWork();
  initProgress();
  ScrollTrigger.refresh();
});
