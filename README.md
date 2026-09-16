# CRIG® — Portfolio of Abo Yussuf

A responsive, hand-coded portfolio with a portrait introduction, project grid,
service packages, and a consultation request dialog. Plain HTML, CSS, and native
JavaScript modules; no build step or runtime animation dependencies.

## Run locally

```bash
python3 serve.py        # http://localhost:8000/
```

Portfolio content and project links are rendered in HTML and remain available
without JavaScript. Booking requires JavaScript and hands the request to the
visitor's email app; it does not reserve a time automatically.

## Structure

- `index.html`: concise home page and introduction.
- `work.html`: all ten project cards; edit project links here.
- `about.html`: biography and background.
- `services.html`: website packages and capabilities.
- `contact.html`: consultation and email contact.
- Each page contains static navigation, a footer, and the booking dialog; keep these shared sections consistent when editing.
- `css/`: section styles; `refinement.css` defines the current editorial design.
- `js/main.js`: booking initialization, Chicago clocks, and legacy section-link redirects.
- `js/booking.js`: consultation calendar and email/calendar handoff.
- `assets/`: portrait and project imagery.
- `projects/`: linked client builds.

Older animation modules and `js/data.js` remain as reference and are not loaded
by the current page. Fonts use Google Fonts with local fallback families.

## Deploy (GitHub Pages)

Settings → Pages → Deploy from a branch → `main` / root.
Paths are relative, so the site supports GitHub Pages subdirectories.
