/* ═══ CRIG® — shared flags + text splitting ═══ */
gsap.registerPlugin(ScrollTrigger);

export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function splitChars(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const ch of child.textContent) {
          const s = document.createElement("span");
          s.className = "ch";
          s.textContent = ch === " " ? " " : ch;
          frag.appendChild(s);
        }
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1 && child.tagName !== "BR") walk(child);
    });
  };
  walk(el);
  return el.querySelectorAll(".ch");
}

export function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
  return el.querySelectorAll(".w");
}
