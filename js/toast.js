/**
 * Toast Notification System
 * Professional, accessible toast notifications for user feedback
 */

(function() {
    'use strict';

    // Toast configuration
    const CONFIG = {
        duration: 5000, // Default duration in ms
        maxToasts: 3, // Maximum number of toasts to show simultaneously
        position: 'bottom-right', // Position of toast container
        animations: true // Enable/disable animations
    };

    // Toast types with their icons and colors
    const TOAST_TYPES = {
        success: {
            icon: '✓',
            class: 'toast-success',
            ariaRole: 'status'
        },
        error: {
            icon: '✕',
            class: 'toast-error',
            ariaRole: 'alert'
        },
        warning: {
            icon: '⚠',
            class: 'toast-warning',
            ariaRole: 'alert'
        },
        info: {
            icon: 'ℹ',
            class: 'toast-info',
            ariaRole: 'status'
        }
    };

    // Toast container
    let toastContainer = null;
    let toastCount = 0;

    /**
     * Initialize toast container
     */
    function initToastContainer() {
        if (toastContainer) return;

        toastContainer = document.createElement('div');
        toastContainer.className = `toast-container toast-${CONFIG.position}`;
        toastContainer.setAttribute('aria-live', 'polite');
        toastContainer.setAttribute('aria-atomic', 'false');
        document.body.appendChild(toastContainer);
    }

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {Object} options - Additional options
     * @returns {HTMLElement} Toast element
     */
    function showToast(message, type = 'info', options = {}) {
        initToastContainer();

        // Validate type
        if (!TOAST_TYPES[type]) {
            console.warn(`Invalid toast type: ${type}. Using 'info' instead.`);
            type = 'info';
        }

        const toastConfig = TOAST_TYPES[type];
        const duration = options.duration !== undefined ? options.duration : CONFIG.duration;
        const action = options.action || null;
        const onAction = options.onAction || null;

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${toastConfig.class}`;
        toast.setAttribute('role', toastConfig.ariaRole);
        toast.setAttribute('aria-live', toastConfig.ariaRole === 'alert' ? 'assertive' : 'polite');

        // Toast content
        const content = document.createElement('div');
        content.className = 'toast-content';

        // Icon
        const icon = document.createElement('span');
        icon.className = 'toast-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = toastConfig.icon;

        // Message
        const messageEl = document.createElement('span');
        messageEl.className = 'toast-message';
        messageEl.textContent = message;

        content.appendChild(icon);
        content.appendChild(messageEl);

        // Action button (optional)
        if (action && onAction) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'toast-action';
            actionBtn.textContent = action;
            actionBtn.setAttribute('aria-label', action);
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onAction();
                dismissToast(toast);
            });
            content.appendChild(actionBtn);
        }

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.setAttribute('aria-label', 'Dismiss notification');
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissToast(toast);
        });

        toast.appendChild(content);
        toast.appendChild(closeBtn);

        // Add to container
        toastContainer.appendChild(toast);
        toastCount++;

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        // Remove old toasts if exceeding max
        removeExcessToasts();

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                dismissToast(toast);
            }, duration);
        }

        // Keyboard support
        document.addEventListener('keydown', handleEscapeKey);

        return toast;
    }

    /**
     * Dismiss a toast
     * @param {HTMLElement} toast - Toast element to dismiss
     */
    function dismissToast(toast) {
        if (!toast || !toast.parentElement) return;

        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');

        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
                toastCount--;

                // Remove container if no toasts left
                if (toastCount === 0 && toastContainer) {
                    document.removeEventListener('keydown', handleEscapeKey);
                }
            }
        }, 300); // Match CSS animation duration
    }

    /**
     * Remove excess toasts (keep only max number)
     */
    function removeExcessToasts() {
        if (!toastContainer) return;

        const toasts = toastContainer.querySelectorAll('.toast');
        if (toasts.length > CONFIG.maxToasts) {
            const toastsToRemove = Array.from(toasts).slice(0, toasts.length - CONFIG.maxToasts);
            toastsToRemove.forEach(toast => dismissToast(toast));
        }
    }

    /**
     * Handle Escape key to dismiss all toasts
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            dismissAllToasts();
        }
    }

    /**
     * Dismiss all toasts
     */
    function dismissAllToasts() {
        if (!toastContainer) return;

        const toasts = toastContainer.querySelectorAll('.toast');
        toasts.forEach(toast => dismissToast(toast));
    }

    /**
     * Update toast configuration
     * @param {Object} newConfig - New configuration options
     */
    function configure(newConfig) {
        Object.assign(CONFIG, newConfig);
    }

    // Expose global API
    window.Toast = {
        show: showToast,
        success: (message, options) => showToast(message, 'success', options),
        error: (message, options) => showToast(message, 'error', options),
        warning: (message, options) => showToast(message, 'warning', options),
        info: (message, options) => showToast(message, 'info', options),
        dismiss: dismissToast,
        dismissAll: dismissAllToasts,
        configure: configure
    };

    // Alternative window API
    window.showToast = showToast;

    console.log('[Toast] Notification system initialized');

})();
