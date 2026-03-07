'use strict';

/* utility */

/**
 * shorthand query selector helpers
 */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* scroll progress bar */
function initScrollProgress() {
  const bar = qs('#progress-bar');
  if (!bar) return;

  const update = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = `${pct}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* navbar — scroll state + active link */
function initNavbar() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  const updateNav = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // highlight active nav link based on scroll position
  const sections = qsa('section[id], div[id="home"]');
  const navLinks = qsa('.nav-links a');

  const updateActiveLink = () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', () => {
    updateNav();
    updateActiveLink();
  }, { passive: true });

  updateNav();
}


/* mobile menu */
function initMobileMenu() {
  const btn     = qs('#menu-btn');
  const nav     = qs('#mobile-nav');
  const overlay = qs('#mobile-overlay');
  const close   = qs('#menu-close');

  if (!btn || !nav) return;

  const open = () => {
    nav.classList.add('open');
    overlay.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    nav.classList.remove('open');
    overlay.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', open);
  close?.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // close on nav link click
  qsa('a', nav).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // close on escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}


/* scroll reveal */
function initScrollReveal() {
  const revealEls = qsa('.reveal, .reveal-left, .reveal-scale');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -48px 0px',
    }
  );

  revealEls.forEach(el => observer.observe(el));
}


/* staggered child animations
   (cards/grids animate in sequence) */
function initStaggeredAnimations() {
  const groups = [
    '.about-grid .card',
    '.skills-grid-main .skill-card',
    '.nsri-stats-grid .nsri-stat-card',
    '.goals-grid .goal-card',
    '.contacts-grid .contact-card',
    '.join-links .link-card',
    '.pathways-grid .pathway-card',
    '.timeline .timeline-item',
  ];

  groups.forEach(selector => {
    const items = qsa(selector);
    items.forEach((el, i) => {
      // Offset each child's transition delay slightly
      el.style.transitionDelay = `${i * 0.1}s`;
    });
  });
}


/* smooth scroll for anchor links */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = qs(href);
      if (!target) return;

      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* skill pills — subtle float-in on hover zone */
function initPillInteractions() {
  const pills = qsa('.pill');

  pills.forEach(pill => {
    pill.addEventListener('mouseenter', () => {
      pill.style.transform = 'translateY(-2px)';
    });
    pill.addEventListener('mouseleave', () => {
      pill.style.transform = '';
    });
  });
}


/* stat counter animation
   (counts up numbers when they enter view) */

function parseStatValue(text) {
  // handles formats: "152+", "3,584", "$10K", "93+", "649K"
  const cleaned = text.replace(/[,$+]/g, '').trim();
  if (cleaned.endsWith('K')) return parseFloat(cleaned) * 1000;
  return parseFloat(cleaned) || null;
}

function formatStatValue(original, value) {
  const hasPlus  = original.includes('+');
  const hasDollar = original.includes('$');
  const hasK     = original.includes('K');
  const hasComma = original.includes(',');

  let result = '';
  if (hasDollar) result += '$';

  if (hasK && value >= 1000) {
    result += (value / 1000).toFixed(0) + 'K';
  } else if (hasComma) {
    result += value.toLocaleString();
  } else {
    result += value.toFixed(0);
  }

  if (hasPlus) result += '+';
  return result;
}

function animateCounter(el) {
  const original = el.textContent.trim();
  const target   = parseStatValue(original);
  if (target === null) return;

  const duration = 1600;
  const start    = performance.now();

  const step = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(eased * target);

    el.textContent = formatStatValue(original, current);

    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = original; // restore exact original
  };

  requestAnimationFrame(step);
}

function initCounters() {
  const counterEls = qsa('.stat-number, .nsri-stat-number');
  if (!counterEls.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counterEls.forEach(el => observer.observe(el));
}


/* photo frame - subtle parallax on mouse move */
function initPhotoParallax() {
  const container = qs('.photo-container');
  if (!container) return;

  // only on desktop
  if (window.matchMedia('(max-width: 900px)').matches) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    container.style.transform = `
      perspective(800px)
      rotateY(${dx * 4}deg)
      rotateX(${-dy * 3}deg)
      translateZ(0)
    `;
  });

  document.addEventListener('mouseleave', () => {
    container.style.transform = '';
    container.style.transition = 'transform 0.6s ease';
  });
}


/* cursor dot (subtle custom cursor on desktop) */

function initCursorDot() {
  // skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  Object.assign(dot.style, {
    position:        'fixed',
    width:           '6px',
    height:          '6px',
    background:      'var(--gold)',
    borderRadius:    '50%',
    pointerEvents:   'none',
    zIndex:          '9998',
    opacity:         '0',
    transform:       'translate(-50%, -50%)',
    transition:      'opacity 0.3s ease, width 0.2s ease, height 0.2s ease',
    mixBlendMode:    'difference',
  });
  document.body.appendChild(dot);

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let visible = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      dot.style.opacity = '0.7';
      visible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    visible = false;
  });

  // scale up on clickable elements
  qsa('a, button, .card, .pill, .tag, .skill-card, .goal-card, .contact-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width  = '12px';
      dot.style.height = '12px';
      dot.style.opacity = '0.5';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width  = '6px';
      dot.style.height = '6px';
      dot.style.opacity = '0.7';
    });
  });

  // smooth lag animation
  const animate = () => {
    dotX += (mouseX - dotX) * 0.18;
    dotY += (mouseY - dotY) * 0.18;
    dot.style.left = `${dotX}px`;
    dot.style.top  = `${dotY}px`;
    requestAnimationFrame(animate);
  };
  animate();
}


/* init - run everything on DOMContentLoaded */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initStaggeredAnimations();
  initSmoothScroll();
  initPillInteractions();
  initCounters();
  initPhotoParallax();
  initCursorDot();
});
