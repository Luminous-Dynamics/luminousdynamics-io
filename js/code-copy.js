/**
 * Enhanced Code Copy Functionality
 * - Adds copy buttons to all code blocks
 * - Success feedback animation
 * - Clipboard API with fallback
 * - Toast notification integration
 * - Keyboard shortcut support
 * - Accessible and responsive
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        buttonText: 'Copy',
        copiedText: 'Copied!',
        copyTimeout: 2000, // Reset button after 2 seconds
        buttonPosition: 'top-right', // or 'top-left'
        showToast: true,
        selectors: {
            codeBlocks: 'pre code',
            existingButtons: '[data-copy-code]'
        }
    };

    // State
    const state = {
        buttons: new Map(),
        copyTimeouts: new Map()
    };

    // =========================
    // Copy Button Creation
    // =========================

    /**
     * Create copy button for code block
     * @param {HTMLElement} codeBlock - Code block element
     * @returns {HTMLButtonElement} Copy button
     */
    function createCopyButton(codeBlock) {
        const button = document.createElement('button');
        button.className = 'code-copy-btn';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', 'Copy code to clipboard');
        button.setAttribute('data-copy-code', '');

        // Button content
        button.innerHTML = `
            <svg class="code-copy-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M5.75 4.75H10.25V1.75H5.75V4.75ZM4.5 1.75C4.5 1.05964 5.05964 0.5 5.75 0.5H10.25C10.9404 0.5 11.5 1.05964 11.5 1.75V4.75H13.25C13.9404 4.75 14.5 5.30964 14.5 6V14C14.5 14.6904 13.9404 15.25 13.25 15.25H2.75C2.05964 15.25 1.5 14.6904 1.5 14V6C1.5 5.30964 2.05964 4.75 2.75 4.75H4.5V1.75Z" fill="currentColor"/>
            </svg>
            <span class="code-copy-text">${CONFIG.buttonText}</span>
        `;

        // Add click handler
        button.addEventListener('click', () => handleCopy(codeBlock, button));

        return button;
    }

    /**
     * Add copy button to code block
     * @param {HTMLElement} preElement - Pre element containing code
     */
    function addCopyButton(preElement) {
        // Skip if button already exists
        if (preElement.querySelector('[data-copy-code]')) {
            return;
        }

        // Ensure pre element is positioned
        const position = window.getComputedStyle(preElement).position;
        if (position === 'static') {
            preElement.style.position = 'relative';
        }

        const codeBlock = preElement.querySelector('code');
        if (!codeBlock) {
            return;
        }

        const button = createCopyButton(codeBlock);
        preElement.appendChild(button);

        state.buttons.set(codeBlock, button);
    }

    // =========================
    // Copy Functionality
    // =========================

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async function copyToClipboard(text) {
        // Try Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.warn('[Code Copy] Clipboard API failed, using fallback:', err);
            }
        }

        // Fallback to execCommand
        return copyToClipboardFallback(text);
    }

    /**
     * Fallback copy method using execCommand
     * @param {string} text - Text to copy
     * @returns {boolean} Success status
     */
    function copyToClipboardFallback(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        textarea.setAttribute('readonly', '');

        document.body.appendChild(textarea);

        try {
            textarea.select();
            textarea.setSelectionRange(0, text.length);

            const success = document.execCommand('copy');
            document.body.removeChild(textarea);

            return success;
        } catch (err) {
            console.error('[Code Copy] Fallback copy failed:', err);
            document.body.removeChild(textarea);
            return false;
        }
    }

    /**
     * Get code text from element
     * @param {HTMLElement} codeBlock - Code block element
     * @returns {string} Code text
     */
    function getCodeText(codeBlock) {
        // Clone the code block to avoid modifying the original
        const clone = codeBlock.cloneNode(true);

        // Remove line number elements if present
        const lineNumbers = clone.querySelectorAll('.line-number, .line-numbers-rows');
        lineNumbers.forEach(el => el.remove());

        // Remove any copy buttons that might be inside
        const buttons = clone.querySelectorAll('[data-copy-code]');
        buttons.forEach(btn => btn.remove());

        // Get text content
        return clone.textContent || clone.innerText || '';
    }

    /**
     * Handle copy button click
     * @param {HTMLElement} codeBlock - Code block element
     * @param {HTMLButtonElement} button - Copy button
     */
    async function handleCopy(codeBlock, button) {
        const code = getCodeText(codeBlock);

        if (!code.trim()) {
            console.warn('[Code Copy] No code to copy');
            return;
        }

        // Attempt to copy
        const success = await copyToClipboard(code);

        if (success) {
            showCopySuccess(button);

            // Show toast notification
            if (CONFIG.showToast && window.Toast) {
                window.Toast.success('Code copied to clipboard!');
            }

            // Track analytics
            if (window.Analytics) {
                window.Analytics.track('code_copied', {
                    length: code.length,
                    language: codeBlock.className.match(/language-(\w+)/)?.[1] || 'unknown'
                });
            }

            console.log('[Code Copy] Copied successfully');
        } else {
            showCopyError(button);

            if (CONFIG.showToast && window.Toast) {
                window.Toast.error('Failed to copy code');
            }

            console.error('[Code Copy] Copy failed');
        }
    }

    /**
     * Show copy success feedback
     * @param {HTMLButtonElement} button - Copy button
     */
    function showCopySuccess(button) {
        const textElement = button.querySelector('.code-copy-text');
        const iconElement = button.querySelector('.code-copy-icon');

        // Update button state
        button.classList.add('copied');
        button.setAttribute('aria-label', 'Code copied to clipboard');

        // Update text
        if (textElement) {
            textElement.textContent = CONFIG.copiedText;
        }

        // Update icon to checkmark
        if (iconElement) {
            iconElement.innerHTML = `
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" fill="currentColor"/>
            `;
        }

        // Clear existing timeout
        const existingTimeout = state.copyTimeouts.get(button);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // Reset after delay
        const timeout = setTimeout(() => {
            resetButton(button);
            state.copyTimeouts.delete(button);
        }, CONFIG.copyTimeout);

        state.copyTimeouts.set(button, timeout);
    }

    /**
     * Show copy error feedback
     * @param {HTMLButtonElement} button - Copy button
     */
    function showCopyError(button) {
        button.classList.add('copy-error');

        setTimeout(() => {
            button.classList.remove('copy-error');
        }, 1000);
    }

    /**
     * Reset button to original state
     * @param {HTMLButtonElement} button - Copy button
     */
    function resetButton(button) {
        const textElement = button.querySelector('.code-copy-text');
        const iconElement = button.querySelector('.code-copy-icon');

        button.classList.remove('copied');
        button.setAttribute('aria-label', 'Copy code to clipboard');

        if (textElement) {
            textElement.textContent = CONFIG.buttonText;
        }

        if (iconElement) {
            iconElement.innerHTML = `
                <path d="M5.75 4.75H10.25V1.75H5.75V4.75ZM4.5 1.75C4.5 1.05964 5.05964 0.5 5.75 0.5H10.25C10.9404 0.5 11.5 1.75V4.75H13.25C13.9404 4.75 14.5 5.30964 14.5 6V14C14.5 14.6904 13.9404 15.25 13.25 15.25H2.75C2.05964 15.25 1.5 14.6904 1.5 14V6C1.5 5.30964 2.05964 4.75 2.75 4.75H4.5V1.75Z" fill="currentColor"/>
            `;
        }
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize code copy buttons
     */
    function init() {
        console.log('📋 Code Copy Initialized');

        // Find all code blocks
        const codeBlocks = document.querySelectorAll('pre');

        codeBlocks.forEach(preElement => {
            addCopyButton(preElement);
        });

        console.log(`[Code Copy] Added copy buttons to ${codeBlocks.length} code blocks`);

        // Watch for dynamically added code blocks
        if (window.MutationObserver) {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'PRE') {
                                addCopyButton(node);
                            } else {
                                const preElements = node.querySelectorAll('pre');
                                preElements.forEach(addCopyButton);
                            }
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Add copy button to specific element
     * @param {HTMLElement} element - Pre element
     */
    function addButtonTo(element) {
        addCopyButton(element);
    }

    // =========================
    // Styles
    // =========================

    /**
     * Inject required styles
     */
    function injectStyles() {
        if (document.getElementById('code-copy-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'code-copy-styles';
        style.textContent = `
            .code-copy-btn {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.375rem;
                padding: 0.375rem 0.75rem;
                background: var(--bg-secondary, #0f1116);
                border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
                border-radius: 6px;
                color: var(--text-secondary, #a8b2c1);
                font-size: 0.8125rem;
                font-family: inherit;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 10;
                opacity: 0.7;
            }

            .code-copy-btn:hover {
                opacity: 1;
                background: var(--bg-tertiary, #1a1c22);
                border-color: var(--accent-primary, #00e5ff);
                color: var(--accent-primary, #00e5ff);
                transform: translateY(-1px);
            }

            .code-copy-btn:active {
                transform: translateY(0);
            }

            .code-copy-btn.copied {
                background: rgba(0, 255, 136, 0.1);
                border-color: #00ff88;
                color: #00ff88;
            }

            .code-copy-btn.copy-error {
                background: rgba(255, 68, 68, 0.1);
                border-color: #ff4444;
                color: #ff4444;
            }

            .code-copy-icon {
                flex-shrink: 0;
            }

            .code-copy-text {
                white-space: nowrap;
            }

            /* Hide button text on small screens */
            @media (max-width: 640px) {
                .code-copy-text {
                    display: none;
                }

                .code-copy-btn {
                    padding: 0.5rem;
                }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .code-copy-btn {
                    transition: none;
                }
            }

            /* Focus styles */
            .code-copy-btn:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.3);
            }

            .code-copy-btn:focus:not(:focus-visible) {
                box-shadow: none;
            }

            .code-copy-btn:focus-visible {
                box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.3);
            }
        `;

        document.head.appendChild(style);
    }

    // =========================
    // Public API
    // =========================
    window.CodeCopy = {
        init,
        addButtonTo,
        copyToClipboard
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectStyles();
            init();
        });
    } else {
        injectStyles();
        init();
    }

})();
