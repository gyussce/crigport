/**
 * Ashley's Laundry Service - Demo Website Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  /* --- Element References --- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');
  const floatingCta = document.getElementById('floatingCta');
  const contactForm = document.getElementById('contactForm');
  const faqItems = document.querySelectorAll('.faq-item');
  const revealElements = document.querySelectorAll('.reveal');

  /* --- Navigation & Scrolling --- */
  // Handle sticky navbar and floating CTA on scroll
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      if (floatingCta) floatingCta.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      if (floatingCta) floatingCta.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // Mobile menu toggle
  const toggleMenu = () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
    navOverlay.classList.toggle('open');
    document.body.style.overflow = isExpanded ? '' : 'hidden'; // Prevent scrolling when menu open
  };

  navToggle.addEventListener('click', toggleMenu);
  navOverlay.addEventListener('click', toggleMenu);

  // Close mobile menu when a link is clicked
  const navItems = document.querySelectorAll('.nav-link, .nav-cta .btn');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  // Highlight active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const highlightNavLink = () => {
    const scrollY = window.scrollY;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);
      
      if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        navLink.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', highlightNavLink, { passive: true });

  /* --- FAQ Accordion --- */
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close all other FAQs
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });
      
      // Toggle current FAQ
      if (isOpen) {
        item.classList.remove('open');
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* --- Scroll Reveal Animations --- */
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Stop observing once revealed
      }
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  /* --- Contact Form Demo Submission --- */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Basic validation check
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const submitBtn = document.getElementById('submit-btn');
      const originalText = submitBtn.innerHTML;
      
      // Loading state
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      // Simulate API call
      setTimeout(() => {
        const formWrapper = document.querySelector('.contact-form-wrapper');
        formWrapper.innerHTML = `
          <div class="form-success">
            <div class="form-success-icon">✓</div>
            <h3>Request Sent Successfully!</h3>
            <p>Thank you for reaching out. This is a demo website, but in the real version, Ashley would receive your request and get back to you shortly to confirm the details.</p>
            <button class="btn btn-secondary" style="margin-top: 2rem;" onclick="location.reload()">Send Another Request</button>
          </div>
        `;
      }, 1500);
    });
  }
});
