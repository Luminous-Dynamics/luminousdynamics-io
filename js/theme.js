/**
 * Theme Management System
 * - Dark, Light, Auto, High Contrast themes
 * - Smooth transitions
 * - Persistent preferences
 * - System preference detection
 * - Accessible theme selector
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const THEMES = {
        DARK: 'dark',
        LIGHT: 'light',
        AUTO: 'auto',
        HIGH_CONTRAST: 'high-contrast'
    };

    const CONFIG = {
        storageKey: 'luminous_theme_preference',
        transitionDuration: 300, // ms
        defaultTheme: THEMES.DARK
    };

    // State
    const state = {
        currentTheme: null,
        systemPreference: null,
        transitionEnabled: false
    };

    // =========================
    // Theme Detection
    // =========================

    /**
     * Get system color scheme preference
     * @returns {string} 'dark' or 'light'
     */
    function getSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    /**
     * Get saved theme preference
     * @returns {string|null} Saved theme or null
     */
    function getSavedPreference() {
        try {
            return localStorage.getItem(CONFIG.storageKey);
        } catch (err) {
            console.error('[Theme] Failed to read preference:', err);
            return null;
        }
    }

    /**
     * Save theme preference
     * @param {string} theme - Theme to save
     */
    function savePreference(theme) {
        try {
            localStorage.setItem(CONFIG.storageKey, theme);
        } catch (err) {
            console.error('[Theme] Failed to save preference:', err);
        }
    }

    // =========================
    // Theme Application
    // =========================

    /**
     * Get effective theme (resolve 'auto' to actual theme)
     * @param {string} theme - Theme preference
     * @returns {string} Actual theme to apply
     */
    function getEffectiveTheme(theme) {
        if (theme === THEMES.AUTO) {
            return getSystemPreference();
        }
        return theme;
    }

    /**
     * Apply theme to document
     * @param {string} theme - Theme to apply
     * @param {boolean} withTransition - Enable transition
     */
    function applyTheme(theme, withTransition = true) {
        const effectiveTheme = getEffectiveTheme(theme);
        const html = document.documentElement;

        // Enable transitions if requested and not first load
        if (withTransition && state.transitionEnabled) {
            html.classList.add('theme-transition');
        }

        // Remove all theme classes
        html.classList.remove(
            `theme-${THEMES.DARK}`,
            `theme-${THEMES.LIGHT}`,
            `theme-${THEMES.HIGH_CONTRAST}`
        );

        // Add new theme class
        html.classList.add(`theme-${effectiveTheme}`);

        // Update data attribute for CSS
        html.setAttribute('data-theme', effectiveTheme);

        // Remove transition class after animation
        if (withTransition && state.transitionEnabled) {
            setTimeout(() => {
                html.classList.remove('theme-transition');
            }, CONFIG.transitionDuration);
        }

        // Update state
        state.currentTheme = theme;

        // Update UI
        updateThemeSelector(theme);

        // Announce to screen readers
        announceThemeChange(theme, effectiveTheme);

        console.log(`[Theme] Applied: ${theme}${theme !== effectiveTheme ? ` (${effectiveTheme})` : ''}`);
    }

    /**
     * Announce theme change to screen readers
     * @param {string} theme - Selected theme
     * @param {string} effectiveTheme - Effective theme
     */
    function announceThemeChange(theme, effectiveTheme) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';

        let message = `Theme changed to ${theme}`;
        if (theme === THEMES.AUTO) {
            message += ` (system preference: ${effectiveTheme})`;
        }

        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => announcement.remove(), 1000);
    }

    // =========================
    // Theme Selection
    // =========================

    /**
     * Set theme
     * @param {string} theme - Theme to set
     */
    function setTheme(theme) {
        if (!Object.values(THEMES).includes(theme)) {
            console.warn('[Theme] Invalid theme:', theme);
            return;
        }

        applyTheme(theme, true);
        savePreference(theme);

        // Show toast if available
        if (window.Toast) {
            const themeNames = {
                [THEMES.DARK]: 'Dark',
                [THEMES.LIGHT]: 'Light',
                [THEMES.AUTO]: 'Auto',
                [THEMES.HIGH_CONTRAST]: 'High Contrast'
            };
            window.Toast.success(`Theme: ${themeNames[theme]}`);
        }
    }

    /**
     * Cycle to next theme
     */
    function cycleTheme() {
        const themes = [THEMES.DARK, THEMES.LIGHT, THEMES.AUTO, THEMES.HIGH_CONTRAST];
        const currentIndex = themes.indexOf(state.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    }

    /**
     * Update theme selector UI
     * @param {string} theme - Current theme
     */
    function updateThemeSelector(theme) {
        // Update radio buttons
        const radioButtons = document.querySelectorAll('input[name="theme"]');
        radioButtons.forEach(radio => {
            radio.checked = radio.value === theme;
        });

        // Update theme icon if present
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            const icons = {
                [THEMES.DARK]: '🌙',
                [THEMES.LIGHT]: '☀️',
                [THEMES.AUTO]: '🔄',
                [THEMES.HIGH_CONTRAST]: '◐'
            };
            themeIcon.textContent = icons[theme] || '🌙';
        }

        // Update button text if present
        const themeButtonText = document.getElementById('theme-button-text');
        if (themeButtonText) {
            const names = {
                [THEMES.DARK]: 'Dark',
                [THEMES.LIGHT]: 'Light',
                [THEMES.AUTO]: 'Auto',
                [THEMES.HIGH_CONTRAST]: 'High Contrast'
            };
            themeButtonText.textContent = names[theme] || 'Dark';
        }
    }

    // =========================
    // System Preference Monitoring
    // =========================

    /**
     * Watch for system preference changes
     */
    function watchSystemPreference() {
        if (!window.matchMedia) {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', (e) => {
                state.systemPreference = e.matches ? 'light' : 'dark';

                // Only update if user has Auto theme selected
                if (state.currentTheme === THEMES.AUTO) {
                    applyTheme(THEMES.AUTO, true);

                    if (window.Toast) {
                        window.Toast.info(`System theme changed to ${state.systemPreference}`);
                    }
                }
            });
        }
        // Legacy browsers
        else if (mediaQuery.addListener) {
            mediaQuery.addListener((e) => {
                state.systemPreference = e.matches ? 'light' : 'dark';
                if (state.currentTheme === THEMES.AUTO) {
                    applyTheme(THEMES.AUTO, true);
                }
            });
        }
    }

    // =========================
    // UI Initialization
    // =========================

    /**
     * Create theme selector UI
     */
    function createThemeSelector() {
        const nav = document.querySelector('.nav-menu');
        if (!nav) {
            return;
        }

        const themeButton = document.createElement('button');
        themeButton.className = 'nav-link theme-toggle';
        themeButton.setAttribute('aria-label', 'Toggle theme');
        themeButton.setAttribute('aria-expanded', 'false');
        themeButton.setAttribute('aria-haspopup', 'true');
        themeButton.id = 'theme-toggle-button';

        themeButton.innerHTML = `
            <span id="theme-icon" aria-hidden="true">🌙</span>
            <span id="theme-button-text" class="theme-button-text">Theme</span>
        `;

        // Insert before GitHub link
        const githubLink = nav.querySelector('.nav-github');
        if (githubLink) {
            nav.insertBefore(themeButton, githubLink);
        } else {
            nav.appendChild(themeButton);
        }

        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'theme-dropdown';
        dropdown.id = 'theme-dropdown';
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-labelledby', 'theme-toggle-button');

        dropdown.innerHTML = `
            <div class="theme-dropdown-content">
                <div class="theme-dropdown-header">
                    <h3>Choose Theme</h3>
                </div>
                <div class="theme-options">
                    <label class="theme-option">
                        <input type="radio" name="theme" value="${THEMES.DARK}">
                        <span class="theme-option-icon">🌙</span>
                        <span class="theme-option-label">
                            <strong>Dark</strong>
                            <small>Low light environments</small>
                        </span>
                    </label>
                    <label class="theme-option">
                        <input type="radio" name="theme" value="${THEMES.LIGHT}">
                        <span class="theme-option-icon">☀️</span>
                        <span class="theme-option-label">
                            <strong>Light</strong>
                            <small>Bright environments</small>
                        </span>
                    </label>
                    <label class="theme-option">
                        <input type="radio" name="theme" value="${THEMES.AUTO}">
                        <span class="theme-option-icon">🔄</span>
                        <span class="theme-option-label">
                            <strong>Auto</strong>
                            <small>Follow system preference</small>
                        </span>
                    </label>
                    <label class="theme-option">
                        <input type="radio" name="theme" value="${THEMES.HIGH_CONTRAST}">
                        <span class="theme-option-icon">◐</span>
                        <span class="theme-option-label">
                            <strong>High Contrast</strong>
                            <small>Maximum accessibility</small>
                        </span>
                    </label>
                </div>
                <div class="theme-dropdown-footer">
                    <small>Keyboard: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd></small>
                </div>
            </div>
        `;

        document.body.appendChild(dropdown);

        // Event listeners
        themeButton.addEventListener('click', () => {
            const isOpen = dropdown.classList.contains('active');
            dropdown.classList.toggle('active');
            themeButton.setAttribute('aria-expanded', !isOpen);

            if (!isOpen) {
                // Focus first option
                setTimeout(() => {
                    const firstOption = dropdown.querySelector('input[name="theme"]');
                    if (firstOption) {
                        firstOption.focus();
                    }
                }, 50);
            }
        });

        // Theme selection
        const radioButtons = dropdown.querySelectorAll('input[name="theme"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                setTheme(radio.value);
                dropdown.classList.remove('active');
                themeButton.setAttribute('aria-expanded', 'false');
                themeButton.focus();
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!themeButton.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                themeButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape
        dropdown.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('active');
                themeButton.setAttribute('aria-expanded', 'false');
                themeButton.focus();
            }
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
            // Ctrl+Shift+T to cycle themes
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                cycleTheme();
            }
        });
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize theme system
     */
    function init() {
        console.log('🎨 Theme System Initialized');

        // Get initial theme
        const savedTheme = getSavedPreference();
        const initialTheme = savedTheme || CONFIG.defaultTheme;
        state.systemPreference = getSystemPreference();

        // Apply theme without transition on first load
        applyTheme(initialTheme, false);

        // Enable transitions after first paint
        requestAnimationFrame(() => {
            state.transitionEnabled = true;
        });

        // Create UI
        createThemeSelector();

        // Watch for system preference changes
        watchSystemPreference();

        // Initialize keyboard shortcuts
        initKeyboardShortcuts();

        // Update initial state
        updateThemeSelector(initialTheme);
    }

    // =========================
    // Public API
    // =========================
    window.ThemeManager = {
        setTheme,
        cycleTheme,
        getCurrentTheme: () => state.currentTheme,
        getEffectiveTheme: () => getEffectiveTheme(state.currentTheme),
        THEMES,
        init
    };

    // Auto-initialize before DOM content loaded to prevent FOUC
    if (document.readyState === 'loading') {
        // Apply saved theme immediately
        const savedTheme = getSavedPreference();
        if (savedTheme) {
            const html = document.documentElement;
            const effectiveTheme = savedTheme === THEMES.AUTO ? getSystemPreference() : savedTheme;
            html.classList.add(`theme-${effectiveTheme}`);
            html.setAttribute('data-theme', effectiveTheme);
        }

        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
