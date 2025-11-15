/**
 * Animations System
 * - Scroll animations (fade in, slide up)
 * - Hover effects
 * - Loading states
 * - Counter animations
 * - Respects prefers-reduced-motion
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        scrollThreshold: 0.1, // 10% of element visible
        animationDelay: 100, // Base delay between elements
        maxDelay: 400, // Max delay for staggered animations
        counterDuration: 2000, // Counter animation duration
        counterEasing: 'easeOutCubic'
    };

    // State
    const state = {
        prefersReducedMotion: false,
        observer: null,
        animatedElements: new Set(),
        counters: []
    };

    // =========================
    // Reduced Motion Detection
    // =========================

    /**
     * Check if user prefers reduced motion
     * @returns {boolean} True if reduced motion is preferred
     */
    function checkReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        state.prefersReducedMotion = mediaQuery.matches;

        // Listen for changes
        mediaQuery.addEventListener('change', (e) => {
            state.prefersReducedMotion = e.matches;
            console.log('[Animations] Reduced motion:', e.matches);
        });

        return state.prefersReducedMotion;
    }

    // =========================
    // Scroll Animations
    // =========================

    /**
     * Initialize scroll animations
     */
    function initScrollAnimations() {
        if (state.prefersReducedMotion) {
            // Skip animations if reduced motion is preferred
            console.log('[Animations] Reduced motion enabled - skipping scroll animations');
            return;
        }

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: CONFIG.scrollThreshold
        };

        state.observer = new IntersectionObserver(handleIntersection, options);

        // Observe all elements with animation classes
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach(el => {
            state.observer.observe(el);
        });

        console.log('[Animations] Scroll animations initialized for', elements.length, 'elements');
    }

    /**
     * Handle intersection observer callback
     * @param {IntersectionObserverEntry[]} entries - Observed entries
     */
    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !state.animatedElements.has(entry.target)) {
                animateElement(entry.target);
                state.animatedElements.add(entry.target);

                // Unobserve after animating (one-time animation)
                if (entry.target.dataset.animateOnce !== 'false') {
                    state.observer.unobserve(entry.target);
                }
            }
        });
    }

    /**
     * Animate an element
     * @param {HTMLElement} element - Element to animate
     */
    function animateElement(element) {
        const animationType = element.dataset.animate || 'fade-in';
        const delay = element.dataset.animateDelay || 0;

        setTimeout(() => {
            element.classList.add('animate-in');
            element.classList.add(`animate-${animationType}`);
        }, delay);
    }

    // =========================
    // Counter Animations
    // =========================

    /**
     * Initialize counter animations
     */
    function initCounters() {
        if (state.prefersReducedMotion) {
            // Show final values immediately
            document.querySelectorAll('[data-counter]').forEach(el => {
                el.textContent = el.dataset.counterEnd || el.textContent;
            });
            return;
        }

        const counters = document.querySelectorAll('[data-counter]');

        counters.forEach(counter => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !counter.dataset.counterAnimated) {
                        animateCounter(counter);
                        counter.dataset.counterAnimated = 'true';
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(counter);
        });

        console.log('[Animations] Counter animations initialized for', counters.length, 'elements');
    }

    /**
     * Animate a counter
     * @param {HTMLElement} counter - Counter element
     */
    function animateCounter(counter) {
        const end = parseFloat(counter.dataset.counterEnd || counter.textContent);
        const start = parseFloat(counter.dataset.counterStart || 0);
        const duration = parseFloat(counter.dataset.counterDuration || CONFIG.counterDuration);
        const decimals = (counter.dataset.counterDecimals !== undefined)
            ? parseInt(counter.dataset.counterDecimals)
            : (end % 1 === 0 ? 0 : 1);
        const prefix = counter.dataset.counterPrefix || '';
        const suffix = counter.dataset.counterSuffix || '';

        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easedProgress = easeOutCubic(progress);

            // Calculate current value
            const current = start + (end - start) * easedProgress;

            // Update display
            counter.textContent = prefix + current.toFixed(decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = prefix + end.toFixed(decimals) + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    /**
     * Easing function - ease out cubic
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // =========================
    // Staggered Animations
    // =========================

    /**
     * Apply staggered animation delays
     */
    function applyStaggeredDelays() {
        const groups = document.querySelectorAll('[data-animate-stagger]');

        groups.forEach(group => {
            const children = group.querySelectorAll('[data-animate]');
            const baseDelay = parseInt(group.dataset.animateStagger) || CONFIG.animationDelay;

            children.forEach((child, index) => {
                const delay = Math.min(index * baseDelay, CONFIG.maxDelay);
                child.dataset.animateDelay = delay;
            });
        });
    }

    // =========================
    // Loading States
    // =========================

    /**
     * Show loading state
     * @param {HTMLElement} element - Element to show loading state
     * @param {string} message - Loading message
     */
    function showLoading(element, message = 'Loading...') {
        if (!element) return;

        element.classList.add('loading');
        element.setAttribute('aria-busy', 'true');

        if (message && !element.querySelector('.loading-message')) {
            const loadingEl = document.createElement('div');
            loadingEl.className = 'loading-message';
            loadingEl.textContent = message;
            loadingEl.setAttribute('role', 'status');
            loadingEl.setAttribute('aria-live', 'polite');
            element.appendChild(loadingEl);
        }
    }

    /**
     * Hide loading state
     * @param {HTMLElement} element - Element to hide loading state
     */
    function hideLoading(element) {
        if (!element) return;

        element.classList.remove('loading');
        element.removeAttribute('aria-busy');

        const loadingEl = element.querySelector('.loading-message');
        if (loadingEl) {
            loadingEl.remove();
        }
    }

    // =========================
    // Skeleton Screens
    // =========================

    /**
     * Show skeleton loading
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Skeleton options
     */
    function showSkeleton(container, options = {}) {
        if (!container) return;

        const {
            rows = 3,
            height = '1rem',
            animated = true
        } = options;

        container.classList.add('skeleton-container');
        container.innerHTML = '';

        for (let i = 0; i < rows; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton-line ${animated ? 'skeleton-animated' : ''}`;
            skeleton.style.height = height;
            skeleton.style.width = i === rows - 1 ? '80%' : '100%';
            container.appendChild(skeleton);
        }
    }

    /**
     * Hide skeleton loading
     * @param {HTMLElement} container - Container element
     * @param {string} content - Content to show
     */
    function hideSkeleton(container, content) {
        if (!container) return;

        container.classList.remove('skeleton-container');

        if (content) {
            container.innerHTML = content;
        }
    }

    // =========================
    // Progress Indicators
    // =========================

    /**
     * Update progress bar
     * @param {HTMLElement} progressBar - Progress bar element
     * @param {number} progress - Progress (0-100)
     * @param {boolean} animated - Animate the transition
     */
    function updateProgress(progressBar, progress, animated = true) {
        if (!progressBar) return;

        const fill = progressBar.querySelector('.progress-fill') || progressBar;
        const clamped = Math.max(0, Math.min(100, progress));

        if (animated && !state.prefersReducedMotion) {
            fill.style.transition = 'width 0.3s ease';
        } else {
            fill.style.transition = 'none';
        }

        fill.style.width = `${clamped}%`;
        fill.setAttribute('aria-valuenow', clamped);

        // Update percentage text if present
        const percentText = progressBar.querySelector('.progress-percent');
        if (percentText) {
            percentText.textContent = `${Math.round(clamped)}%`;
        }
    }

    // =========================
    // Hover Effects
    // =========================

    /**
     * Initialize enhanced hover effects
     */
    function initHoverEffects() {
        if (state.prefersReducedMotion) {
            return;
        }

        // Add hover lift effect to cards
        const cards = document.querySelectorAll('[data-hover="lift"]');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });

        // Add hover glow effect
        const glowElements = document.querySelectorAll('[data-hover="glow"]');
        glowElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.classList.add('glow-active');
            });

            el.addEventListener('mouseleave', () => {
                el.classList.remove('glow-active');
            });
        });

        console.log('[Animations] Hover effects initialized');
    }

    // =========================
    // Page Transitions
    // =========================

    /**
     * Fade out page before navigation
     * @param {string} url - URL to navigate to
     */
    function navigateWithTransition(url) {
        if (state.prefersReducedMotion) {
            window.location.href = url;
            return;
        }

        document.body.classList.add('page-transition-out');

        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    // =========================
    // Utility Functions
    // =========================

    /**
     * Add animation class to element
     * @param {HTMLElement} element - Element
     * @param {string} animationClass - Animation class name
     * @param {Function} callback - Callback after animation
     */
    function addAnimation(element, animationClass, callback) {
        if (!element) return;

        if (state.prefersReducedMotion) {
            if (callback) callback();
            return;
        }

        element.classList.add(animationClass);

        const handleAnimationEnd = () => {
            element.removeEventListener('animationend', handleAnimationEnd);
            if (callback) callback();
        };

        element.addEventListener('animationend', handleAnimationEnd);
    }

    /**
     * Remove animation class from element
     * @param {HTMLElement} element - Element
     * @param {string} animationClass - Animation class name
     */
    function removeAnimation(element, animationClass) {
        if (element) {
            element.classList.remove(animationClass);
        }
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize animations system
     */
    function init() {
        console.log('✨ Animations System Initialized');

        // Check reduced motion preference
        checkReducedMotion();

        if (state.prefersReducedMotion) {
            console.log('[Animations] Reduced motion enabled - animations disabled');
            document.body.classList.add('reduce-motion');
        }

        // Apply staggered delays
        applyStaggeredDelays();

        // Initialize scroll animations
        initScrollAnimations();

        // Initialize counters
        initCounters();

        // Initialize hover effects
        initHoverEffects();

        // Page transition in
        if (!state.prefersReducedMotion) {
            document.body.classList.add('page-transition-in');
            setTimeout(() => {
                document.body.classList.remove('page-transition-in');
            }, 300);
        }
    }

    // =========================
    // Public API
    // =========================
    window.Animations = {
        init,
        showLoading,
        hideLoading,
        showSkeleton,
        hideSkeleton,
        updateProgress,
        animateCounter,
        addAnimation,
        removeAnimation,
        navigateWithTransition,
        checkReducedMotion: () => state.prefersReducedMotion
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
