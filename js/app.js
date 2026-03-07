document.addEventListener('DOMContentLoaded', () => {
  // Setup the intersection observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Stop observing once revealed
      }
    });
  }, observerOptions);

  // Apply observer to all base reveal elements
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => scrollObserver.observe(el));

  // Handle staggered animations inside grids
  const staggeredGrids = document.querySelectorAll('.stagger-grid');
  staggeredGrids.forEach(grid => {
    const items = grid.querySelectorAll('.reveal');
    items.forEach((item, index) => {
      // Add a slight delay based on the item's position in the grid
      item.style.transitionDelay = `${index * 0.15}s`;
    });
  });
});
