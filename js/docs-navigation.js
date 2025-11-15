/**
 * Documentation Navigation
 * - Table of contents generation
 * - Active section highlighting
 * - Anchor link generation
 * - Code copy buttons
 * - Smooth scrolling
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        tocSelector: '#toc-list',
        contentSelector: '.docs-content',
        headingSelectors: 'h2, h3',
        anchorIcon: '#',
        copyIcon: '📋',
        copiedIcon: '✓',
        copiedDuration: 2000,
        scrollOffset: 100
    };

    // State
    const state = {
        activeSection: null,
        observer: null,
        headings: []
    };

    // =========================
    // Table of Contents
    // =========================

    /**
     * Generate table of contents
     */
    function generateTOC() {
        const tocList = document.querySelector(CONFIG.tocSelector);
        const content = document.querySelector(CONFIG.contentSelector);

        if (!tocList || !content) {
            return;
        }

        const headings = content.querySelectorAll(CONFIG.headingSelectors);
        state.headings = Array.from(headings);

        if (headings.length === 0) {
            return;
        }

        const tocHTML = buildTOCStructure(headings);
        tocList.innerHTML = tocHTML;

        // Add click handlers
        tocList.querySelectorAll('.toc-link, .toc-sublink').forEach(link => {
            link.addEventListener('click', handleTOCClick);
        });

        console.log('[Docs] TOC generated with', headings.length, 'sections');
    }

    /**
     * Build TOC structure from headings
     * @param {NodeList} headings - List of heading elements
     * @returns {string} TOC HTML
     */
    function buildTOCStructure(headings) {
        let html = '';
        let currentH2 = null;
        let subItems = '';

        headings.forEach(heading => {
            const id = heading.id || generateId(heading.textContent);
            heading.id = id;

            if (heading.tagName === 'H2') {
                // Close previous H2 and its subitems
                if (currentH2 && subItems) {
                    html += `<ul class="toc-sublist">${subItems}</ul></li>`;
                    subItems = '';
                } else if (currentH2) {
                    html += '</li>';
                }

                // Start new H2
                html += `
                    <li class="toc-item">
                        <a href="#${id}" class="toc-link" data-target="${id}">
                            ${heading.textContent}
                        </a>
                `;
                currentH2 = heading;
            } else if (heading.tagName === 'H3') {
                // Add H3 as subitem
                subItems += `
                    <li class="toc-subitem">
                        <a href="#${id}" class="toc-sublink" data-target="${id}">
                            ${heading.textContent}
                        </a>
                    </li>
                `;
            }
        });

        // Close final H2
        if (currentH2 && subItems) {
            html += `<ul class="toc-sublist">${subItems}</ul></li>`;
        } else if (currentH2) {
            html += '</li>';
        }

        return html;
    }

    /**
     * Handle TOC link click
     * @param {Event} e - Click event
     */
    function handleTOCClick(e) {
        e.preventDefault();

        const targetId = e.currentTarget.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            scrollToElement(targetElement);
            // Update URL without triggering scroll
            history.pushState(null, '', `#${targetId}`);
        }
    }

    /**
     * Scroll to element smoothly
     * @param {HTMLElement} element - Target element
     */
    function scrollToElement(element) {
        const offset = CONFIG.scrollOffset;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // =========================
    // Active Section Highlighting
    // =========================

    /**
     * Initialize intersection observer for active section
     */
    function initActiveSection() {
        const options = {
            rootMargin: `-${CONFIG.scrollOffset}px 0px -66%`,
            threshold: 0
        };

        state.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, options);

        // Observe all headings
        state.headings.forEach(heading => {
            state.observer.observe(heading);
        });

        console.log('[Docs] Active section tracking initialized');
    }

    /**
     * Set active section in TOC
     * @param {string} sectionId - Section ID
     */
    function setActiveSection(sectionId) {
        if (state.activeSection === sectionId) {
            return;
        }

        state.activeSection = sectionId;

        // Remove all active classes
        document.querySelectorAll('.toc-link.active, .toc-sublink.active').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current section
        const activeLink = document.querySelector(`[data-target="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');

            // If it's a sublink, also highlight parent
            if (activeLink.classList.contains('toc-sublink')) {
                const parent = activeLink.closest('.toc-item');
                if (parent) {
                    const parentLink = parent.querySelector('.toc-link');
                    if (parentLink) {
                        parentLink.classList.add('active');
                    }
                }
            }
        }
    }

    // =========================
    // Anchor Links
    // =========================

    /**
     * Add anchor links to headings
     */
    function addAnchorLinks() {
        const content = document.querySelector(CONFIG.contentSelector);
        if (!content) return;

        const headings = content.querySelectorAll('h2, h3, h4');

        headings.forEach(heading => {
            // Ensure heading has an ID
            if (!heading.id) {
                heading.id = generateId(heading.textContent);
            }

            // Create anchor link
            const anchor = document.createElement('a');
            anchor.className = 'anchor-link';
            anchor.href = `#${heading.id}`;
            anchor.textContent = CONFIG.anchorIcon;
            anchor.setAttribute('aria-label', `Link to ${heading.textContent}`);

            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                scrollToElement(heading);
                history.pushState(null, '', `#${heading.id}`);

                // Copy link to clipboard
                const url = window.location.href.split('#')[0] + '#' + heading.id;
                navigator.clipboard.writeText(url).then(() => {
                    if (window.Toast) {
                        window.Toast.success('Link copied to clipboard');
                    }
                }).catch(err => {
                    console.error('[Docs] Failed to copy link:', err);
                });
            });

            heading.insertBefore(anchor, heading.firstChild);
        });

        console.log('[Docs] Anchor links added to', headings.length, 'headings');
    }

    // =========================
    // Code Copy Buttons
    // =========================

    /**
     * Add copy buttons to code blocks
     */
    function addCodeCopyButtons() {
        const codeBlocks = document.querySelectorAll('.docs-code-block pre');

        codeBlocks.forEach(block => {
            const parent = block.parentElement;

            // Skip if button already exists
            if (parent.querySelector('.code-copy-btn')) {
                return;
            }

            // Get or create code header
            let header = parent.querySelector('.code-header');
            if (!header) {
                header = document.createElement('div');
                header.className = 'code-header';
                parent.insertBefore(header, block);

                // Add language label
                const code = block.querySelector('code');
                const language = code ? code.className.replace('language-', '') : 'code';
                const langLabel = document.createElement('span');
                langLabel.className = 'code-language';
                langLabel.textContent = language;
                header.appendChild(langLabel);
            }

            // Create copy button
            const button = document.createElement('button');
            button.className = 'code-copy-btn';
            button.innerHTML = `<span>${CONFIG.copyIcon}</span> Copy`;
            button.setAttribute('aria-label', 'Copy code');

            button.addEventListener('click', () => {
                const code = block.textContent;

                navigator.clipboard.writeText(code).then(() => {
                    button.classList.add('copied');
                    button.innerHTML = `<span>${CONFIG.copiedIcon}</span> Copied!`;

                    if (window.Toast) {
                        window.Toast.success('Code copied to clipboard');
                    }

                    setTimeout(() => {
                        button.classList.remove('copied');
                        button.innerHTML = `<span>${CONFIG.copyIcon}</span> Copy`;
                    }, CONFIG.copiedDuration);
                }).catch(err => {
                    console.error('[Docs] Failed to copy code:', err);
                    if (window.Toast) {
                        window.Toast.error('Failed to copy code');
                    }
                });
            });

            header.appendChild(button);
        });

        console.log('[Docs] Copy buttons added to', codeBlocks.length, 'code blocks');
    }

    // =========================
    // Utility Functions
    // =========================

    /**
     * Generate ID from text
     * @param {string} text - Text to convert to ID
     * @returns {string} Generated ID
     */
    function generateId(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    }

    /**
     * Handle initial hash navigation
     */
    function handleInitialHash() {
        const hash = window.location.hash;
        if (hash) {
            const targetId = hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Wait for page load
                setTimeout(() => {
                    scrollToElement(targetElement);
                    setActiveSection(targetId);
                }, 100);
            }
        }
    }

    /**
     * Handle hash change
     */
    function handleHashChange() {
        const hash = window.location.hash;
        if (hash) {
            const targetId = hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                scrollToElement(targetElement);
            }
        }
    }

    // =========================
    // Search Functionality (Placeholder)
    // =========================

    /**
     * Initialize documentation search
     */
    function initSearch() {
        const searchInput = document.getElementById('docs-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();

            if (query.length < 2) {
                // Clear search results
                return;
            }

            // Basic search implementation
            // This is a placeholder for future advanced search
            const results = searchContent(query);
            console.log('[Docs] Search results:', results.length);

            if (window.Toast && results.length > 0) {
                window.Toast.info(`Found ${results.length} results`);
            }
        });
    }

    /**
     * Search documentation content
     * @param {string} query - Search query
     * @returns {Array} Search results
     */
    function searchContent(query) {
        const content = document.querySelector(CONFIG.contentSelector);
        if (!content) return [];

        const results = [];
        const sections = content.querySelectorAll('.docs-section');

        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            if (text.includes(query)) {
                const heading = section.querySelector('h2, h3, h4');
                results.push({
                    id: section.id || heading?.id,
                    title: heading?.textContent || 'Untitled',
                    excerpt: text.substring(0, 200)
                });
            }
        });

        return results;
    }

    // =========================
    // Keyboard Navigation
    // =========================

    /**
     * Initialize keyboard navigation
     */
    function initKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Alt + Up/Down to navigate sections
            if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                navigateSection(e.key === 'ArrowUp' ? -1 : 1);
            }
        });
    }

    /**
     * Navigate to next/previous section
     * @param {number} direction - Direction (-1 for up, 1 for down)
     */
    function navigateSection(direction) {
        if (state.headings.length === 0) return;

        const currentIndex = state.headings.findIndex(h => h.id === state.activeSection);
        const nextIndex = currentIndex + direction;

        if (nextIndex >= 0 && nextIndex < state.headings.length) {
            const nextHeading = state.headings[nextIndex];
            scrollToElement(nextHeading);
            history.pushState(null, '', `#${nextHeading.id}`);
        }
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize documentation navigation
     */
    function init() {
        console.log('📚 Documentation Navigation Initialized');

        // Generate TOC
        generateTOC();

        // Add anchor links
        addAnchorLinks();

        // Add code copy buttons
        addCodeCopyButtons();

        // Initialize active section tracking
        if (state.headings.length > 0) {
            initActiveSection();
        }

        // Handle initial hash
        handleInitialHash();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Initialize search
        initSearch();

        // Initialize keyboard navigation
        initKeyboardNav();
    }

    // =========================
    // Public API
    // =========================
    window.DocsNavigation = {
        init,
        scrollToElement,
        generateTOC,
        setActiveSection
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
