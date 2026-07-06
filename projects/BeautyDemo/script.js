// Header scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile nav
const mobileToggle = document.getElementById('mobileToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

function closeMobile() {
  mobileToggle.classList.remove('active');
  mobileNav.classList.remove('active');
  document.body.style.overflow = '';
}
mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.add('active');
  mobileNav.classList.add('active');
  document.body.style.overflow = 'hidden';
});
mobileClose.addEventListener('click', closeMobile);
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));

// FAQ accordion
function toggleFaq(btn) {
  const item = btn.parentElement;
  const answer = item.querySelector('.faq-answer');
  const wasActive = item.classList.contains('active');
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('active');
    i.querySelector('.faq-answer').style.maxHeight = null;
  });
  if (!wasActive) {
    item.classList.add('active');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

// Booking form
function handleForm(e) {
  e.preventDefault();
  const form = document.getElementById('bookingForm');
  const card = form.closest('.booking-form-card');
  form.style.display = 'none';
  card.querySelector('h3').style.display = 'none';
  card.querySelector(':scope > p').style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
  return false;
}

// Scroll animations
const animateEls = document.querySelectorAll('[data-animate]');
const animObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
animateEls.forEach(el => animObs.observe(el));
