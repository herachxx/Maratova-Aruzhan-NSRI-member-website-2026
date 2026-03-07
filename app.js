/**
 * app.js — Aruzhan Maratova · NSRI AIS Kazakhstan
 * Single side-nav: trigger button always visible top-left.
 * Nav slides in; site-wrap shifts right on desktop.
 */

'use strict';

const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ─────────────────────────────────────
   SCROLL PROGRESS BAR
───────────────────────────────────── */
function initScrollProgress() {
  const bar = qs('#progress-bar');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* ─────────────────────────────────────
   SIDE NAV
───────────────────────────────────── */
function initSideNav() {
  const trigger  = qs('#nav-trigger');
  const nav      = qs('#side-nav');
  const closeBtn = qs('#nav-close');
  const siteWrap = qs('#site-wrap');
  if (!trigger || !nav) return;

  let isOpen = false;

  const openNav = () => {
    isOpen = true;
    nav.classList.add('is-open');
    trigger.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    if (window.innerWidth > 900) siteWrap?.classList.add('nav-open');
  };

  const closeNav = () => {
    isOpen = false;
    nav.classList.remove('is-open');
    trigger.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    siteWrap?.classList.remove('nav-open');
  };

  trigger.addEventListener('click', () => (isOpen ? closeNav() : openNav()));
  closeBtn?.addEventListener('click', closeNav);

  // Close on any nav link click
  qsa('a', nav).forEach(link => link.addEventListener('click', closeNav));

  // Close on Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeNav(); });

  // Close on outside click
  document.addEventListener('click', e => {
    if (isOpen && !nav.contains(e.target) && !trigger.contains(e.target)) closeNav();
  });

  // On resize: remove push on mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 900) siteWrap?.classList.remove('nav-open');
  }, { passive: true });
}


/* ─────────────────────────────────────
   ACTIVE NAV LINK
───────────────────────────────────── */
function initActiveNavLink() {
  const sections = qsa('section[id]');
  const links    = qsa('.side-nav-links a');
  if (!links.length) return;

  const update = () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 160) current = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* ─────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────── */
function initScrollReveal() {
  const els = qsa('.reveal, .reveal-left, .reveal-scale');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => obs.observe(el));
}


/* ─────────────────────────────────────
   STAGGERED ANIMATIONS
───────────────────────────────────── */
function initStagger() {
  [
    '.about-grid .card',
    '.top-skills .top-skill-card',
    '.nsri-stats-grid .nsri-stat-card',
    '.goals-grid .goal-card',
    '.contacts-grid .contact-card',
    '.join-links .link-card',
    '.pathways-grid .pathway-card',
    '.timeline .timeline-item',
  ].forEach(sel => {
    qsa(sel).forEach((el, i) => { el.style.transitionDelay = `${i * 0.09}s`; });
  });
}


/* ─────────────────────────────────────
   SMOOTH SCROLL
───────────────────────────────────── */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 32, behavior: 'smooth' });
    });
  });
}


/* ─────────────────────────────────────
   STAT COUNTER ANIMATION
───────────────────────────────────── */
function parseNum(t) {
  const c = t.replace(/[,$+]/g, '').trim();
  if (c.endsWith('K')) return parseFloat(c) * 1000;
  return parseFloat(c) || null;
}

function formatNum(orig, val) {
  let r = orig.includes('$') ? '$' : '';
  if (orig.includes('K') && val >= 1000) r += (val / 1000).toFixed(0) + 'K';
  else if (orig.includes(',')) r += Math.round(val).toLocaleString();
  else r += Math.round(val).toString();
  if (orig.includes('+')) r += '+';
  return r;
}

function animateCounter(el) {
  const orig = el.textContent.trim();
  const max  = parseNum(orig);
  if (!max) return;
  const t0   = performance.now();
  const step = now => {
    const t = Math.min((now - t0) / 1500, 1);
    el.textContent = formatNum(orig, (1 - Math.pow(1 - t, 3)) * max);
    if (t < 1) requestAnimationFrame(step); else el.textContent = orig;
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const els = qsa('.stat-number, .nsri-stat-number');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
}


/* ─────────────────────────────────────
   PHOTO PARALLAX (desktop)
───────────────────────────────────── */
function initPhotoParallax() {
  const c = qs('.photo-container');
  if (!c || window.matchMedia('(max-width: 900px)').matches) return;
  let ticking = false;
  document.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const dx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const dy = (e.clientY / window.innerHeight - 0.5) * 2;
      c.style.transform = `perspective(800px) rotateY(${dx * 3.5}deg) rotateX(${-dy * 2.5}deg)`;
      ticking = false;
    });
  });
  document.addEventListener('mouseleave', () => {
    c.style.transition = 'transform 0.6s ease';
    c.style.transform = '';
    setTimeout(() => { c.style.transition = ''; }, 650);
  });
}


/* ─────────────────────────────────────
   CURSOR DOT
───────────────────────────────────── */
function initCursorDot() {
  if (window.matchMedia('(hover: none)').matches) return;
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    position: 'fixed', width: '6px', height: '6px',
    background: 'var(--gold)', borderRadius: '50%',
    pointerEvents: 'none', zIndex: '9998', opacity: '0',
    transform: 'translate(-50%, -50%)',
    transition: 'opacity 0.3s ease, width 0.2s ease, height 0.2s ease',
    mixBlendMode: 'difference',
  });
  document.body.appendChild(dot);

  let mx = 0, my = 0, cx = 0, cy = 0, visible = false;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (!visible) { dot.style.opacity = '0.7'; visible = true; } });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; visible = false; });

  qsa('a, button, .card, .pill, .tag, .top-skill-card, .goal-card, .contact-card').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.style.width = dot.style.height = '12px'; dot.style.opacity = '0.45'; });
    el.addEventListener('mouseleave', () => { dot.style.width = dot.style.height = '6px'; dot.style.opacity = '0.7'; });
  });

  const tick = () => {
    cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
    dot.style.left = `${cx}px`; dot.style.top = `${cy}px`;
    requestAnimationFrame(tick);
  };
  tick();
}


/* ─────────────────────────────────────
   INIT
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initSideNav();
  initActiveNavLink();
  initScrollReveal();
  initStagger();
  initSmoothScroll();
  initCounters();
  initPhotoParallax();
  initCursorDot();
});
