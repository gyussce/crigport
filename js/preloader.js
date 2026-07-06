/* ═══ CRIG® — preloader ═══ */
export function runPreloader(assetsPromise) {
  const count = document.getElementById("preCount");
  const bar = document.getElementById("preBar");
  const state = { p: 0 };
  const tick = gsap.to(state, {
    p: 92, duration: 1.1, ease: "power2.out",
    onUpdate: () => { count.textContent = Math.round(state.p); bar.style.width = state.p + "%"; },
  });
  return Promise.all([assetsPromise, document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(
    () =>
      new Promise((done) => {
        tick.kill();
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          document.getElementById("preloader")?.remove();
          document.removeEventListener("visibilitychange", finish);
          done();
        };
        // hidden tabs freeze rAF, which freezes GSAP — never trust the tween to fire there
        document.addEventListener("visibilitychange", () => { if (document.hidden) finish(); });
        setTimeout(finish, 2500); // hard cap: the site must never stay covered
        if (document.hidden) { finish(); return; }
        gsap.to(state, {
          p: 100, duration: 0.3,
          onUpdate: () => { count.textContent = Math.round(state.p); bar.style.width = state.p + "%"; },
          onComplete: () => {
            gsap.to("#preloader", { yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.15, onComplete: finish });
          },
        });
      })
  );
}
