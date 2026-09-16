import { initBooking } from './booking.js';

// Preserve incoming links to sections from the former single-page site.
const legacyPages = { '#work': 'work.html', '#about': 'about.html', '#caps': 'services.html', '#contact': 'contact.html' };
if (document.body.classList.contains('page-home') && legacyPages[location.hash]) {
  location.replace(new URL(legacyPages[location.hash], location.href).href);
}

initBooking();

const updateClock = () => {
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit',
  }).format(new Date());
  const availability = document.getElementById('availClock');
  if (availability) availability.textContent = time;
  const clock = document.getElementById('clock');
  if (clock) clock.textContent = `${time} · Chicago`;
};
updateClock();
setInterval(updateClock, 60000);
document.getElementById('year').textContent = new Date().getFullYear();
