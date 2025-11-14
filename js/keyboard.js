/**
 * Keyboard Shortcuts System
 * - Global navigation shortcuts
 * - Playground shortcuts
 * - Help modal
 * - Accessible keyboard navigation
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const SHORTCUTS = {
        global: [
            { keys: ['?', 'Shift+/'], action: 'showHelp', description: 'Show keyboard shortcuts', category: 'Global' },
            { keys: ['Escape'], action: 'closeModals', description: 'Close modals and dialogs', category: 'Global' }
        ],
        navigation: [
            { keys: ['g', 'h'], action: 'goHome', description: 'Go to home/hero section', category: 'Navigation', sequential: true },
            { keys: ['g', 'a'], action: 'goAPIs', description: 'Go to APIs section', category: 'Navigation', sequential: true },
            { keys: ['g', 'p'], action: 'goPlayground', description: 'Go to playground section', category: 'Navigation', sequential: true },
            { keys: ['g', 'd'], action: 'goDocs', description: 'Go to documentation section', category: 'Navigation', sequential: true },
            { keys: ['g', 't'], action: 'goTools', description: 'Go to tools section', category: 'Navigation', sequential: true }
        ],
        playground: [
            { keys: ['Ctrl+Enter'], action: 'runPlayground', description: 'Run current request', category: 'Playground' },
            { keys: ['Ctrl+s'], action: 'saveFavorite', description: 'Save to favorites', category: 'Playground' },
            { keys: ['Ctrl+Shift+c'], action: 'copyCode', description: 'Copy code', category: 'Playground' },
            { keys: ['Ctrl+Shift+r'], action: 'copyResponse', description: 'Copy response', category: 'Playground' }
        ]
    };

    // State management
    const state = {
        sequentialKey: null,
        sequentialTimeout: null,
        helpModalOpen: false
    };

    // =========================
    // Shortcut Actions
    // =========================
    const Actions = {
        // Global actions
        showHelp() {
            toggleHelpModal();
        },

        closeModals() {
            closeHelpModal();
            // Also close toasts if available
            if (window.Toast && window.Toast.dismissAll) {
                window.Toast.dismissAll();
            }
        },

        // Navigation actions
        goHome() {
            scrollToTop();
        },

        goAPIs() {
            scrollToSection('apis');
        },

        goPlayground() {
            scrollToSection('playground');
        },

        goDocs() {
            scrollToSection('docs');
        },

        goTools() {
            scrollToSection('tools');
        },

        // Playground actions
        runPlayground() {
            const runBtn = document.querySelector('[data-run-playground]');
            if (runBtn && !runBtn.disabled) {
                runBtn.click();
            }
        },

        saveFavorite() {
            if (window.PlaygroundEnhanced) {
                window.PlaygroundEnhanced.Favorites.add();
            }
        },

        copyCode() {
            const copyBtn = document.querySelector('[data-copy-code]');
            if (copyBtn) {
                copyBtn.click();
            }
        },

        copyResponse() {
            if (window.PlaygroundEnhanced) {
                window.PlaygroundEnhanced.ResponseDisplay.copyResponse();
            }
        }
    };

    // =========================
    // Utility Functions
    // =========================

    /**
     * Scroll to top of page
     */
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Scroll to section
     * @param {string} sectionId - ID of section
     */
    function scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (!element) return;

        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Check if element is input/textarea
     * @param {Element} element - Element to check
     * @returns {boolean}
     */
    function isInputElement(element) {
        const tagName = element.tagName.toLowerCase();
        return tagName === 'input' || tagName === 'textarea' || element.isContentEditable;
    }

    /**
     * Normalize key for comparison
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {string} Normalized key
     */
    function normalizeKey(event) {
        const parts = [];

        if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
        if (event.shiftKey) parts.push('Shift');
        if (event.altKey) parts.push('Alt');

        // Handle special keys
        let key = event.key;
        if (key === ' ') key = 'Space';

        // Don't add modifier keys themselves
        if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
            parts.push(key);
        }

        return parts.join('+');
    }

    /**
     * Match shortcut
     * @param {string} normalizedKey - Normalized key
     * @returns {Object|null} Matched shortcut
     */
    function matchShortcut(normalizedKey) {
        const allShortcuts = [
            ...SHORTCUTS.global,
            ...SHORTCUTS.navigation,
            ...SHORTCUTS.playground
        ];

        for (const shortcut of allShortcuts) {
            if (shortcut.sequential) {
                // Handle sequential shortcuts (like 'g then h')
                if (state.sequentialKey && shortcut.keys.includes(state.sequentialKey)) {
                    // Check if current key matches the second key
                    const secondKey = shortcut.keys[1];
                    if (normalizedKey === secondKey) {
                        return shortcut;
                    }
                } else if (normalizedKey === shortcut.keys[0]) {
                    // Start sequential mode
                    state.sequentialKey = normalizedKey;

                    // Clear after timeout
                    clearTimeout(state.sequentialTimeout);
                    state.sequentialTimeout = setTimeout(() => {
                        state.sequentialKey = null;
                    }, 1000);

                    return null; // Don't trigger yet
                }
            } else {
                // Handle single key shortcuts
                if (shortcut.keys.includes(normalizedKey)) {
                    return shortcut;
                }
            }
        }

        return null;
    }

    // =========================
    // Keyboard Event Handler
    // =========================
    function handleKeyDown(event) {
        // Ignore if typing in input
        if (isInputElement(event.target) && !event.ctrlKey && !event.metaKey) {
            return;
        }

        const normalizedKey = normalizeKey(event);

        // Match shortcut
        const shortcut = matchShortcut(normalizedKey);

        if (shortcut) {
            // Execute action
            if (Actions[shortcut.action]) {
                event.preventDefault();
                Actions[shortcut.action]();

                // Clear sequential state
                state.sequentialKey = null;
                clearTimeout(state.sequentialTimeout);
            }
        }
    }

    // =========================
    // Help Modal
    // =========================

    /**
     * Create help modal HTML
     */
    function createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'keyboard-shortcuts-modal';
        modal.className = 'keyboard-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'keyboard-modal-title');
        modal.setAttribute('aria-modal', 'true');

        const allShortcuts = [
            ...SHORTCUTS.global,
            ...SHORTCUTS.navigation,
            ...SHORTCUTS.playground
        ];

        // Group by category
        const categories = {};
        allShortcuts.forEach(shortcut => {
            if (!categories[shortcut.category]) {
                categories[shortcut.category] = [];
            }
            categories[shortcut.category].push(shortcut);
        });

        let categoriesHTML = '';
        for (const [category, shortcuts] of Object.entries(categories)) {
            categoriesHTML += `
                <div class="shortcut-category">
                    <h3>${category}</h3>
                    <div class="shortcut-list">
                        ${shortcuts.map(s => `
                            <div class="shortcut-item">
                                <div class="shortcut-keys">
                                    ${s.keys.map((key, i) => `
                                        ${i > 0 ? (s.sequential ? '<span class="then">then</span>' : '<span class="or">or</span>') : ''}
                                        <kbd>${formatKey(key)}</kbd>
                                    `).join('')}
                                </div>
                                <div class="shortcut-description">${s.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="keyboard-modal-overlay"></div>
            <div class="keyboard-modal-content">
                <div class="keyboard-modal-header">
                    <h2 id="keyboard-modal-title">⌨️ Keyboard Shortcuts</h2>
                    <button class="modal-close" aria-label="Close shortcuts modal">✕</button>
                </div>
                <div class="keyboard-modal-body">
                    ${categoriesHTML}
                </div>
                <div class="keyboard-modal-footer">
                    <p>Press <kbd>?</kbd> to toggle this help • Press <kbd>Esc</kbd> to close</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', closeHelpModal);
        modal.querySelector('.keyboard-modal-overlay').addEventListener('click', closeHelpModal);

        return modal;
    }

    /**
     * Format key for display
     * @param {string} key - Key combination
     * @returns {string} Formatted key
     */
    function formatKey(key) {
        return key
            .replace(/Ctrl/g, '⌃')
            .replace(/Shift/g, '⇧')
            .replace(/Alt/g, '⌥')
            .replace(/Enter/g, '↵')
            .replace(/\+/g, ' + ');
    }

    /**
     * Toggle help modal
     */
    function toggleHelpModal() {
        if (state.helpModalOpen) {
            closeHelpModal();
        } else {
            openHelpModal();
        }
    }

    /**
     * Open help modal
     */
    function openHelpModal() {
        let modal = document.getElementById('keyboard-shortcuts-modal');

        if (!modal) {
            modal = createHelpModal();
        }

        modal.style.display = 'block';
        state.helpModalOpen = true;

        // Focus close button
        setTimeout(() => {
            modal.querySelector('.modal-close').focus();
        }, 100);

        // Announce to screen readers
        if (window.Toast) {
            // Use ARIA live region
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.textContent = 'Keyboard shortcuts modal opened';
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }
    }

    /**
     * Close help modal
     */
    function closeHelpModal() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        if (modal) {
            modal.style.display = 'none';
            state.helpModalOpen = false;
        }
    }

    // =========================
    // Initialization
    // =========================
    function init() {
        console.log('⌨️ Keyboard Shortcuts Initialized');

        // Bind keyboard event listener
        document.addEventListener('keydown', handleKeyDown);

        // Create help modal (but don't show it)
        createHelpModal();

        // Close modal on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.helpModalOpen) {
                e.preventDefault();
                closeHelpModal();
            }
        });
    }

    // Export public API
    window.KeyboardShortcuts = {
        showHelp: openHelpModal,
        closeHelp: closeHelpModal,
        toggleHelp: toggleHelpModal,
        init
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
