import { initBooking } from './booking.js';

initBooking();

const clock = document.getElementById('availClock');
const updateClock = () => {
  clock.textContent = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit',
  }).format(new Date());
  document.getElementById('clock').textContent = `${clock.textContent} · Chicago`;
};
updateClock();
setInterval(updateClock, 60000);

// Highlight the section currently being read, including direct anchor visits.
const links = [...document.querySelectorAll('.topnav a')];
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    links.forEach((link) => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-15% 0px -55% 0px' });
document.querySelectorAll('main > section').forEach((section) => observer.observe(section));
