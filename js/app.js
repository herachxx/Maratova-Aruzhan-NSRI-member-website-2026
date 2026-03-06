// Utility Functions
/**
 * DEBOUNCE FUNCTION TO LIMIT THE RATE AT WHICH A FUNCTION CAN FIRE
 * @param {Function} func - THE FUNCTION TO DEBOOUNCE
 * @param {number} wait - THE NUM OF MILLISECONDS TO DELAY
 * @returns {Function} - THE DEBOUNCED FUNCTION
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * CHECK IF AN ELEMENT IS IN VIEWPORT
 * @param {HTMLElement} element - THE ELEMENT TO CHECK
 * @returns {boolean} WHETHER THE ELEMENT IS IN VIEWPORT
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// LOADING SCREEN
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    
    // FADE OUT LOADING SCREEN AFTER PAGE LOADS
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        // REMOVE FROM DOM AFTER ANIMATION COMPLETES
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 300);
});


// NAVIGATION
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
let lastScrollTop = 0;
let scrollThreshold = 10;

/**
 * HANDLE SCROLL EVENTS FOR NAVBAR HIDE/SHOW AND ELEVATION
 */
const handleNavbarScroll = debounce(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // ADD ELEVATION SHADOW WHEN SCROLLED
    if (scrollTop > 50) {
        navbar.classList.add('elevated');
    } else {
        navbar.classList.remove('elevated');
    }
    
    // HIDE/SHOW NAVBAR BASED ON SCROLL DIRECTION
    if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // SCROLLING DOWN & PAST THRESHOLD
            navbar.classList.add('hidden');
        } else {
            // SCROLLING UP
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop;
    }
}, 10);

window.addEventListener('scroll', handleNavbarScroll);

/**
 * TOGGLE MOBILE NAVIGATION MENU
 */
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // PREVENT BODY SCROLL WHEN MENU IS OPEN
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

/**
 * HANDLE SMOOTH SCROLLING FOR NAV LINKS
 */
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            // CLOSE MOBILE MENU IF OPEN
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            // SMOOTH SCROLL TO SECTION
            const navHeight = navbar.offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // UPDATE ACTIVE LINK
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

/**
 * UPDATE ACTIVE NAV LINK BASED ON SCROLL POSITION
 */
const updateActiveNavLink = debounce(() => {
    const sections = document.querySelectorAll('section[id]');
    const navHeight = navbar.offsetHeight;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionHeight = section.offsetHeight;
        const scrollPosition = window.scrollY;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}, 100);

window.addEventListener('scroll', updateActiveNavLink);

// STATISTICS COUNTER ANIMATION
const statCards = document.querySelectorAll('[data-stat]');
let statsAnimated = false;

/**
 * ANIMATE STATISTICS NUMBERS COUNTING UP
 * @param {HTMLElement} element - THE STAT NUM ELEM
 * @param {number} target - THE TAR NUM
 * @param {number} duration - ANIMATION DURATION IN MILLISECONDS
 */
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // FORMAT NUM WITH COMMAS
        const formatted = Math.floor(current).toLocaleString();
        element.textContent = formatted + (target >= 1000 ? '+' : '');
    }, 16);
}

/**
 * CHECK IF STATS ARE IN VIEWPORT AND ANIMATE THEM
 */
const handleStatsAnimation = debounce(() => {
    if (statsAnimated) return;
    
    statCards.forEach(card => {
        if (isInViewport(card)) {
            const numberElement = card.querySelector('.stat-number');
            const target = parseInt(numberElement.getAttribute('data-target'));
            
            animateCounter(numberElement, target);
            statsAnimated = true;
        }
    });
}, 100);

window.addEventListener('scroll', handleStatsAnimation);

// TRIGGER ON PAGE LOAD IF STATS ARE ALR IN VIEWPORT
document.addEventListener('DOMContentLoaded', handleStatsAnimation);

// SCROLL TO TOP BUTTON

const scrollTopBtn = document.getElementById('scrollTopBtn');

/**
 * SHOW/HIDE SCROLL TO TOP BUTTON BASED ON SCROLL POSITION
 */
const handleScrollTopButton = debounce(() => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}, 100);

window.addEventListener('scroll', handleScrollTopButton);

/**
 * SCROLL TO TOP WHEN BUTTON IS CLICKED
 */
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// INTERSECTION OBSERVER FOR ANIMATIONS

/**
 * CREATE INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// OBSERVE ELEMENTS FOR FADE-IN ANIMATION
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.benefit-card, .achievement-item');
    fadeElements.forEach(el => fadeInObserver.observe(el));
});

// CARD HOVER EFFECTS
/**
 * ADD 3D TILT EFFECT TO CARDS ON HOVER
 */
const cards = document.querySelectorAll('.stat-card, .benefit-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// PERFORMANCE OPTIMIZATION
/**
 * LAZY LOAD IMGs
 */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// KEYBOARD NAVIGATION
/**
 * ENABLE KEYBOARD NAV
 */
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // SCROLL TO TOP: Ctrl/Cmd + Home
    if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// External Link Security EXTERNAL LINK SECURITY
/**
 * ADD SECURITY ATTRIBUTES TO EXTERNAL LINKS
 */
document.addEventListener('DOMContentLoaded', () => {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    
    externalLinks.forEach(link => {
        // SKIP IF IT'S AN INTERNAL LINK
        if (link.hostname === window.location.hostname) return;
        
        // ADD SECURITY ATTRIBUTES
        link.setAttribute('rel', 'noopener noreferrer');
        link.setAttribute('target', '_blank');
    });
});

// CONSOLE MESSAGE
console.log('%c👋 Welcome to NSRI!', 'font-size: 24px; font-weight: bold; color: #2563eb;');
console.log('%cInterested in the code? Check out the documentation!', 'font-size: 14px; color: #6b7280;');
console.log('%c🌐 Visit: https://www.nsri-institute.org', 'font-size: 12px; color: #10b981;');

// ERROR HANDLING
/**
 * GLOBAL ERROR HANDLER
 */
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
    // IN PRODUCTION, YOU MIGHT WANT TO SEND THIS TO AN ERR0R TRACKING SERVICE
});

/**
 * HANDLE UNHANDLED PROMISE REJECTIONS
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // IN PRODUCTION, YOU MIGHT WANT TO SEND THIS TO AN ERR0R TRACKING SERVICE
});

// EXPORT FUNCTIONS FOR TESTING - IF NEEDED
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        isInViewport,
        animateCounter
    };
}
