# CRIG® — Portfolio of Ganiu Yussuf

Hand-coded 3D scrolling portfolio. No build step, no frameworks to install —
plain HTML/CSS/JS with three.js, GSAP, and Lenis loaded from CDNs.

## Run locally

```bash
python3 serve.py        # → http://localhost:8000/
```

(Any static server works. Opening index.html directly via file:// falls back
to a plain, animation-free page.)

## Structure

```
index.html            single page
css/                  base / hero / about / work / contact
js/                   ES modules — add project № 11 in js/data.js (PROJECTS array)
assets/               optimized images used by the page
projects/             the live client builds the work cards link to
```

## Deploy (GitHub Pages)

Push this folder as a repo, then: **Settings → Pages → Deploy from a branch →
`main` / root**. Everything is relative-pathed, so it works at
`https://<user>.github.io/<repo>/` as-is.

## Libraries (CDN)

three.js 0.160 · GSAP 3.12.5 + ScrollTrigger · Lenis 1.1.14 · Syne, Space Grotesk & Instrument Serif fonts
