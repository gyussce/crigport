// Mobile nav toggle
(function() {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function() {
      links.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
      }
    });
  }
})();

// Scroll fade-in
function initFadeIn() {
  var items = document.querySelectorAll('.fade-in:not(.visible)');
  if (!items.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function(item) {
    observer.observe(item);
  });
}

initFadeIn();

// FAQ accordion
function toggleFaq(btn) {
  var item = btn.parentElement;
  var wasOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item.open').forEach(function(el) {
    el.classList.remove('open');
  });

  if (!wasOpen) {
    item.classList.add('open');
  }
}

// Contact form
function handleSubmit(e) {
  e.preventDefault();
  var msg = document.getElementById('formMessage');
  if (msg) {
    msg.textContent = "Thanks! I'll get back to you within 24 hours. Check your email for a confirmation.";
    msg.style.display = 'block';
  }
  e.target.reset();
  return false;
}

// Nav background on scroll
(function() {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 20) {
      nav.style.boxShadow = '0 1px 8px rgba(27,42,60,0.06)';
    } else {
      nav.style.boxShadow = 'none';
    }
  });
})();
