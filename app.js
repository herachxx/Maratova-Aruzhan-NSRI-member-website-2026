'use strict';

const $ = id => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];

/* progress bar */
function initProgress() {
  const bar = $('prog');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* side nav */
function initNav() {
  const btn   = $('nav-btn');
  const nav   = $('sidenav');
  const wrap  = $('wrap');
  const close = $('sn-close');
  if (!btn || !nav) return;

  const isWide = () => window.innerWidth >= 900;
  let open = false;

  function openNav() {
    open = true;
    nav.classList.add('is-open');
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    if (isWide()) wrap?.classList.add('is-pushed');
  }
  function closeNav() {
    open = false;
    nav.classList.remove('is-open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    wrap?.classList.remove('is-pushed');
  }

  // auto-open on desktop
  if (isWide()) openNav();

  btn.addEventListener('click', () => open ? closeNav() : openNav());
  close?.addEventListener('click', closeNav);

  // close on link click (mobile)
  $$('.sn-nav a').forEach(a => a.addEventListener('click', () => {
    if (!isWide()) closeNav();
  }));

  // escape / outside click
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeNav(); });
  document.addEventListener('click', e => {
    if (!isWide() && open && !nav.contains(e.target) && !btn.contains(e.target)) closeNav();
  });

  window.addEventListener('resize', () => {
    if (open && isWide()) wrap?.classList.add('is-pushed');
    else if (!isWide()) wrap?.classList.remove('is-pushed');
  }, { passive: true });
}

/* active nav link highlight */
function initActiveLink() {
  const links = $$('.sn-nav a[href^="#"]');
  if (!links.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const match = links.find(l => l.getAttribute('href') === '#' + e.target.id);
        if (match) match.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  $$('section[id]').forEach(s => obs.observe(s));
}

/* scroll reveal */
function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -32px 0px' });
  items.forEach(el => obs.observe(el));
}

/* stagger delays */
function initStagger() {
  [
    '.skill-cards .skill-card',
    '.ach-grid .ach-card',
    '.cert-strip .cert-card',
    '.nsri-stats .ns',
    '.goals .goal',
    '.contacts .ccard',
    '.hobbies .hobby',
    '.masonry .gitem',
  ].forEach(sel => {
    $$(sel).forEach((el, i) => { el.style.transitionDelay = (i * 0.06) + 's'; });
  });
}

/* smooth scroll */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 18, behavior: 'smooth' });
    });
  });
}

/* counter animation */
function countUp(el) {
  const raw = el.textContent.trim();
  const val = parseFloat(raw.replace(/[^0-9.]/g, ''));
  if (isNaN(val)) return;
  const dur = 1100;
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const cur = Math.round(ease * val);
    // reconstruct original format
    let out = '';
    if (raw.startsWith('$')) out += '$';
    if (raw.includes(',')) out += cur.toLocaleString();
    else out += cur;
    if (raw.includes('+')) out += '+';
    if (raw.includes('K')) out += 'K';
    el.textContent = out;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = raw; // restore exact original
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const els = $$('.stat-n, .ns-n');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  els.forEach(el => obs.observe(el));
}

/* portrait parallax (desktop only) */
function initParallax() {
  const el = $('portrait');
  if (!el || window.innerWidth < 900) return;
  let raf = false;
  document.addEventListener('mousemove', e => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      const rx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ry = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.transform = `perspective(800px) rotateY(${rx * 2.8}deg) rotateX(${-ry * 1.9}deg)`;
      raf = false;
    });
  });
  document.addEventListener('mouseleave', () => {
    el.style.transition = 'transform .5s ease';
    el.style.transform = '';
    setTimeout(() => { el.style.transition = ''; }, 520);
  });
}

/* gallery lightbox */
function initLightbox() {
  const lb    = $('lb');
  const panel = $('lb-content');
  const close = $('lb-close');
  if (!lb) return;

  function open(src, isVideo) {
    panel.innerHTML = '';
    const el = document.createElement(isVideo ? 'video' : 'img');
    el.src = src;
    if (isVideo) { el.controls = true; el.autoplay = true; }
    el.alt = '';
    panel.appendChild(el);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function shut() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    const v = panel.querySelector('video');
    if (v) v.pause();
    setTimeout(() => { panel.innerHTML = ''; }, 280);
  }

  $$('.gitem').forEach(item => {
    item.addEventListener('click', () => {
      const vs = item.querySelector('video source');
      const img = item.querySelector('img');
      if (vs) open(vs.src, true);
      else if (img) open(img.src, false);
    });
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') item.click(); });
  });

  close?.addEventListener('click', shut);
  lb.addEventListener('click', e => { if (e.target === lb) shut(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) shut(); });
}

/* lazy-load videos */
function initVideoLazy() {
  const vids = $$('video[preload="none"]');
  if (!vids.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.load(); obs.unobserve(e.target); } });
  }, { rootMargin: '250px' });
  vids.forEach(v => obs.observe(v));
}

/* boot */
document.addEventListener('DOMContentLoaded', () => {
  initProgress();
  initNav();
  initActiveLink();
  initReveal();
  initStagger();
  initSmoothScroll();
  initCounters();
  initParallax();
  initLightbox();
  initVideoLazy();
});
