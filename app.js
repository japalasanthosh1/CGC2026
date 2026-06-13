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

  /* ─── Multi-step Form ─── */
  const form = document.getElementById('regForm');
  const steps = document.querySelectorAll('.form-step');
  const pips = document.querySelectorAll('.progress-pip');
  let cur = 0;

  function go(n) {
    steps.forEach((s, i) => {
      if (s.id === 'successScreen' || s.id === 'errorScreen') return;
      s.classList.toggle('active', i === n);
    });
    pips.forEach((p, i) => p.classList.toggle('on', i <= n));
    cur = n;
  }

  document.querySelectorAll('.next-btn').forEach(b => {
    b.addEventListener('click', () => {
      const inputs = steps[cur].querySelectorAll('[required]');
      let ok = true;
      inputs.forEach(i => { if (!i.checkValidity()) { i.reportValidity(); ok = false; } });
      if (ok && cur < 4) go(cur + 1);
    });
  });

  document.querySelectorAll('.prev-btn').forEach(b => {
    b.addEventListener('click', () => { if (cur > 0) go(cur - 1); });
  });

  // Prevent "Enter" key from prematurely submitting the form, trigger Next instead
  if (form) {
    form.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const nextBtn = steps[cur].querySelector('.next-btn');
        const submitBtn = steps[cur].querySelector('button[type="submit"]');
        if (nextBtn) nextBtn.click();
        else if (submitBtn) submitBtn.click();
      }
    });
  }

  const errorBackBtn = document.getElementById('errorBackBtn');
  if (errorBackBtn) {
    errorBackBtn.addEventListener('click', () => {
      document.getElementById('errorScreen').classList.remove('active');
      go(cur); // Return to the current active step in the form
    });
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let id = 'CG26-APP-';
      for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];

      // Parse application data
      const data = {
        id: id,
        name: document.getElementById('regName')?.value || '',
        email: document.getElementById('regEmail')?.value || '',
        phone: document.getElementById('regPhone')?.value || '',
        type: document.getElementById('regType')?.value || '',
        org: document.getElementById('regOrg')?.value || '',
        role: document.getElementById('regRole')?.value || '',
        linkedin: document.getElementById('regLinkedin')?.value || '',
        github: document.getElementById('regGithub')?.value || '',
        portfolio: document.getElementById('regPortfolio')?.value || '',
        interests: Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value),
        status: 'Pending',
        timestamp: new Date().toISOString()
      };

      // Submit securely to backend endpoint /api/apply (Neon DB proxy)
      fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Submission failed');
        }
        return res.json();
      })
      .then(() => {
        console.log('Application securely submitted.');
        
        // Only show success screen if the API call succeeds
        steps.forEach(s => s.classList.remove('active'));
        pips.forEach(p => p.classList.add('on'));
        const ss = document.getElementById('successScreen');
        const ri = document.getElementById('regId');
        if (ri) ri.textContent = id;
        if (ss) ss.classList.add('active');
      })
      .catch(err => {
        console.error('API submission failed:', err);
        
        // Hide standard form steps
        steps.forEach(s => s.classList.remove('active'));
        pips.forEach(p => p.classList.add('on'));
        const es = document.getElementById('errorScreen');
        
        if (err.message.includes('already applied')) {
          document.getElementById('errorTitle').textContent = 'Already Applied';
          document.getElementById('errorMsg').textContent = 'We already have an application on file with this email or phone number.';
        } else {
          document.getElementById('errorTitle').textContent = 'Application Failed';
          document.getElementById('errorMsg').textContent = 'We are currently experiencing technical difficulties. Please try again later.';
        }
        
        if (es) es.classList.add('active');
      });
    });
  }
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
