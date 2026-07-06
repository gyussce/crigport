/* ==========================================================================
   TINY STEPS DAYCARE — Highly Premium Interactions
   Scroll reveals, statistics counting, FAQs, modal forms
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────── Sticky Navbar & Banner Scroll Behavior ───────────────
  const navbar = document.getElementById('navbar');
  const banner = document.getElementById('urgency-banner');
  let lastScroll = 0;

  // Add scroll-specific transitions to the banner stylesheet dynamically
  if (banner) {
    banner.style.transition = 'max-height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), padding 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease';
    banner.style.overflow = 'hidden';
    banner.style.maxHeight = '100px';
  }

  function handleNavScroll() {
    const scrollY = window.scrollY;

    // Sticky scrolled state
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Collapse announcement banner when scrolled past 120px
    if (banner) {
      if (scrollY > 120) {
        banner.style.maxHeight = '0px';
        banner.style.paddingTop = '0px';
        banner.style.paddingBottom = '0px';
        banner.style.opacity = '0';
      } else {
        banner.style.maxHeight = '100px';
        banner.style.paddingTop = '0.6rem';
        banner.style.paddingBottom = '0.6rem';
        banner.style.opacity = '1';
      }
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Run initially to ensure proper state

  // ─────────────── Mobile Navigation Menu ───────────────
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  let mobileNavOpen = false;

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNavOpen = !mobileNavOpen;
      mobileNav.classList.toggle('active', mobileNavOpen);
      document.body.style.overflow = mobileNavOpen ? 'hidden' : '';

      // Animate hamburger lines
      const spans = hamburger.querySelectorAll('span');
      if (mobileNavOpen) {
        spans[0].style.transform = 'rotate(45deg) translateY(6px) translateX(5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-6px) translateX(5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    // Close mobile nav when clicking a link
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });

    // Close mobile nav when clicking outside the menu drawer
    document.addEventListener('click', (e) => {
      if (mobileNavOpen && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
        closeMobileNav();
      }
    });

    function closeMobileNav() {
      mobileNavOpen = false;
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
      
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  }

  // ─────────────── Scroll Reveal Animations ───────────────
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ─────────────── FAQ Accordion ───────────────
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const answerInner = item.querySelector('.faq-answer-inner');

    if (questionBtn && answer && answerInner) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other FAQ items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const btn = other.querySelector('.faq-question');
            if (btn) btn.setAttribute('aria-expanded', 'false');
            const ans = other.querySelector('.faq-answer');
            if (ans) ans.style.maxHeight = '0';
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0';
        } else {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answerInner.scrollHeight + 'px';
        }
      });
    }
  });

  // ─────────────── Statistics Counter Animation ───────────────
  function animateCounter(element, target, duration = 1800) {
    let start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic Ease Out
      const current = Math.round(start + (target - start) * easeOut);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target; // Ensure exact final value
      }
    }

    requestAnimationFrame(update);
  }

  // Intersect Observer for Statistics Section
  const statsSection = document.querySelector('.stats-section');
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  if (statsSection && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statNumbers.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'), 10);
            if (!isNaN(target)) {
              // Special display formatting for the '5 AM' stat
              if (target === 5) {
                num.innerHTML = '5<span style="font-size: 1.5rem; font-family: var(--font-body); font-weight: 700; margin-left: 2px;">:30 AM</span>';
                statsObserver.unobserve(statsSection);
                return;
              }
              animateCounter(num, target, 2000);
            }
          });
          statsAnimated = true;
          statsObserver.unobserve(statsSection);
        }
      });
    }, { threshold: 0.25 });

    statsObserver.observe(statsSection);
  }

  // ─────────────── Form Handling with Success Modal ───────────────
  window.handleFormSubmit = function(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.form-submit-btn');
    const originalText = submitBtn.textContent;

    // Show elegant loading state
    submitBtn.textContent = 'Sending Inquiry...';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    // Simulate database submission
    setTimeout(() => {
      // Success state button transition
      submitBtn.textContent = '✓ Inquiry Sent!';
      submitBtn.style.opacity = '1';
      submitBtn.style.backgroundColor = 'var(--color-success)';

      // Inject custom success overlay and dialog modal
      const overlay = document.createElement('div');
      overlay.id = 'form-overlay';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      const successMsg = document.createElement('div');
      successMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -46%) scale(0.95);
        background: white;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl, 1.25rem);
        padding: 3rem 2.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 10001;
        text-align: center;
        max-width: 440px;
        width: 90%;
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
      `;
      successMsg.innerHTML = `
        <div style="width: 72px; height: 72px; border-radius: 50%; background: #e0efff; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem;">✓</div>
        <h3 style="margin-bottom: 0.75rem; font-family: var(--font-display); font-size: 1.75rem; color: var(--color-primary);">Inquiry Received!</h3>
        <p style="color: var(--color-text-muted); font-size: 0.98rem; line-height: 1.5; margin-bottom: 2rem;">Thank you so much. Lorraine will review your schedule details and text or call you within 24 hours.</p>
        <button id="close-modal-btn" class="btn btn-primary" style="width: 100%; border-radius: 9999px;">Perfect, Thanks!</button>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(successMsg);

      // Trigger reflow to initiate smooth fade-in transitions
      setTimeout(() => {
        overlay.style.opacity = '1';
        successMsg.style.opacity = '1';
        successMsg.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 50);

      // Wire up close callbacks
      const closeButton = successMsg.querySelector('#close-modal-btn');
      
      const closeModal = () => {
        overlay.style.opacity = '0';
        successMsg.style.opacity = '0';
        successMsg.style.transform = 'translate(-50%, -46%) scale(0.95)';
        setTimeout(() => {
          overlay.remove();
          successMsg.remove();
        }, 300);
      };

      closeButton.addEventListener('click', closeModal);
      overlay.addEventListener('click', closeModal);

      // Reset form fields and button state
      form.reset();
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '';
        submitBtn.style.pointerEvents = '';
        submitBtn.style.backgroundColor = '';
      }, 3500);

    }, 1200);
  };

  // ─────────────── Smooth Scroll for All Anchor Links ───────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─────────────── Floating CTA visibility on mobile ───────────────
  const mobileFloatCta = document.getElementById('mobile-float-cta');
  let floatCtaVisible = false;

  function handleFloatCta() {
    if (window.innerWidth > 768 || !mobileFloatCta) return;

    const scrollY = window.scrollY;
    const heroSection = document.getElementById('hero');
    const heroHeight = heroSection ? heroSection.offsetHeight : 500;

    if (scrollY > heroHeight * 0.6 && !floatCtaVisible) {
      mobileFloatCta.style.transform = 'translateY(0)';
      floatCtaVisible = true;
    } else if (scrollY <= heroHeight * 0.4 && floatCtaVisible) {
      mobileFloatCta.style.transform = 'translateY(100%)';
      floatCtaVisible = false;
    }
  }

  // Initialize mobile CTA in hidden state initially
  if (mobileFloatCta) {
    if (window.innerWidth <= 768) {
      mobileFloatCta.style.transform = 'translateY(100%)';
    }
    window.addEventListener('scroll', handleFloatCta, { passive: true });
    window.addEventListener('resize', handleFloatCta, { passive: true });
  }

  // ─────────────── Phone Number Formatting ───────────────
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);

      if (value.length >= 7) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
      } else if (value.length >= 4) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
      } else if (value.length >= 1) {
        value = `(${value}`;
      }

      e.target.value = value;
    });
  }

  // ─────────────── Hero Parallax Scroll Effect ───────────────
  const heroImageWrapper = document.querySelector('.hero-image-wrapper');

  if (window.innerWidth > 768 && heroImageWrapper) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < 800) {
        heroImageWrapper.style.transform = `translateY(${scrollY * 0.06}px)`;
      }
    }, { passive: true });
  }

  // ─────────────── Active Nav Link Highlighting ───────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '-100px 0px -40% 0px'
  });

  sections.forEach(section => sectionObserver.observe(section));

  console.log('🍼 Tiny Steps Daycare — Web interactions loaded successfully');
});
