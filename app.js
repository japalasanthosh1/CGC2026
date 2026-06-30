(() => {

  /* ─── Scroll Reveal ─── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ─── Navbar hide/show on scroll ─── */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  let prevY = 0;

  function closeMenu() {
    nav.classList.remove('menu-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', event => {
      event.stopPropagation();
      const isOpen = nav.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('click', event => {
      if (!nav.contains(event.target)) closeMenu();
    });
  }

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 400 && y > prevY && !nav.classList.contains('menu-open')) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }
    prevY = y;
  }, { passive: true });

  /* ─── Event countdown with Flip Animation ─── */
  const countdownTarget = new Date('2026-07-18T09:00:00+05:30').getTime();
  const countdownFields = {
    days: document.getElementById('countdownDays'),
    hours: document.getElementById('countdownHours'),
    minutes: document.getElementById('countdownMinutes'),
    seconds: document.getElementById('countdownSeconds')
  };

  const prevValues = { days: '', hours: '', minutes: '', seconds: '' };

  function updateCountdown() {
    const remaining = Math.max(0, countdownTarget - Date.now());
    const values = {
      days: String(Math.floor(remaining / 86400000)).padStart(2, '0'),
      hours: String(Math.floor((remaining / 3600000) % 24)).padStart(2, '0'),
      minutes: String(Math.floor((remaining / 60000) % 60)).padStart(2, '0'),
      seconds: String(Math.floor((remaining / 1000) % 60)).padStart(2, '0')
    };

    Object.entries(values).forEach(([key, val]) => {
      const field = countdownFields[key];
      if (!field) return;

      if (prevValues[key] !== val) {
        if (prevValues[key] !== '') {
          // Trigger flip animation on card element (strong)
          field.classList.remove('flipping');
          void field.offsetWidth; // Force a reflow
          field.classList.add('flipping');

          // Swap text value halfway through rotation (200ms)
          setTimeout(() => {
            field.textContent = val;
          }, 200);
        } else {
          // Set initial value immediately
          field.textContent = val;
        }
        prevValues[key] = val;
      }
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ─── Smooth anchor scroll ─── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ─── FAQ accordion (exclusive) ─── */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });


  /* ─── Experiences Interaction ─── */
  const expItems = document.querySelectorAll('.exp-item');
  const expPreviewImage = document.getElementById('expPreviewImage');

  if (expItems.length > 0 && expPreviewImage) {
    expItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (item.classList.contains('active')) return;

        // Remove active class from all
        expItems.forEach(i => i.classList.remove('active'));
        // Add to current
        item.classList.add('active');

        // Swap image with fade
        const newSrc = item.getAttribute('data-img');
        if (newSrc && expPreviewImage.getAttribute('src') !== newSrc) {
          expPreviewImage.classList.add('fade-out');
          setTimeout(() => {
            expPreviewImage.setAttribute('src', newSrc);
            expPreviewImage.classList.remove('fade-out');
          }, 400); // Matches CSS transition duration
        }
      });
    });
  }

})();
