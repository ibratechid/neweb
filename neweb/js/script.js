/*
  NEWEB Digital Solutions
  Vanilla JS enhancements:
  - Mobile navigation
  - Dark mode toggle (prefers-color-scheme + localStorage)
  - Smooth scrolling
  - IntersectionObserver scroll animations
  - Testimonials carousel
  - FAQ accordion
  - Portfolio filtering + modal
  - Blog filtering
  - Newsletter signup (localStorage)
  - Contact form validation + draft persistence
*/

(() => {
  'use strict';

  const STORAGE_KEYS = {
    theme: 'neweb.theme',
    newsletterEmail: 'neweb.newsletter.email',
    newsletterDate: 'neweb.newsletter.date',
    contactDraft: 'neweb.contact.draft',
    portfolioFilter: 'neweb.portfolio.filter',
  };

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const safeLocalStorage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        // ignore
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    },
  };

  const escapeHTML = (value) => {
    const str = String(value ?? '');
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  };

  const isValidEmail = (email) => {
    const val = String(email ?? '').trim();
    if (val.length < 6 || val.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(val);
  };

  const setLiveMessage = (el, { type, message }) => {
    if (!el) return;
    el.classList.remove('form-message--success', 'form-message--error');
    if (type === 'success') el.classList.add('form-message--success');
    if (type === 'error') el.classList.add('form-message--error');
    el.innerHTML = escapeHTML(message);
    el.hidden = false;
  };

  function initThemeToggle() {
    const btn = qs('[data-theme-toggle]');
    if (!btn) return;

    const apply = (theme) => {
      if (theme === 'dark' || theme === 'light') {
        document.documentElement.dataset.theme = theme;
      } else {
        delete document.documentElement.dataset.theme;
      }

      const effectiveTheme = document.documentElement.dataset.theme
        ? document.documentElement.dataset.theme
        : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'dark'
          : 'light';

      btn.setAttribute(
        'aria-label',
        effectiveTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
      btn.setAttribute('data-theme', effectiveTheme);
    };

    const saved = safeLocalStorage.get(STORAGE_KEYS.theme);
    if (saved) apply(saved);
    else apply(null);

    btn.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme
        ? document.documentElement.dataset.theme
        : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'dark'
          : 'light';

      const next = current === 'dark' ? 'light' : 'dark';
      safeLocalStorage.set(STORAGE_KEYS.theme, next);
      apply(next);
    });
  }

  function initMobileNav() {
    const toggle = qs('[data-nav-toggle]');
    const nav = qs('#primary-navigation');
    if (!toggle || !nav) return;

    const close = () => {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    const open = () => {
      document.body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', () => {
      const isOpen = document.body.classList.contains('nav-open');
      if (isOpen) close();
      else open();
    });

    qsa('a', nav).forEach((a) => {
      a.addEventListener('click', () => close());
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) close();
    });
  }

  function openPostDetailsForHash() {
    const hash = window.location.hash;
    if (!hash) return;

    const el = qs(hash);
    if (!el) return;

    const details = qs('[data-post-details]', el);
    if (details && details.tagName.toLowerCase() === 'details') details.open = true;
  }

  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        if (a.classList.contains('skip-link')) return;
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = qs(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });

        try {
          history.pushState(null, '', href);
        } catch {
          // ignore
        }

        openPostDetailsForHash();
      });
    });

    window.addEventListener('hashchange', openPostDetailsForHash);
    openPostDetailsForHash();
  }

  function initScrollAnimations() {
    const items = qsa('[data-animate]');
    if (!items.length) return;
    if (prefersReducedMotion()) {
      items.forEach((el) => el.classList.add('in-view'));
      return;
    }

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    );

    items.forEach((el) => observer.observe(el));
  }

  function initAccordion() {
    const accordions = qsa('[data-accordion]');
    if (!accordions.length) return;

    accordions.forEach((acc) => {
      const items = qsa('.accordion-item', acc);
      items.forEach((item, idx) => {
        const btn = qs('.accordion-trigger', item);
        const panel = qs('.accordion-panel', item);
        if (!btn || !panel) return;

        const panelId = panel.id || `accordion-panel-${Math.random().toString(16).slice(2)}`;
        panel.id = panelId;
        btn.setAttribute('aria-controls', panelId);

        const setOpen = (open) => {
          item.dataset.open = open ? 'true' : 'false';
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        setOpen(idx === 0);

        btn.addEventListener('click', () => {
          const isOpen = item.dataset.open === 'true';
          items.forEach((it) => {
            const itBtn = qs('.accordion-trigger', it);
            if (!itBtn) return;
            it.dataset.open = 'false';
            itBtn.setAttribute('aria-expanded', 'false');
          });
          setOpen(!isOpen);
        });
      });
    });
  }

  function initTestimonialsCarousel() {
    const root = qs('[data-carousel]');
    if (!root) return;

    const track = qs('[data-carousel-track]', root);
    const prev = qs('[data-carousel-prev]', root);
    const next = qs('[data-carousel-next]', root);
    if (!track || !prev || !next) return;

    const items = qsa('.carousel-item', track);
    if (!items.length) return;

    let index = 0;
    let timer = null;

    const pageSize = () => {
      const w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 768) return 2;
      return 1;
    };

    const maxIndex = () => Math.max(0, items.length - pageSize());

    const scrollToIndex = (i, { user = false } = {}) => {
      index = clamp(i, 0, maxIndex());
      const first = items[index];
      if (!first) return;

      const left = first.offsetLeft;
      track.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

      if (user) restart();
    };

    const restart = () => {
      if (prefersReducedMotion()) return;
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => {
        const nextIndex = index + pageSize();
        if (nextIndex > maxIndex()) scrollToIndex(0);
        else scrollToIndex(nextIndex);
      }, 6000);
    };

    prev.addEventListener('click', () => scrollToIndex(index - pageSize(), { user: true }));
    next.addEventListener('click', () => scrollToIndex(index + pageSize(), { user: true }));

    window.addEventListener('resize', () => scrollToIndex(index));

    scrollToIndex(0);
    restart();
  }

  function initNewsletter() {
    const form = qs('[data-newsletter-form]');
    if (!form) return;

    const input = qs('input[type="email"]', form);
    const msg = qs('[data-form-message]', form);
    if (!input || !msg) return;

    const existingEmail = safeLocalStorage.get(STORAGE_KEYS.newsletterEmail);
    if (existingEmail) {
      input.value = existingEmail;
      setLiveMessage(msg, {
        type: 'success',
        message: 'You are already subscribed. Thank you!',
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = input.value.trim();
      if (!isValidEmail(email)) {
        setLiveMessage(msg, { type: 'error', message: 'Please enter a valid email address.' });
        input.focus();
        return;
      }

      safeLocalStorage.set(STORAGE_KEYS.newsletterEmail, email);
      safeLocalStorage.set(STORAGE_KEYS.newsletterDate, new Date().toISOString());

      setLiveMessage(msg, {
        type: 'success',
        message: 'Subscription saved. We will send practical growth tips to your inbox.',
      });
    });
  }

  function initPortfolioFiltering() {
    const root = qs('[data-portfolio]');
    if (!root) return;

    const buttons = qsa('[data-filter]', root);
    const cards = qsa('[data-project-card]', root);
    const count = qs('[data-results-count]', root);

    if (!buttons.length || !cards.length) return;

    const apply = (filter) => {
      const value = filter || 'all';
      safeLocalStorage.set(STORAGE_KEYS.portfolioFilter, value);

      buttons.forEach((b) => b.setAttribute('aria-pressed', b.dataset.filter === value ? 'true' : 'false'));

      let visible = 0;
      cards.forEach((card) => {
        const category = card.dataset.category;
        const show = value === 'all' || value === category;
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (count) count.textContent = String(visible);
    };

    const initial = safeLocalStorage.get(STORAGE_KEYS.portfolioFilter) || 'all';
    apply(initial);

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => apply(btn.dataset.filter));
    });
  }

  function initPortfolioModal() {
    const modal = qs('#project-modal');
    if (!modal) return;

    const openButtons = qsa('[data-project-open]');
    const title = qs('[data-modal-title]', modal);
    const body = qs('[data-modal-body]', modal);
    const closeBtn = qs('[data-modal-close]', modal);

    if (!openButtons.length || !title || !body || !closeBtn) return;

    let lastFocused = null;

    const close = () => {
      modal.dataset.open = 'false';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };

    const open = (data) => {
      lastFocused = document.activeElement;
      title.textContent = data.title;
      body.innerHTML = `
        <div class="project-thumb" aria-hidden="true">
          <img src="${escapeHTML(data.image)}" alt="" loading="lazy" />
        </div>
        <div class="card__meta">
          <span class="tag">${escapeHTML(data.categoryLabel)}</span>
          <span class="tag">${escapeHTML(data.stack)}</span>
        </div>
        <p>${escapeHTML(data.description)}</p>
        <div class="notice">
          <strong>Outcome:</strong> ${escapeHTML(data.outcome)}
        </div>
      `;

      modal.dataset.open = 'true';
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    openButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const dataset = btn.dataset;
        open({
          title: dataset.title || 'Project',
          image: dataset.image || 'assets/images/placeholder.svg',
          categoryLabel: dataset.categoryLabel || 'Web',
          stack: dataset.stack || 'HTML/CSS/JS',
          description:
            dataset.description ||
            'A modern, performance-focused build designed to increase engagement and conversion.',
          outcome: dataset.outcome || 'Improved usability, faster load times, and clearer messaging.',
        });
      });
    });

    closeBtn.addEventListener('click', () => close());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.dataset.open === 'true') close();

      if (e.key === 'Tab' && modal.dataset.open === 'true') {
        const focusable = qsa(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          modal
        ).filter((el) => !el.hasAttribute('disabled'));

        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  function initBlogFiltering() {
    const root = qs('[data-blog]');
    if (!root) return;

    const search = qs('[data-blog-search]', root);
    const category = qs('[data-blog-category]', root);
    const posts = qsa('[data-post]', root);
    const empty = qs('[data-empty-state]', root);

    if (!posts.length || !search || !category) return;

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const catParam = params.get('category');

    if (q && !search.value) search.value = q;
    if (catParam && qsa('option', category).some((opt) => opt.value === catParam)) {
      category.value = catParam;
    }

    const apply = () => {
      const term = search.value.trim().toLowerCase();
      const cat = category.value;

      let visible = 0;
      posts.forEach((post) => {
        const haystack = `${post.dataset.title} ${post.dataset.excerpt}`.toLowerCase();
        const matchesTerm = !term || haystack.includes(term);
        const matchesCat = cat === 'all' || post.dataset.category === cat;
        const show = matchesTerm && matchesCat;
        post.hidden = !show;
        if (show) visible += 1;
      });

      if (empty) empty.hidden = visible !== 0;
    };

    search.addEventListener('input', apply);
    category.addEventListener('change', apply);
    apply();
  }

  function initContactForm() {
    const form = qs('[data-contact-form]');
    if (!form) return;

    const msg = qs('[data-form-message]', form);
    const fields = {
      name: qs('input[name="name"]', form),
      email: qs('input[name="email"]', form),
      service: qs('select[name="service"]', form),
      message: qs('textarea[name="message"]', form),
    };

    if (!fields.name || !fields.email || !fields.service || !fields.message || !msg) return;

    const loadDraft = () => {
      const raw = safeLocalStorage.get(STORAGE_KEYS.contactDraft);
      if (!raw) return;
      try {
        const draft = JSON.parse(raw);
        fields.name.value = draft.name || '';
        fields.email.value = draft.email || '';
        fields.service.value = draft.service || 'Website Development';
        fields.message.value = draft.message || '';
      } catch {
        // ignore
      }
    };

    const saveDraft = () => {
      const draft = {
        name: fields.name.value.slice(0, 120),
        email: fields.email.value.slice(0, 160),
        service: fields.service.value,
        message: fields.message.value.slice(0, 4000),
        updatedAt: new Date().toISOString(),
      };
      safeLocalStorage.set(STORAGE_KEYS.contactDraft, JSON.stringify(draft));
    };

    loadDraft();
    ['input', 'change'].forEach((evt) => form.addEventListener(evt, saveDraft));

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = fields.name.value.trim();
      const email = fields.email.value.trim();
      const service = fields.service.value;
      const message = fields.message.value.trim();

      if (name.length < 2) {
        setLiveMessage(msg, { type: 'error', message: 'Please enter your name.' });
        fields.name.focus();
        return;
      }

      if (!isValidEmail(email)) {
        setLiveMessage(msg, { type: 'error', message: 'Please enter a valid email address.' });
        fields.email.focus();
        return;
      }

      if (!service) {
        setLiveMessage(msg, { type: 'error', message: 'Please choose a service type.' });
        fields.service.focus();
        return;
      }

      if (message.length < 10) {
        setLiveMessage(msg, { type: 'error', message: 'Please write a short message (at least 10 characters).' });
        fields.message.focus();
        return;
      }

      const payload = {
        name: escapeHTML(name),
        email: escapeHTML(email),
        service: escapeHTML(service),
        message: escapeHTML(message),
      };

      // CSRF-ready structure: include csrf_token input in HTML, and attach it to the request on real deployments.
      void payload;

      setLiveMessage(msg, {
        type: 'success',
        message: 'Message validated and saved locally. In production, this would be securely submitted to your backend.',
      });

      safeLocalStorage.remove(STORAGE_KEYS.contactDraft);
      form.reset();
    });
  }

  function initYear() {
    const year = qs('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileNav();
    initSmoothScroll();
    initScrollAnimations();
    initAccordion();
    initTestimonialsCarousel();
    initNewsletter();
    initPortfolioFiltering();
    initPortfolioModal();
    initBlogFiltering();
    initContactForm();
    initYear();
  });
})();
