/**
 * Scroll to Top Button
 * - Shows after scrolling down
 * - Smooth scroll to top
 * - Accessible (keyboard + screen reader)
 * - Respects reduced motion
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        showAfter: 300, // Show button after scrolling 300px
        scrollDuration: 500, // Smooth scroll duration in ms
        buttonSize: 48, // Button size in pixels
        bottomOffset: 24, // Distance from bottom
        rightOffset: 24 // Distance from right
    };

    // State
    const state = {
        button: null,
        isVisible: false,
        isScrolling: false,
        prefersReducedMotion: false
    };

    // =========================
    // Button Creation
    // =========================

    /**
     * Create the scroll to top button
     */
    function createButton() {
        const button = document.createElement('button');
        button.id = 'scroll-to-top';
        button.className = 'scroll-to-top-btn';
        button.setAttribute('aria-label', 'Scroll to top');
        button.setAttribute('title', 'Back to top');
        button.setAttribute('type', 'button');
        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `;

        // Initially hidden
        button.style.display = 'none';
        button.style.opacity = '0';

        document.body.appendChild(button);
        state.button = button;

        console.log('[ScrollToTop] Button created');
    }

    // =========================
    // Scroll Handling
    // =========================

    /**
     * Handle scroll events
     */
    function handleScroll() {
        if (state.isScrolling) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldShow = scrollTop > CONFIG.showAfter;

        if (shouldShow !== state.isVisible) {
            state.isVisible = shouldShow;
            toggleButton(shouldShow);
        }
    }

    /**
     * Toggle button visibility
     * @param {boolean} show - Whether to show the button
     */
    function toggleButton(show) {
        if (!state.button) return;

        if (show) {
            state.button.style.display = 'flex';
            // Force reflow
            state.button.offsetHeight;

            if (state.prefersReducedMotion) {
                state.button.style.opacity = '1';
            } else {
                requestAnimationFrame(() => {
                    state.button.style.opacity = '1';
                    state.button.style.transform = 'translateY(0)';
                });
            }
        } else {
            if (state.prefersReducedMotion) {
                state.button.style.opacity = '0';
                state.button.style.display = 'none';
            } else {
                state.button.style.opacity = '0';
                state.button.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    state.button.style.display = 'none';
                }, 300);
            }
        }
    }

    // =========================
    // Scroll to Top
    // =========================

    /**
     * Scroll to top of page
     */
    function scrollToTop() {
        if (state.isScrolling) return;

        state.isScrolling = true;

        // Check for reduced motion
        if (state.prefersReducedMotion) {
            window.scrollTo(0, 0);
            state.isScrolling = false;
            return;
        }

        // Smooth scroll
        const startPosition = window.pageYOffset;
        const startTime = performance.now();

        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / CONFIG.scrollDuration, 1);

            // Easing function - ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            window.scrollTo(0, startPosition * (1 - eased));

            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                state.isScrolling = false;
            }
        }

        requestAnimationFrame(animation);

        // Toast notification
        if (window.Toast) {
            window.Toast.info('Scrolled to top');
        }
    }

    // =========================
    // Event Handlers
    // =========================

    /**
     * Initialize event handlers
     */
    function initEventHandlers() {
        // Scroll event with throttling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(handleScroll, 100);
        }, { passive: true });

        // Button click
        if (state.button) {
            state.button.addEventListener('click', scrollToTop);

            // Keyboard support
            state.button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToTop();
                }
            });
        }

        // Reduced motion detection
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        state.prefersReducedMotion = mediaQuery.matches;

        mediaQuery.addEventListener('change', (e) => {
            state.prefersReducedMotion = e.matches;
        });
    }

    // =========================
    // Keyboard Shortcuts
    // =========================

    /**
     * Initialize keyboard shortcuts
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Home key - scroll to top
            if (e.key === 'Home' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                const activeElement = document.activeElement;
                const isInput = activeElement.tagName === 'INPUT' ||
                               activeElement.tagName === 'TEXTAREA' ||
                               activeElement.isContentEditable;

                // Don't interfere with input fields
                if (!isInput) {
                    e.preventDefault();
                    scrollToTop();
                }
            }
        });
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize scroll to top functionality
     */
    function init() {
        console.log('⬆️ Scroll to Top Initialized');

        // Create button
        createButton();

        // Initialize event handlers
        initEventHandlers();

        // Initialize keyboard shortcuts
        initKeyboardShortcuts();

        // Check initial scroll position
        handleScroll();
    }

    // =========================
    // Public API
    // =========================
    window.ScrollToTop = {
        init,
        scrollToTop,
        show: () => toggleButton(true),
        hide: () => toggleButton(false)
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
