document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        mobileMenuBtn.classList.toggle('open');
        mobileNav.classList.toggle('open');
        // Prevent body scroll when menu is open
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    }

    mobileMenuBtn.addEventListener('click', toggleMenu);

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // 3. Scroll Animations (Intersection Observer)
    const slideUpElements = document.querySelectorAll('.slide-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    slideUpElements.forEach(el => {
        observer.observe(el);
    });
    // 4. Web3Forms AJAX Submission
    const form = document.getElementById('contactForm');
    const result = document.getElementById('formResult');
    const formContainer = document.getElementById('formContainer');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            result.innerHTML = "Sending...";
            result.classList.remove('hidden', 'success', 'error');

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    result.innerHTML = "Message sent successfully!";
                    result.classList.add('success');
                    formContainer.classList.add('form-success-state');
                    form.reset();
                    
                    // Optional: remove the highlight after a few seconds
                    setTimeout(() => {
                        formContainer.classList.remove('form-success-state');
                        result.classList.add('hidden');
                    }, 5000);
                } else {
                    console.log(response);
                    result.innerHTML = json.message;
                    result.classList.add('error');
                }
            })
            .catch(error => {
                console.log(error);
                result.innerHTML = "Something went wrong!";
                result.classList.add('error');
            });
        });
    }
});
