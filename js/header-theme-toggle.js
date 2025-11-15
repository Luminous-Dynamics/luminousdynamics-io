/**
 * Header Theme Toggle
 * - Sun/moon icon toggle in the header
 * - Smooth theme transitions
 * - Keyboard accessible
 * - Tooltip on hover
 * - Persists to localStorage
 * - System preference detection
 * - Integrates with existing theme system
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        storageKey: 'luminous_theme_preference',
        themes: {
            light: 'light',
            dark: 'dark',
            auto: 'auto'
        },
        icons: {
            light: '☀️',
            dark: '🌙',
            auto: '🔄'
        },
        tooltips: {
            light: 'Switch to dark mode',
            dark: 'Switch to light mode',
            auto: 'Using system theme'
        },
        transitionDuration: 300 // milliseconds
    };

    // State
    const state = {
        currentTheme: null,
        toggleButton: null,
        systemPreference: null,
        mediaQuery: null
    };

    // =========================
    // Theme Toggle Button
    // =========================

    /**
     * Create theme toggle button
     * @returns {HTMLButtonElement} Toggle button element
     */
    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'header-theme-toggle';
        button.className = 'theme-toggle-btn';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', 'Toggle theme');
        button.setAttribute('title', 'Toggle theme');

        // Button structure
        button.innerHTML = `
            <span class="theme-icon" aria-hidden="true">${CONFIG.icons.dark}</span>
            <span class="theme-tooltip"></span>
        `;

        // Click handler
        button.addEventListener('click', handleToggleClick);

        // Keyboard handler
        button.addEventListener('keydown', handleKeydown);

        return button;
    }

    /**
     * Insert toggle button into header
     */
    function insertToggleButton() {
        const header = document.querySelector('.site-header nav');
        if (!header) {
            console.warn('[Header Theme Toggle] Header not found');
            return;
        }

        // Check if button already exists
        if (document.getElementById('header-theme-toggle')) {
            state.toggleButton = document.getElementById('header-theme-toggle');
            return;
        }

        // Create button
        state.toggleButton = createToggleButton();

        // Find insertion point (after nav menu, before GitHub link)
        const navMenu = header.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.insertAdjacentElement('afterend', state.toggleButton);
        } else {
            header.appendChild(state.toggleButton);
        }

        console.log('[Header Theme Toggle] Button inserted');
    }

    // =========================
    // Theme Management
    // =========================

    /**
     * Get current theme preference
     * @returns {string} Current theme (light/dark/auto)
     */
    function getCurrentTheme() {
        try {
            return localStorage.getItem(CONFIG.storageKey) || CONFIG.themes.dark;
        } catch (e) {
            return CONFIG.themes.dark;
        }
    }

    /**
     * Set theme preference
     * @param {string} theme - Theme to set (light/dark/auto)
     */
    function setTheme(theme) {
        try {
            localStorage.setItem(CONFIG.storageKey, theme);
            state.currentTheme = theme;

            applyTheme(theme);
            updateButton(theme);

            // Trigger custom event
            window.dispatchEvent(new CustomEvent('themechange', {
                detail: { theme }
            }));

            console.log('[Header Theme Toggle] Theme set to:', theme);
        } catch (e) {
            console.error('[Header Theme Toggle] Failed to set theme:', e);
        }
    }

    /**
     * Apply theme to document
     * @param {string} theme - Theme to apply
     */
    function applyTheme(theme) {
        const root = document.documentElement;
        let effectiveTheme = theme;

        // If auto, use system preference
        if (theme === CONFIG.themes.auto) {
            effectiveTheme = state.systemPreference;
        }

        // Add transition class for smooth color changes
        root.classList.add('theme-transitioning');

        // Remove all theme classes
        root.classList.remove('theme-light', 'theme-dark');

        // Add new theme class
        root.classList.add(`theme-${effectiveTheme}`);

        // Set data attribute
        root.setAttribute('data-theme', effectiveTheme);

        // Remove transition class after transition completes
        setTimeout(() => {
            root.classList.remove('theme-transitioning');
        }, CONFIG.transitionDuration);

        // Sync with global theme manager if available
        if (window.ThemeManager && window.ThemeManager.setTheme) {
            window.ThemeManager.setTheme(theme);
        }
    }

    /**
     * Get next theme in cycle (dark -> light -> dark)
     * @param {string} currentTheme - Current theme
     * @returns {string} Next theme
     */
    function getNextTheme(currentTheme) {
        switch (currentTheme) {
            case CONFIG.themes.dark:
                return CONFIG.themes.light;
            case CONFIG.themes.light:
                return CONFIG.themes.dark;
            case CONFIG.themes.auto:
                return CONFIG.themes.dark; // Start with dark when leaving auto
            default:
                return CONFIG.themes.dark;
        }
    }

    // =========================
    // Button Updates
    // =========================

    /**
     * Update toggle button appearance
     * @param {string} theme - Current theme
     */
    function updateButton(theme) {
        if (!state.toggleButton) {
            return;
        }

        const icon = state.toggleButton.querySelector('.theme-icon');
        const tooltip = state.toggleButton.querySelector('.theme-tooltip');

        if (!icon || !tooltip) {
            return;
        }

        // Update icon based on effective theme
        let effectiveTheme = theme;
        if (theme === CONFIG.themes.auto) {
            effectiveTheme = state.systemPreference;
        }

        // Set icon (opposite of current theme to show what clicking will do)
        if (effectiveTheme === CONFIG.themes.dark) {
            icon.textContent = CONFIG.icons.light;
            state.toggleButton.setAttribute('aria-label', CONFIG.tooltips.light);
            state.toggleButton.setAttribute('title', CONFIG.tooltips.light);
            tooltip.textContent = CONFIG.tooltips.light;
        } else {
            icon.textContent = CONFIG.icons.dark;
            state.toggleButton.setAttribute('aria-label', CONFIG.tooltips.dark);
            state.toggleButton.setAttribute('title', CONFIG.tooltips.dark);
            tooltip.textContent = CONFIG.tooltips.dark;
        }

        // Add animation class
        icon.classList.add('theme-icon-spin');
        setTimeout(() => {
            icon.classList.remove('theme-icon-spin');
        }, 300);
    }

    // =========================
    // Event Handlers
    // =========================

    /**
     * Handle toggle button click
     */
    function handleToggleClick() {
        const currentTheme = getCurrentTheme();
        const nextTheme = getNextTheme(currentTheme);

        setTheme(nextTheme);

        // Track analytics
        if (window.Analytics) {
            window.Analytics.track('theme_toggle', {
                from: currentTheme,
                to: nextTheme,
                source: 'header'
            });
        }
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleKeydown(e) {
        // Enter or Space to toggle
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleClick();
        }
    }

    /**
     * Handle system preference changes
     * @param {MediaQueryListEvent} e - Media query event
     */
    function handleSystemPreferenceChange(e) {
        state.systemPreference = e.matches ? CONFIG.themes.light : CONFIG.themes.dark;

        // If using auto theme, update
        if (state.currentTheme === CONFIG.themes.auto) {
            applyTheme(CONFIG.themes.auto);
            updateButton(CONFIG.themes.auto);
        }

        console.log('[Header Theme Toggle] System preference changed to:', state.systemPreference);
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize header theme toggle
     */
    function init() {
        console.log('🌓 Header Theme Toggle Initialized');

        // Detect system preference
        state.mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        state.systemPreference = state.mediaQuery.matches ? CONFIG.themes.light : CONFIG.themes.dark;

        // Listen for system preference changes
        state.mediaQuery.addEventListener('change', handleSystemPreferenceChange);

        // Get current theme
        state.currentTheme = getCurrentTheme();

        // Insert toggle button
        insertToggleButton();

        // Update button appearance
        updateButton(state.currentTheme);

        // Apply current theme
        applyTheme(state.currentTheme);

        // Add transition styles
        injectStyles();

        console.log('[Header Theme Toggle] Current theme:', state.currentTheme);
    }

    /**
     * Inject required styles
     */
    function injectStyles() {
        if (document.getElementById('header-theme-toggle-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'header-theme-toggle-styles';
        style.textContent = `
            /* Theme toggle button */
            .theme-toggle-btn {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                margin-left: 1rem;
                background: transparent;
                border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
                border-radius: 50%;
                color: var(--text-primary, #e8eaed);
                font-size: 1.25rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .theme-toggle-btn:hover {
                background: var(--bg-secondary, #0f1116);
                border-color: var(--accent-primary, #00e5ff);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 229, 255, 0.2);
            }

            .theme-toggle-btn:active {
                transform: translateY(0);
            }

            .theme-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s ease;
            }

            .theme-icon-spin {
                animation: theme-icon-spin 0.5s ease;
            }

            @keyframes theme-icon-spin {
                0% {
                    transform: rotate(0deg) scale(1);
                }
                50% {
                    transform: rotate(180deg) scale(0.8);
                }
                100% {
                    transform: rotate(360deg) scale(1);
                }
            }

            /* Tooltip */
            .theme-tooltip {
                position: absolute;
                bottom: -2.5rem;
                left: 50%;
                transform: translateX(-50%);
                padding: 0.5rem 0.75rem;
                background: var(--bg-elevated, #1a1c22);
                border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
                border-radius: 6px;
                color: var(--text-primary, #e8eaed);
                font-size: 0.8125rem;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
                z-index: 1000;
            }

            .theme-toggle-btn:hover .theme-tooltip {
                opacity: 1;
            }

            .theme-tooltip::before {
                content: '';
                position: absolute;
                top: -6px;
                left: 50%;
                transform: translateX(-50%);
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 6px solid var(--border-primary, rgba(255, 255, 255, 0.1));
            }

            /* Theme transitions */
            .theme-transitioning,
            .theme-transitioning * {
                transition: background-color ${CONFIG.transitionDuration}ms ease,
                            color ${CONFIG.transitionDuration}ms ease,
                            border-color ${CONFIG.transitionDuration}ms ease,
                            fill ${CONFIG.transitionDuration}ms ease !important;
            }

            /* Focus styles */
            .theme-toggle-btn:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.3);
            }

            .theme-toggle-btn:focus:not(:focus-visible) {
                box-shadow: none;
            }

            .theme-toggle-btn:focus-visible {
                box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.3);
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .theme-toggle-btn {
                    width: 36px;
                    height: 36px;
                    font-size: 1.125rem;
                    margin-left: 0.5rem;
                }

                .theme-tooltip {
                    display: none;
                }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .theme-toggle-btn,
                .theme-icon,
                .theme-tooltip,
                .theme-transitioning,
                .theme-transitioning * {
                    transition: none !important;
                    animation: none !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // =========================
    // Public API
    // =========================
    window.HeaderThemeToggle = {
        init,
        setTheme,
        getCurrentTheme,
        getNextTheme
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
