// Scroll-triggered fade-up animations
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll(
    '.section, .stats-band, .benefit-card, .cta-section, footer'
  );

  // Add fade-up class to animatable elements
  targets.forEach(el => el.classList.add('fade-up'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger cards within a grid
        const delay = entry.target.closest('.benefits-grid')
          ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
          : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => io.observe(el));

  // Stat counter animation
  const counters = document.querySelectorAll('.stat-num');

  const parseNum = (el) => {
    const raw = el.textContent.replace(/[^0-9,]/g, '').replace(',', '');
    return parseInt(raw, 10);
  };

  const formatNum = (n) => n >= 1000 ? n.toLocaleString() : String(n);

  const animateCounter = (el, target, suffix) => {
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.innerHTML = formatNum(current) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const band = entry.target;
        band.querySelectorAll('.stat').forEach(stat => {
          const numEl = stat.querySelector('.stat-num');
          const target = parseNum(numEl);
          const suffix = `<span class="stat-plus">+</span>`;
          animateCounter(numEl, target, suffix);
        });
        statObserver.unobserve(band);
      }
    });
  }, { threshold: 0.4 });

  const statsBand = document.querySelector('.stats-band');
  if (statsBand) statObserver.observe(statsBand);
});
