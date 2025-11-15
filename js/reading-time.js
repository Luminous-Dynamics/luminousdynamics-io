/**
 * Reading Time Estimator
 * - Calculates reading time for documentation pages
 * - Words per minute: ~200-250
 * - Visual time indicator
 * - Auto-display at top of content
 * - Accessible and responsive
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        wordsPerMinute: 225, // Average reading speed
        codeWordsPerMinute: 100, // Slower for code blocks
        selectors: {
            content: 'main, article, .documentation-content, #main-content',
            codeBlocks: 'pre code',
            insertionPoint: 'h1, .page-title, .doc-title'
        },
        minWordCount: 100, // Minimum words to show reading time
        roundToNearest: 1, // Round to nearest minute
        formats: {
            short: '{time} min read',
            long: '📖 {time} minute read'
        }
    };

    // State
    const state = {
        readingTimeElement: null,
        wordCount: 0,
        readingTime: 0
    };

    // =========================
    // Reading Time Calculation
    // =========================

    /**
     * Count words in text
     * @param {string} text - Text to count words in
     * @returns {number} Word count
     */
    function countWords(text) {
        if (!text || !text.trim()) {
            return 0;
        }

        // Remove extra whitespace and split by words
        const words = text
            .trim()
            .replace(/\s+/g, ' ')
            .split(' ')
            .filter(word => word.length > 0);

        return words.length;
    }

    /**
     * Get text content from element
     * @param {HTMLElement} element - Element to get text from
     * @param {boolean} excludeCode - Whether to exclude code blocks
     * @returns {string} Text content
     */
    function getTextContent(element, excludeCode = false) {
        const clone = element.cloneNode(true);

        if (excludeCode) {
            // Remove code blocks
            const codeBlocks = clone.querySelectorAll('pre, code');
            codeBlocks.forEach(block => block.remove());
        }

        // Remove scripts and styles
        const scripts = clone.querySelectorAll('script, style');
        scripts.forEach(script => script.remove());

        return clone.textContent || clone.innerText || '';
    }

    /**
     * Calculate reading time for content
     * @param {HTMLElement} contentElement - Content element
     * @returns {Object} Reading time data
     */
    function calculateReadingTime(contentElement) {
        // Get regular text (excluding code)
        const regularText = getTextContent(contentElement, true);
        const regularWords = countWords(regularText);

        // Get code blocks text
        const codeBlocks = contentElement.querySelectorAll(CONFIG.selectors.codeBlocks);
        let codeWords = 0;

        codeBlocks.forEach(codeBlock => {
            const codeText = codeBlock.textContent || codeBlock.innerText || '';
            codeWords += countWords(codeText);
        });

        // Calculate reading time
        const regularMinutes = regularWords / CONFIG.wordsPerMinute;
        const codeMinutes = codeWords / CONFIG.codeWordsPerMinute;
        const totalMinutes = regularMinutes + codeMinutes;

        // Round to nearest minute
        const roundedMinutes = Math.max(1, Math.round(totalMinutes / CONFIG.roundToNearest) * CONFIG.roundToNearest);

        return {
            wordCount: regularWords + codeWords,
            regularWords,
            codeWords,
            minutes: roundedMinutes,
            exactMinutes: totalMinutes
        };
    }

    // =========================
    // Display
    // =========================

    /**
     * Create reading time element
     * @param {number} minutes - Reading time in minutes
     * @param {number} wordCount - Total word count
     * @returns {HTMLElement} Reading time element
     */
    function createReadingTimeElement(minutes, wordCount) {
        const container = document.createElement('div');
        container.className = 'reading-time-container';
        container.setAttribute('role', 'status');
        container.setAttribute('aria-label', `Estimated reading time: ${minutes} minutes`);

        const format = minutes <= 3 ? CONFIG.formats.short : CONFIG.formats.long;
        const timeText = format.replace('{time}', minutes);

        container.innerHTML = `
            <div class="reading-time">
                <span class="reading-time-icon" aria-hidden="true">📖</span>
                <span class="reading-time-text">${timeText}</span>
                <span class="reading-time-words" title="${wordCount.toLocaleString()} words">${formatWordCount(wordCount)}</span>
            </div>
        `;

        return container;
    }

    /**
     * Format word count for display
     * @param {number} count - Word count
     * @returns {string} Formatted count
     */
    function formatWordCount(count) {
        if (count < 1000) {
            return `${count} words`;
        } else if (count < 10000) {
            return `${(count / 1000).toFixed(1)}k words`;
        } else {
            return `${Math.round(count / 1000)}k words`;
        }
    }

    /**
     * Insert reading time element
     * @param {HTMLElement} element - Reading time element
     */
    function insertReadingTime(element) {
        // Find insertion point
        const insertionPoint = document.querySelector(CONFIG.selectors.insertionPoint);

        if (insertionPoint) {
            // Insert after title
            insertionPoint.insertAdjacentElement('afterend', element);
        } else {
            // Fallback: insert at beginning of content
            const content = findContentElement();
            if (content && content.firstChild) {
                content.insertBefore(element, content.firstChild);
            }
        }

        state.readingTimeElement = element;
    }

    /**
     * Update reading time display
     */
    function updateReadingTime() {
        const contentElement = findContentElement();

        if (!contentElement) {
            console.log('[Reading Time] No content element found');
            return;
        }

        const data = calculateReadingTime(contentElement);

        // Only show if word count is above minimum
        if (data.wordCount < CONFIG.minWordCount) {
            console.log(`[Reading Time] Content too short (${data.wordCount} words < ${CONFIG.minWordCount} minimum)`);
            return;
        }

        state.wordCount = data.wordCount;
        state.readingTime = data.minutes;

        // Remove existing reading time if present
        const existing = document.querySelector('.reading-time-container');
        if (existing) {
            existing.remove();
        }

        // Create and insert new reading time
        const element = createReadingTimeElement(data.minutes, data.wordCount);
        insertReadingTime(element);

        console.log(`[Reading Time] ${data.minutes} min (${data.wordCount} words: ${data.regularWords} regular + ${data.codeWords} code)`);
    }

    /**
     * Find main content element
     * @returns {HTMLElement|null} Content element
     */
    function findContentElement() {
        const selectors = CONFIG.selectors.content.split(',').map(s => s.trim());

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        }

        return null;
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize reading time estimator
     */
    function init() {
        console.log('📖 Reading Time Estimator Initialized');

        // Wait for content to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateReadingTime);
        } else {
            // Small delay to ensure all content is rendered
            setTimeout(updateReadingTime, 100);
        }

        // Watch for content changes
        if (window.MutationObserver) {
            const observer = new MutationObserver(() => {
                // Debounce updates
                clearTimeout(state.updateTimeout);
                state.updateTimeout = setTimeout(updateReadingTime, 500);
            });

            const contentElement = findContentElement();
            if (contentElement) {
                observer.observe(contentElement, {
                    childList: true,
                    subtree: true
                });
            }
        }

        // Inject styles
        injectStyles();
    }

    /**
     * Inject required styles
     */
    function injectStyles() {
        if (document.getElementById('reading-time-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'reading-time-styles';
        style.textContent = `
            .reading-time-container {
                margin: 1.5rem 0;
                padding: 0;
            }

            .reading-time {
                display: inline-flex;
                align-items: center;
                gap: 0.625rem;
                padding: 0.625rem 1rem;
                background: rgba(0, 229, 255, 0.05);
                border: 1px solid rgba(0, 229, 255, 0.15);
                border-radius: 8px;
                font-size: 0.9rem;
                color: var(--text-secondary, #a8b2c1);
            }

            .reading-time-icon {
                font-size: 1.125rem;
                line-height: 1;
            }

            .reading-time-text {
                font-weight: 500;
                color: var(--text-primary, #e8eaed);
            }

            .reading-time-words {
                font-size: 0.8125rem;
                color: var(--text-tertiary, #6c757d);
                border-left: 1px solid var(--border-secondary, rgba(255, 255, 255, 0.05));
                padding-left: 0.625rem;
                margin-left: 0.125rem;
            }

            /* Mobile responsive */
            @media (max-width: 640px) {
                .reading-time {
                    font-size: 0.8125rem;
                    padding: 0.5rem 0.75rem;
                }

                .reading-time-icon {
                    font-size: 1rem;
                }

                .reading-time-words {
                    display: none;
                }
            }

            /* Print styles */
            @media print {
                .reading-time-container {
                    display: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // =========================
    // Public API
    // =========================
    window.ReadingTime = {
        init,
        update: updateReadingTime,
        calculate: calculateReadingTime,
        getWordCount: () => state.wordCount,
        getReadingTime: () => state.readingTime
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
