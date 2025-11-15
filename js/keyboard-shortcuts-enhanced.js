/**
 * Enhanced Keyboard Shortcuts System
 * - Global keyboard shortcuts for navigation and actions
 * - Beautiful help modal with all shortcuts
 * - Visual feedback for actions
 * - Accessible and customizable
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        shortcuts: {
            // Help & Information
            'help': { keys: ['?'], action: 'showHelp', description: 'Show keyboard shortcuts help', category: 'Help' },

            // Theme
            'toggleTheme': { keys: ['t'], action: 'toggleTheme', description: 'Toggle dark/light theme', category: 'Actions' },

            // Navigation
            'goHome': { keys: ['g', 'h'], action: 'goHome', description: 'Go to home page', category: 'Navigation', sequence: true },
            'goDocs': { keys: ['g', 'd'], action: 'goDocs', description: 'Go to documentation', category: 'Navigation', sequence: true },
            'goExamples': { keys: ['g', 'e'], action: 'goExamples', description: 'Go to examples', category: 'Navigation', sequence: true },
            'goChangelog': { keys: ['g', 'c'], action: 'goChangelog', description: 'Go to changelog', category: 'Navigation', sequence: true },

            // Actions
            'copyUrl': { keys: ['c'], action: 'copyUrl', description: 'Copy current URL', category: 'Actions' },
            'print': { keys: ['ctrl+p', 'meta+p'], action: 'print', description: 'Print page', category: 'Actions', native: true },

            // Modal/Overlay
            'closeModal': { keys: ['Escape'], action: 'closeModal', description: 'Close modal or overlay', category: 'Navigation' }
        },

        modalId: 'keyboard-shortcuts-modal',
        sequenceTimeout: 1000, // Time to complete sequence (ms)
        helpKeyCode: 191 // "?" key
    };

    // State
    const state = {
        modal: null,
        sequenceKeys: [],
        sequenceTimer: null,
        isModalOpen: false
    };

    // =========================
    // Keyboard Shortcuts Handler
    // =========================

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleKeyPress(e) {
        // Don't trigger shortcuts when typing in inputs
        if (isTypingContext(e.target)) {
            return;
        }

        const key = getKeyString(e);

        // Check for sequence shortcuts
        if (handleSequence(key)) {
            e.preventDefault();
            return;
        }

        // Check for single-key shortcuts
        const shortcut = findShortcut(key);
        if (shortcut && !shortcut.native) {
            e.preventDefault();
            executeAction(shortcut.action);
        }
    }

    /**
     * Check if user is typing in an input field
     * @param {Element} element - Target element
     * @returns {boolean} True if typing context
     */
    function isTypingContext(element) {
        const tagName = element.tagName.toLowerCase();
        const isEditable = element.isContentEditable;
        const inputTypes = ['input', 'textarea', 'select'];

        return inputTypes.includes(tagName) || isEditable;
    }

    /**
     * Get key string from keyboard event
     * @param {KeyboardEvent} e - Keyboard event
     * @returns {string} Key string
     */
    function getKeyString(e) {
        const modifiers = [];

        if (e.ctrlKey) modifiers.push('ctrl');
        if (e.metaKey) modifiers.push('meta');
        if (e.altKey) modifiers.push('alt');
        if (e.shiftKey && e.key.length > 1) modifiers.push('shift');

        const key = e.key.toLowerCase();

        if (modifiers.length > 0) {
            return modifiers.join('+') + '+' + key;
        }

        return key;
    }

    /**
     * Find shortcut by key string
     * @param {string} keyString - Key string to find
     * @returns {Object|null} Shortcut config or null
     */
    function findShortcut(keyString) {
        for (const shortcut of Object.values(CONFIG.shortcuts)) {
            if (shortcut.keys.includes(keyString)) {
                return shortcut;
            }
        }
        return null;
    }

    /**
     * Handle sequence shortcuts (e.g., "g h" for go home)
     * @param {string} key - Current key
     * @returns {boolean} True if part of sequence
     */
    function handleSequence(key) {
        // Add key to sequence
        state.sequenceKeys.push(key);

        // Clear sequence after timeout
        clearTimeout(state.sequenceTimer);
        state.sequenceTimer = setTimeout(() => {
            state.sequenceKeys = [];
        }, CONFIG.sequenceTimeout);

        // Check for matching sequence
        const sequenceString = state.sequenceKeys.join(' ');

        for (const shortcut of Object.values(CONFIG.shortcuts)) {
            if (shortcut.sequence) {
                const shortcutSequence = shortcut.keys.join(' ');

                if (sequenceString === shortcutSequence) {
                    state.sequenceKeys = [];
                    clearTimeout(state.sequenceTimer);
                    executeAction(shortcut.action);
                    return true;
                }
            }
        }

        return false;
    }

    // =========================
    // Action Executors
    // =========================

    /**
     * Execute shortcut action
     * @param {string} action - Action name
     */
    function executeAction(action) {
        const actions = {
            showHelp: () => showHelpModal(),
            toggleTheme: () => toggleTheme(),
            goHome: () => navigateTo('/'),
            goDocs: () => navigateTo('/docs/getting-started.html'),
            goExamples: () => navigateTo('/examples.html'),
            goChangelog: () => navigateTo('/changelog.html'),
            copyUrl: () => copyCurrentUrl(),
            closeModal: () => closeModals()
        };

        if (actions[action]) {
            actions[action]();
            console.log(`[Keyboard Shortcuts] Executed action: ${action}`);
        }
    }

    /**
     * Toggle theme
     */
    function toggleTheme() {
        if (window.HeaderThemeToggle) {
            const currentTheme = window.HeaderThemeToggle.getCurrentTheme();
            const nextTheme = window.HeaderThemeToggle.getNextTheme(currentTheme);
            window.HeaderThemeToggle.setTheme(nextTheme);

            if (window.Toast) {
                window.Toast.info(`Theme: ${nextTheme}`);
            }
        }
    }

    /**
     * Navigate to URL
     * @param {string} url - URL to navigate to
     */
    function navigateTo(url) {
        window.location.href = url;
    }

    /**
     * Copy current URL to clipboard
     */
    async function copyCurrentUrl() {
        const url = window.location.href;

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = url;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            if (window.Toast) {
                window.Toast.success('URL copied to clipboard');
            }

            console.log('[Keyboard Shortcuts] URL copied');
        } catch (error) {
            console.error('[Keyboard Shortcuts] Failed to copy URL:', error);

            if (window.Toast) {
                window.Toast.error('Failed to copy URL');
            }
        }
    }

    /**
     * Close all open modals
     */
    function closeModals() {
        if (state.isModalOpen) {
            hideHelpModal();
        }

        // Close other modals if they exist
        document.querySelectorAll('.modal, [role="dialog"]').forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
            }
        });
    }

    // =========================
    // Help Modal
    // =========================

    /**
     * Create help modal
     * @returns {HTMLElement} Modal element
     */
    function createHelpModal() {
        const modal = document.createElement('div');
        modal.id = CONFIG.modalId;
        modal.className = 'keyboard-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'keyboard-modal-title');
        modal.setAttribute('aria-modal', 'true');

        // Group shortcuts by category
        const categories = {};
        Object.entries(CONFIG.shortcuts).forEach(([id, shortcut]) => {
            if (!categories[shortcut.category]) {
                categories[shortcut.category] = [];
            }
            categories[shortcut.category].push({
                id,
                ...shortcut
            });
        });

        modal.innerHTML = `
            <div class="keyboard-modal-overlay" aria-hidden="true"></div>
            <div class="keyboard-modal-content">
                <div class="keyboard-modal-header">
                    <h2 id="keyboard-modal-title">Keyboard Shortcuts</h2>
                    <button class="keyboard-modal-close" aria-label="Close keyboard shortcuts help">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>

                <div class="keyboard-modal-body">
                    ${Object.entries(categories).map(([category, shortcuts]) => `
                        <div class="keyboard-category">
                            <h3 class="keyboard-category-title">${category}</h3>
                            <div class="keyboard-shortcuts-list">
                                ${shortcuts.map(shortcut => `
                                    <div class="keyboard-shortcut-item">
                                        <div class="keyboard-shortcut-keys">
                                            ${shortcut.keys.map(key => formatKeyDisplay(key)).join(' ')}
                                        </div>
                                        <div class="keyboard-shortcut-description">
                                            ${shortcut.description}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="keyboard-modal-footer">
                    <p>Press <kbd>Esc</kbd> or <kbd>?</kbd> to close this dialog</p>
                </div>
            </div>
        `;

        // Add event listeners
        const overlay = modal.querySelector('.keyboard-modal-overlay');
        const closeBtn = modal.querySelector('.keyboard-modal-close');

        overlay.addEventListener('click', () => hideHelpModal());
        closeBtn.addEventListener('click', () => hideHelpModal());

        return modal;
    }

    /**
     * Format key display
     * @param {string} keyString - Key string
     * @returns {string} Formatted HTML
     */
    function formatKeyDisplay(keyString) {
        const keys = keyString.split('+');

        return keys.map(key => {
            const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
            return `<kbd>${displayKey}</kbd>`;
        }).join(' + ');
    }

    /**
     * Show help modal
     */
    function showHelpModal() {
        if (!state.modal) {
            state.modal = createHelpModal();
            document.body.appendChild(state.modal);
        }

        state.modal.style.display = 'block';
        state.isModalOpen = true;

        // Focus first focusable element
        const closeBtn = state.modal.querySelector('.keyboard-modal-close');
        if (closeBtn) {
            closeBtn.focus();
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Track analytics
        if (window.Analytics) {
            window.Analytics.track('keyboard_help_opened');
        }

        console.log('[Keyboard Shortcuts] Help modal shown');
    }

    /**
     * Hide help modal
     */
    function hideHelpModal() {
        if (state.modal) {
            state.modal.style.display = 'none';
            state.isModalOpen = false;

            // Restore body scroll
            document.body.style.overflow = '';

            console.log('[Keyboard Shortcuts] Help modal hidden');
        }
    }

    // =========================
    // Styles
    // =========================

    /**
     * Inject modal styles
     */
    function injectStyles() {
        if (document.getElementById('keyboard-shortcuts-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'keyboard-shortcuts-styles';
        style.textContent = `
            /* Keyboard Modal */
            .keyboard-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
            }

            .keyboard-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(4px);
            }

            .keyboard-modal-content {
                position: relative;
                max-width: 700px;
                max-height: 80vh;
                margin: 5vh auto;
                background: var(--bg-secondary, #0f1116);
                border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
            }

            .keyboard-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1.5rem 2rem;
                border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
            }

            .keyboard-modal-header h2 {
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--text-primary, #e8eaed);
                margin: 0;
            }

            .keyboard-modal-close {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                background: transparent;
                border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
                border-radius: 8px;
                color: var(--text-secondary, #a8b2c1);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .keyboard-modal-close:hover {
                background: rgba(255, 68, 68, 0.1);
                border-color: #ff4444;
                color: #ff4444;
            }

            .keyboard-modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 2rem;
            }

            .keyboard-category {
                margin-bottom: 2rem;
            }

            .keyboard-category:last-child {
                margin-bottom: 0;
            }

            .keyboard-category-title {
                font-size: 0.875rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--accent-primary, #00e5ff);
                margin-bottom: 1rem;
            }

            .keyboard-shortcuts-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .keyboard-shortcut-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem 1rem;
                background: var(--bg-tertiary, #1a1c22);
                border: 1px solid var(--border-secondary, rgba(255, 255, 255, 0.05));
                border-radius: 8px;
            }

            .keyboard-shortcut-keys {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                min-width: 120px;
            }

            .keyboard-shortcut-keys kbd {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 2rem;
                padding: 0.25rem 0.5rem;
                background: var(--bg-secondary, #0f1116);
                border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
                border-bottom-width: 2px;
                border-radius: 4px;
                color: var(--text-primary, #e8eaed);
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                font-size: 0.8125rem;
                font-weight: 500;
                line-height: 1;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            .keyboard-shortcut-description {
                flex: 1;
                color: var(--text-secondary, #a8b2c1);
                font-size: 0.9rem;
                line-height: 1.5;
            }

            .keyboard-modal-footer {
                padding: 1rem 2rem;
                border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
                text-align: center;
            }

            .keyboard-modal-footer p {
                margin: 0;
                color: var(--text-tertiary, #6c757d);
                font-size: 0.875rem;
            }

            .keyboard-modal-footer kbd {
                display: inline-flex;
                align-items: center;
                padding: 0.125rem 0.375rem;
                background: var(--bg-tertiary, #1a1c22);
                border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
                border-radius: 4px;
                color: var(--text-primary, #e8eaed);
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                font-size: 0.75rem;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .keyboard-modal-content {
                    max-width: calc(100% - 2rem);
                    margin: 1rem;
                    max-height: calc(100vh - 2rem);
                }

                .keyboard-modal-header,
                .keyboard-modal-body,
                .keyboard-modal-footer {
                    padding: 1.25rem;
                }

                .keyboard-shortcut-item {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .keyboard-shortcut-keys {
                    min-width: auto;
                }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .keyboard-modal-content {
                    animation: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize keyboard shortcuts
     */
    function init() {
        console.log('⌨️  Enhanced Keyboard Shortcuts Initialized');

        // Inject styles
        injectStyles();

        // Listen for keyboard events
        document.addEventListener('keydown', handleKeyPress);

        console.log('[Keyboard Shortcuts] Shortcuts registered:', Object.keys(CONFIG.shortcuts).length);
    }

    // =========================
    // Public API
    // =========================
    window.KeyboardShortcutsEnhanced = {
        init,
        showHelp: showHelpModal,
        hideHelp: hideHelpModal
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
