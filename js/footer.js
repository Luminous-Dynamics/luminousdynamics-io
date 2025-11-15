/**
 * Enhanced Footer Functionality
 * - Newsletter signup with validation
 * - Live status indicator
 * - Social media links
 * - Theme selector integration
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        newsletter: {
            apiEndpoint: '/api/newsletter/subscribe', // Would be configured for production
            validationDelay: 500
        },
        status: {
            apiEndpoint: 'https://api.luminousdynamics.io/v1/status',
            updateInterval: 60000, // Check every 60 seconds
            fallbackStatus: 'operational'
        }
    };

    // State
    const state = {
        statusUpdateTimer: null,
        lastStatusCheck: null
    };

    // =========================
    // Newsletter Signup
    // =========================

    /**
     * Initialize newsletter signup form
     */
    function initNewsletterSignup() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        const emailInput = form.querySelector('#newsletter-email');
        const submitButton = form.querySelector('[type="submit"]');

        // Email validation
        emailInput.addEventListener('input', () => {
            validateEmail(emailInput);
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateEmail(emailInput)) {
                return;
            }

            await handleNewsletterSubmit(emailInput.value, submitButton);
        });

        console.log('[Footer] Newsletter signup initialized');
    }

    /**
     * Validate email input
     * @param {HTMLInputElement} input - Email input element
     * @returns {boolean} True if valid
     */
    function validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Clear previous errors
        input.setCustomValidity('');
        input.classList.remove('invalid');

        if (!email) {
            input.setCustomValidity('Email is required');
            input.classList.add('invalid');
            return false;
        }

        if (!emailRegex.test(email)) {
            input.setCustomValidity('Please enter a valid email address');
            input.classList.add('invalid');
            return false;
        }

        input.classList.add('valid');
        return true;
    }

    /**
     * Handle newsletter form submission
     * @param {string} email - Email address
     * @param {HTMLButtonElement} button - Submit button
     */
    async function handleNewsletterSubmit(email, button) {
        // Disable form
        button.disabled = true;
        button.textContent = 'Subscribing...';

        try {
            // In production, this would make a real API call
            // For now, simulate a successful subscription
            await simulateAPICall();

            // Show success message
            if (window.Toast) {
                window.Toast.success('Successfully subscribed! Check your email for confirmation.');
            }

            // Reset form
            const form = document.getElementById('newsletter-form');
            form.reset();
            form.querySelector('#newsletter-email').classList.remove('valid');

            // Track event
            if (window.Analytics) {
                window.Analytics.track('newsletter_subscribe', { email });
            }

            console.log('[Footer] Newsletter subscription successful:', email);

        } catch (error) {
            console.error('[Footer] Newsletter subscription failed:', error);

            if (window.Toast) {
                window.Toast.error('Subscription failed. Please try again later.');
            }
        } finally {
            button.disabled = false;
            button.textContent = 'Subscribe';
        }
    }

    /**
     * Simulate API call (for demo purposes)
     * @returns {Promise<void>}
     */
    function simulateAPICall() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    // =========================
    // Live Status Indicator
    // =========================

    /**
     * Initialize live status indicator
     */
    function initStatusIndicator() {
        const statusElement = document.getElementById('footer-status');
        if (!statusElement) return;

        // Initial status check
        updateStatus();

        // Periodic status checks
        state.statusUpdateTimer = setInterval(() => {
            updateStatus();
        }, CONFIG.status.updateInterval);

        console.log('[Footer] Status indicator initialized');
    }

    /**
     * Update status indicator
     */
    async function updateStatus() {
        const statusElement = document.getElementById('footer-status');
        if (!statusElement) return;

        try {
            // In production, this would fetch real status from API
            // For now, use mock data
            const status = await fetchStatus();

            updateStatusDisplay(status);
            state.lastStatusCheck = Date.now();

        } catch (error) {
            console.error('[Footer] Failed to fetch status:', error);

            // Fallback to operational
            updateStatusDisplay({
                status: 'operational',
                message: 'All Systems Operational'
            });
        }
    }

    /**
     * Fetch system status
     * @returns {Promise<Object>} Status data
     */
    async function fetchStatus() {
        // Mock status data
        // In production, this would be: const response = await fetch(CONFIG.status.apiEndpoint);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'operational',
                    message: 'All Systems Operational',
                    uptime: 99.98
                });
            }, 100);
        });
    }

    /**
     * Update status display
     * @param {Object} status - Status data
     */
    function updateStatusDisplay(status) {
        const statusElement = document.getElementById('footer-status');
        if (!statusElement) return;

        const statusDot = statusElement.querySelector('.status-dot');
        const statusText = statusElement.querySelector('.status-text');
        const statusLink = statusElement.querySelector('.status-link');

        // Update status class
        statusElement.className = 'footer-status';
        statusElement.classList.add(`status-${status.status}`);

        // Update status dot
        if (statusDot) {
            statusDot.className = 'status-dot';
            statusDot.classList.add(`status-${status.status}`);
        }

        // Update status text
        if (statusText) {
            statusText.textContent = status.message;
        }

        // Update ARIA label
        statusElement.setAttribute('aria-label', `System status: ${status.message}`);

        // Update link title
        if (statusLink) {
            statusLink.setAttribute('title', `View detailed status - ${status.message}`);
        }
    }

    // =========================
    // Social Media Links
    // =========================

    /**
     * Initialize social media links tracking
     */
    function initSocialLinks() {
        const socialLinks = document.querySelectorAll('.social-link');

        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = link.dataset.social || 'unknown';

                // Track social link click
                if (window.Analytics) {
                    window.Analytics.track('social_link_click', {
                        platform,
                        url: link.href
                    });
                }

                console.log('[Footer] Social link clicked:', platform);
            });
        });

        console.log('[Footer] Social links initialized:', socialLinks.length);
    }

    // =========================
    // Theme Selector in Footer
    // =========================

    /**
     * Initialize footer theme selector
     */
    function initFooterThemeSelector() {
        const themeSelector = document.getElementById('footer-theme-selector');
        if (!themeSelector) return;

        // Listen for theme changes
        themeSelector.addEventListener('change', (e) => {
            const theme = e.target.value;

            // Use global theme system
            if (window.ThemeManager) {
                window.ThemeManager.setTheme(theme);
            }

            console.log('[Footer] Theme changed via footer selector:', theme);
        });

        // Sync with current theme
        if (window.ThemeManager) {
            const currentTheme = window.ThemeManager.getCurrentTheme();
            themeSelector.value = currentTheme;
        }

        console.log('[Footer] Theme selector initialized');
    }

    // =========================
    // Back to Top Integration
    // =========================

    /**
     * Scroll to top when footer back-to-top is clicked
     */
    function initFooterBackToTop() {
        const backToTopLinks = document.querySelectorAll('.footer-back-to-top');

        backToTopLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Use global scroll-to-top functionality if available
                if (window.ScrollToTop && window.ScrollToTop.scrollToTop) {
                    window.ScrollToTop.scrollToTop();
                } else {
                    // Fallback smooth scroll
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }

                // Track event
                if (window.Analytics) {
                    window.Analytics.track('footer_back_to_top_click');
                }
            });
        });

        console.log('[Footer] Back to top links initialized:', backToTopLinks.length);
    }

    // =========================
    // Accessibility
    // =========================

    /**
     * Enhance footer accessibility
     */
    function enhanceAccessibility() {
        const footer = document.querySelector('.site-footer');
        if (!footer) return;

        // Ensure footer has proper landmark role
        footer.setAttribute('role', 'contentinfo');

        // Add skip link to footer if not present
        const skipLink = document.getElementById('skip-to-footer');
        if (!skipLink) {
            const skip = document.createElement('a');
            skip.href = '#site-footer';
            skip.id = 'skip-to-footer';
            skip.className = 'skip-to-content';
            skip.textContent = 'Skip to footer';
            document.body.insertBefore(skip, document.body.firstChild);
        }

        console.log('[Footer] Accessibility enhancements applied');
    }

    // =========================
    // Cleanup
    // =========================

    /**
     * Cleanup on page unload
     */
    function cleanup() {
        if (state.statusUpdateTimer) {
            clearInterval(state.statusUpdateTimer);
        }
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize enhanced footer
     */
    function init() {
        console.log('📧 Enhanced Footer Initialized');

        // Initialize all footer features
        initNewsletterSignup();
        initStatusIndicator();
        initSocialLinks();
        initFooterThemeSelector();
        initFooterBackToTop();
        enhanceAccessibility();

        // Cleanup on unload
        window.addEventListener('beforeunload', cleanup);
    }

    // =========================
    // Public API
    // =========================
    window.FooterEnhanced = {
        init,
        updateStatus,
        cleanup
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
