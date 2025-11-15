/**
 * Scroll Progress Indicator
 * - Shows reading progress as a bar at the top of the page
 * - Automatically calculates page height
 * - Smooth animations with performance optimization
 * - Respects reduced motion preferences
 * - Auto-hides on short pages
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        minPageHeight: 1500, // Minimum page height to show progress (pixels)
        throttleDelay: 16, // ~60fps
        barHeight: 3, // Progress bar height in pixels
        zIndex: 10000, // Ensure it's above everything
        colors: {
            primary: '#00e5ff',
            secondary: '#00c1de'
        }
    };

    // State
    const state = {
        progressBar: null,
        lastScrollY: 0,
        ticking: false,
        isEnabled: false,
        prefersReducedMotion: false
    };

    // =========================
    // Progress Bar Creation
    // =========================

    /**
     * Create and inject progress bar element
     */
    function createProgressBar() {
        // Check if already exists
        if (document.getElementById('scroll-progress-bar')) {
            return document.getElementById('scroll-progress-bar');
        }

        // Create container
        const container = document.createElement('div');
        container.id = 'scroll-progress-container';
        container.setAttribute('role', 'progressbar');
        container.setAttribute('aria-label', 'Reading progress');
        container.setAttribute('aria-valuemin', '0');
        container.setAttribute('aria-valuemax', '100');
        container.setAttribute('aria-valuenow', '0');

        // Create progress bar
        const bar = document.createElement('div');
        bar.id = 'scroll-progress-bar';

        // Apply styles
        applyStyles(container, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: `${CONFIG.barHeight}px`,
            backgroundColor: 'transparent',
            zIndex: CONFIG.zIndex.toString(),
            pointerEvents: 'none',
            opacity: '0',
            transition: state.prefersReducedMotion ? 'none' : 'opacity 0.3s ease'
        });

        applyStyles(bar, {
            height: '100%',
            width: '0%',
            background: `linear-gradient(90deg, ${CONFIG.colors.primary}, ${CONFIG.colors.secondary})`,
            transformOrigin: 'left',
            transition: state.prefersReducedMotion ? 'none' : 'width 0.1s ease-out',
            boxShadow: `0 0 10px ${CONFIG.colors.primary}`
        });

        container.appendChild(bar);
        document.body.insertBefore(container, document.body.firstChild);

        return bar;
    }

    /**
     * Apply styles to element
     * @param {HTMLElement} element - Element to style
     * @param {Object} styles - Style properties
     */
    function applyStyles(element, styles) {
        Object.keys(styles).forEach(property => {
            element.style[property] = styles[property];
        });
    }

    // =========================
    // Progress Calculation
    // =========================

    /**
     * Calculate scroll progress percentage
     * @returns {number} Progress percentage (0-100)
     */
    function calculateProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Total scrollable height
        const scrollableHeight = documentHeight - windowHeight;

        // Prevent division by zero
        if (scrollableHeight <= 0) {
            return 0;
        }

        // Calculate percentage
        const progress = (scrollTop / scrollableHeight) * 100;

        // Clamp between 0 and 100
        return Math.min(100, Math.max(0, progress));
    }

    /**
     * Check if page is long enough to show progress
     * @returns {boolean} True if page should show progress
     */
    function shouldShowProgress() {
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollableHeight = documentHeight - windowHeight;

        return scrollableHeight >= CONFIG.minPageHeight;
    }

    // =========================
    // Progress Update
    // =========================

    /**
     * Update progress bar width
     */
    function updateProgress() {
        if (!state.isEnabled || !state.progressBar) {
            return;
        }

        const progress = calculateProgress();
        const container = state.progressBar.parentElement;

        // Update bar width
        state.progressBar.style.width = `${progress}%`;

        // Update ARIA value
        container.setAttribute('aria-valuenow', Math.round(progress).toString());

        // Show/hide based on scroll position
        if (progress > 0) {
            container.style.opacity = '1';
        } else {
            container.style.opacity = '0';
        }

        state.ticking = false;
    }

    /**
     * Request progress update (throttled)
     */
    function requestProgressUpdate() {
        if (!state.ticking) {
            window.requestAnimationFrame(updateProgress);
            state.ticking = true;
        }
    }

    // =========================
    // Event Handlers
    // =========================

    /**
     * Handle scroll events
     */
    function handleScroll() {
        state.lastScrollY = window.pageYOffset;
        requestProgressUpdate();
    }

    /**
     * Handle resize events
     */
    function handleResize() {
        // Re-check if progress should be shown
        const shouldShow = shouldShowProgress();

        if (shouldShow !== state.isEnabled) {
            state.isEnabled = shouldShow;

            if (state.isEnabled) {
                enable();
            } else {
                disable();
            }
        }

        requestProgressUpdate();
    }

    /**
     * Handle reduced motion preference changes
     */
    function handleReducedMotionChange(e) {
        state.prefersReducedMotion = e.matches;

        if (state.progressBar) {
            const container = state.progressBar.parentElement;

            if (state.prefersReducedMotion) {
                container.style.transition = 'none';
                state.progressBar.style.transition = 'none';
            } else {
                container.style.transition = 'opacity 0.3s ease';
                state.progressBar.style.transition = 'width 0.1s ease-out';
            }
        }
    }

    // =========================
    // Enable/Disable
    // =========================

    /**
     * Enable progress indicator
     */
    function enable() {
        if (!state.progressBar) {
            state.progressBar = createProgressBar();
        }

        state.isEnabled = true;
        updateProgress();

        console.log('[Scroll Progress] Enabled');
    }

    /**
     * Disable progress indicator
     */
    function disable() {
        if (state.progressBar && state.progressBar.parentElement) {
            state.progressBar.parentElement.style.opacity = '0';
        }

        state.isEnabled = false;

        console.log('[Scroll Progress] Disabled (page too short)');
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize scroll progress indicator
     */
    function init() {
        console.log('📊 Scroll Progress Indicator Initialized');

        // Check reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        state.prefersReducedMotion = mediaQuery.matches;
        mediaQuery.addEventListener('change', handleReducedMotionChange);

        // Check if page is long enough
        state.isEnabled = shouldShowProgress();

        if (state.isEnabled) {
            // Create progress bar
            state.progressBar = createProgressBar();

            // Initial update
            updateProgress();
        }

        // Event listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        // Update on dynamic content changes
        if (window.MutationObserver) {
            const observer = new MutationObserver(() => {
                handleResize();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        console.log(`[Scroll Progress] Status: ${state.isEnabled ? 'Enabled' : 'Disabled (page too short)'}`);
    }

    // =========================
    // Public API
    // =========================
    window.ScrollProgress = {
        init,
        enable,
        disable,
        update: requestProgressUpdate,
        calculateProgress
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
