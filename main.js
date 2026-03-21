'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* SCROLL FADE-UP */
  const fadeEls = document.querySelectorAll(
    '.section, .stats-band, .benefit-card, .cta-section, footer'
  );

  if ('IntersectionObserver' in window) {
    fadeEls.forEach(el => el.classList.add('fade-up'));

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // stagger benefit cards by their index
        const siblings = el.parentElement
          ? Array.from(el.parentElement.children)
          : [];
        const idx = siblings.indexOf(el);
        const delay = el.classList.contains('benefit-card') ? idx * 90 : 0;
        setTimeout(() => el.classList.add('visible'), delay);
        fadeObserver.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => fadeObserver.observe(el));
  } else {
    // Fallback: show everything immediately
    fadeEls.forEach(el => el.classList.add('visible'));
  }


  /* STAT COUNTER ANIMATION */
  const formatNum = n => n >= 1000 ? n.toLocaleString('en-US') : String(n);

  const animateStat = (el) => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const suffix = '<span class="stat-plus">+</span>';
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.innerHTML = formatNum(Math.round(eased * target)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const statsBand = document.querySelector('.stats-band');
    if (statsBand) {
      const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll('.stat-num[data-target]').forEach(animateStat);
          statObserver.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      statObserver.observe(statsBand);
    }
  }

});
