/**
 * Luminous Dynamics Developer Portal - Interactive JavaScript
 * Professional, Fast, Accessible Interactions
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        activityUpdateInterval: 7000,
        statusCheckInterval: 30000,
        playgroundRunDelay: 1000,
        copyFeedbackDuration: 2000
    };

    // State management
    const state = {
        activityInterval: null,
        statusInterval: null,
        statsAnimated: false
    };

    // =========================
    // Playground Examples Data
    // =========================
    const playgroundExamples = {
        terra: {
            name: 'Terra Atlas',
            code: `// Terra Atlas - Find renewable energy sites
const response = await fetch('https://api.luminousdynamics.io/v1/sites', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer demo_key_xyz',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'solar',
    minCapacity: 1000, // kW
    location: {
      lat: 40.7128,
      lng: -74.0060,
      radius: 50 // km
    }
  })
});

const data = await response.json();
console.log(data);`,
            response: `{
  "status": "success",
  "data": {
    "sites": [
      {
        "id": "site_001",
        "name": "Brooklyn Solar Garden",
        "type": "solar",
        "capacity": 2500,
        "location": {
          "lat": 40.6782,
          "lng": -73.9442
        },
        "metrics": {
          "roi": "14.2%",
          "co2_offset": "1,250 tons/year"
        }
      }
    ],
    "total": 17,
    "page": 1
  },
  "meta": {
    "response_time": "12ms",
    "api_version": "1.0"
  }
}`
        },
        nix: {
            name: 'Luminous Nix',
            code: `// Luminous Nix - Natural language NixOS operations
const nix = new LuminousNix({
  apiKey: 'demo_key_xyz'
});

// Install a package using natural language
const result = await nix.execute({
  query: "install firefox with privacy extensions",
  dryRun: true // Preview changes before applying
});

console.log('Operation:', result.operation);
console.log('Commands:', result.commands);
console.log('Success:', result.success);`,
            response: `{
  "operation": "install_package",
  "query": "install firefox with privacy extensions",
  "commands": [
    "nix-env -iA nixos.firefox",
    "firefox --install-addon uBlock-origin",
    "firefox --install-addon privacy-badger"
  ],
  "preview": "Will install: firefox-120.0, uBlock Origin, Privacy Badger",
  "success": true,
  "confidence": 0.98,
  "meta": {
    "response_time": "45ms",
    "model": "hrm-nixos-v2"
  }
}`
        },
        bridge: {
            name: 'Sacred Bridge',
            code: `// Sacred Bridge - Service coordination bus
const bridge = new SacredBridge();

// Subscribe to consciousness field events
bridge.subscribe('field.coherence', (event) => {
  console.log('Coherence level:', event.level);
  console.log('Connected services:', event.services);
});

// Emit an intention
bridge.emit('intention.set', {
  service: 'terra-atlas',
  intention: 'find_sustainable_projects',
  parameters: {
    minROI: 0.12,
    maxRisk: 'medium'
  }
});`,
            response: `{
  "event": "intention.acknowledged",
  "data": {
    "id": "intent_7f3a",
    "services_responding": [
      "terra-atlas",
      "luminous-analyzer",
      "sacred-validator"
    ],
    "coherence_level": 0.87,
    "field_strength": "strong",
    "estimated_completion": "250ms"
  },
  "meta": {
    "timestamp": "2025-01-17T15:23:45.123Z",
    "propagation_time": "1.2ms"
  }
}`
        }
    };

    // =========================
    // Activity Feed Data
    // =========================
    const activityTypes = [
        { icon: '⚡', class: 'commit', title: 'New commit to {repo}', repos: ['luminous-nix', 'terra-atlas', 'sacred-bridge'] },
        { icon: '🚀', class: 'release', title: '{repo} v{version} released', repos: ['Terra Atlas', 'Luminous Nix', 'Mycelix'] },
        { icon: '🔀', class: 'pr', title: 'PR merged: {feature}', features: ['Add GraphQL support', 'Improve performance', 'Fix memory leak'] },
        { icon: '⭐', class: 'star', title: '{repo} reached {count} stars', repos: ['luminous-nix', 'terra-atlas'], counts: [1000, 2000, 5000] }
    ];

    // =========================
    // Utility Functions
    // =========================

    /**
     * Safely query selector
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {Element|null}
     */
    function $(selector, parent = document) {
        return parent.querySelector(selector);
    }

    /**
     * Safely query selector all
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {NodeList}
     */
    function $$(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    /**
     * Smooth scroll to section
     * @param {string} sectionId - ID of the section to scroll to
     */
    function scrollToSection(sectionId) {
        const element = $(`#${sectionId}`);
        if (!element) return;

        const header = $('.site-header');
        if (!header) {
            element.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const headerHeight = header.offsetHeight;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Highlight code using Prism
     * @param {Element} element - Code element to highlight
     */
    function highlightCode(element) {
        if (window.Prism && element) {
            Prism.highlightElement(element);
        }
    }

    // =========================
    // Scroll Buttons Handler
    // =========================
    function initScrollButtons() {
        const scrollButtons = $$('[data-scroll-to]');
        scrollButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = button.getAttribute('data-scroll-to');
                scrollToSection(sectionId);
            });
        });
    }

    // =========================
    // Smooth Anchor Links
    // =========================
    function initSmoothScrolling() {
        const anchorLinks = $$('a[href^="#"]');
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const targetId = href.substring(1);
                const target = $(`#${targetId}`);
                if (target) {
                    scrollToSection(targetId);
                }
            });
        });
    }

    // =========================
    // Playground Tab Switching
    // =========================
    function initPlaygroundTabs() {
        const tabs = $$('.playground-tabs .tab');
        const codeElement = $('#playground-code');
        const outputElement = $('#playground-output');
        const contentPanel = $('#playground-content');

        tabs.forEach((tab, index) => {
            // Click handler
            tab.addEventListener('click', () => switchTab(tab));

            // Keyboard navigation
            tab.addEventListener('keydown', (e) => {
                let newIndex = index;

                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    newIndex = (index + 1) % tabs.length;
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    newIndex = (index - 1 + tabs.length) % tabs.length;
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    newIndex = 0;
                } else if (e.key === 'End') {
                    e.preventDefault();
                    newIndex = tabs.length - 1;
                }

                if (newIndex !== index) {
                    tabs[newIndex].click();
                    tabs[newIndex].focus();
                }
            });
        });

        function switchTab(activeTab) {
            if (!codeElement || !outputElement) return;

            // Update tab states
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });

            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
            activeTab.setAttribute('tabindex', '0');

            // Update content panel
            if (contentPanel) {
                contentPanel.setAttribute('aria-labelledby', activeTab.id);
            }

            // Update playground content
            const api = activeTab.getAttribute('data-api');
            const example = playgroundExamples[api];

            if (example) {
                codeElement.textContent = example.code;
                outputElement.textContent = example.response;

                // Re-highlight syntax
                highlightCode(codeElement);
                highlightCode(outputElement);
            }
        }
    }

    // =========================
    // Copy to Clipboard
    // =========================
    function initCopyButtons() {
        const copyButtons = $$('[data-copy-code]');
        copyButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const codeElement = $('#playground-code');
                if (!codeElement) return;

                const text = codeElement.textContent;

                try {
                    await navigator.clipboard.writeText(text);
                    showCopyFeedback(button, true);
                } catch (err) {
                    console.error('Failed to copy:', err);
                    showCopyFeedback(button, false);
                }
            });
        });
    }

    /**
     * Show visual feedback for copy action
     * @param {Element} button - Copy button element
     * @param {boolean} success - Whether copy was successful
     */
    function showCopyFeedback(button, success) {
        const originalText = button.textContent;
        const originalBg = button.style.background;

        button.textContent = success ? 'Copied!' : 'Failed';
        button.style.background = success ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 23, 68, 0.1)';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBg;
        }, CONFIG.copyFeedbackDuration);
    }

    // =========================
    // Run Playground Request
    // =========================
    function initPlaygroundRun() {
        const runButtons = $$('[data-run-playground]');
        runButtons.forEach(button => {
            button.addEventListener('click', () => runPlayground(button));
        });
    }

    /**
     * Execute playground request
     * @param {Element} runBtn - Run button element
     */
    async function runPlayground(runBtn) {
        const activeTab = $('.playground-tabs .tab.active');
        const outputElement = $('#playground-output');
        const outputContainer = $('.playground-output');

        if (!activeTab || !outputElement) return;

        const api = activeTab.getAttribute('data-api');
        const example = playgroundExamples[api];

        if (!example) return;

        // Show loading state
        runBtn.disabled = true;
        runBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">⏳</span> Running...';

        try {
            // Simulate API request
            await new Promise(resolve => setTimeout(resolve, CONFIG.playgroundRunDelay));

            // Update with "live" response
            const response = JSON.parse(example.response);
            if (response.meta) {
                response.meta.timestamp = new Date().toISOString();
                response.meta.live = true;
            }

            outputElement.textContent = JSON.stringify(response, null, 2);

            // Re-highlight
            highlightCode(outputElement);

            // Flash success color on output
            if (outputContainer) {
                outputContainer.style.borderColor = '#00c853';
                setTimeout(() => {
                    outputContainer.style.borderColor = '';
                }, 500);
            }
        } catch (err) {
            console.error('Playground error:', err);
            outputElement.textContent = JSON.stringify({
                error: 'Failed to execute request',
                message: err.message
            }, null, 2);
        } finally {
            // Reset button
            runBtn.disabled = false;
            runBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">▶</span> Run Request';
        }
    }

    // =========================
    // Open Playground with API
    // =========================
    function initOpenPlayground() {
        const playgroundButtons = $$('[data-open-playground]');
        playgroundButtons.forEach(button => {
            button.addEventListener('click', () => {
                const api = button.getAttribute('data-open-playground');
                openPlayground(api);
            });
        });
    }

    /**
     * Open playground and switch to specific API
     * @param {string} api - API identifier
     */
    function openPlayground(api) {
        scrollToSection('playground');

        // Switch to the right tab
        setTimeout(() => {
            const tab = $(`.playground-tabs .tab[data-api="${api}"]`);
            if (tab) {
                tab.click();
            }
        }, 500);
    }

    // =========================
    // Header Scroll Effect
    // =========================
    function initHeaderScroll() {
        const header = $('.site-header');
        if (!header) return;

        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateHeader(header);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /**
     * Update header styles based on scroll position
     * @param {Element} header - Header element
     */
    function updateHeader(header) {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.style.boxShadow = 'none';
            header.style.background = 'rgba(10, 11, 13, 0.95)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
            header.style.background = 'rgba(10, 11, 13, 0.98)';
        }
    }

    // =========================
    // Activity Feed Animation
    // =========================
    function startActivityFeed() {
        state.activityInterval = setInterval(() => {
            if (Math.random() > 0.3) { // 70% chance
                addActivityItem();
            }
        }, CONFIG.activityUpdateInterval);
    }

    /**
     * Add a new activity item to the feed
     */
    function addActivityItem() {
        const feed = $('.activity-feed');
        if (!feed) return;

        // Get random activity type
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

        // Build title with random data
        let title = activityType.title;
        if (activityType.repos) {
            title = title.replace('{repo}', activityType.repos[Math.floor(Math.random() * activityType.repos.length)]);
        }
        if (activityType.features) {
            title = title.replace('{feature}', activityType.features[Math.floor(Math.random() * activityType.features.length)]);
        }
        if (activityType.counts) {
            title = title.replace('{count}', activityType.counts[Math.floor(Math.random() * activityType.counts.length)].toLocaleString());
        }
        title = title.replace('{version}', `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`);

        // Create new activity item
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.style.opacity = '0';
        item.innerHTML = `
            <span class="activity-icon ${activityType.class}" aria-hidden="true">${activityType.icon}</span>
            <div class="activity-content">
                <div class="activity-title">${title}</div>
                <div class="activity-meta">Just now</div>
            </div>
        `;

        // Add to feed
        feed.insertBefore(item, feed.firstChild);

        // Animate in
        requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.5s';
            item.style.opacity = '1';
        });

        // Remove old items if too many
        const items = $$('.activity-item', feed);
        if (items.length > 4) {
            const lastItem = items[items.length - 1];
            lastItem.style.opacity = '0';
            setTimeout(() => lastItem.remove(), 500);
        }

        // Update timestamps of existing items
        updateActivityTimestamps(items);
    }

    /**
     * Update timestamps in activity feed
     * @param {NodeList} items - Activity items
     */
    function updateActivityTimestamps(items) {
        items.forEach((item, index) => {
            if (index === 0) return; // Skip the newest item

            const meta = $('.activity-meta', item);
            if (!meta) return;

            const text = meta.textContent;
            if (text === 'Just now') {
                meta.textContent = '1 minute ago';
            } else if (text === '1 minute ago') {
                meta.textContent = '5 minutes ago';
            } else if (text === '5 minutes ago') {
                meta.textContent = '15 minutes ago';
            }
        });
    }

    // =========================
    // Stats Counter Animation
    // =========================
    function initStatsObserver() {
        const apiSection = $('#apis');
        if (!apiSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !state.statsAnimated) {
                    animateStats();
                    state.statsAnimated = true;
                    observer.disconnect();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(apiSection);
    }

    /**
     * Animate statistics counters
     */
    function animateStats() {
        const stats = $$('.stat-value');

        stats.forEach(stat => {
            const text = stat.textContent;

            // Check if it's a number we should animate
            if (text.includes('M')) {
                const target = parseFloat(text) * 1000000;
                animateNumber(stat, target, 'M+', 1000000);
            } else if (text.includes('K')) {
                const target = parseFloat(text) * 1000;
                animateNumber(stat, target, 'K', 1000);
            } else if (!text.includes('ms') && !text.includes('%') && !text.includes('<')) {
                const num = parseInt(text);
                if (!isNaN(num)) {
                    animateNumber(stat, num, '', 1);
                }
            }
        });
    }

    /**
     * Animate a number counter
     * @param {Element} element - Element to animate
     * @param {number} target - Target number
     * @param {string} suffix - Suffix to add
     * @param {number} divisor - Divisor for display
     */
    function animateNumber(element, target, suffix, divisor) {
        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;
        let current = 0;
        const increment = target / steps;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            if (divisor > 1) {
                element.textContent = (current / divisor).toFixed(1) + suffix;
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, stepDuration);
    }

    // =========================
    // API Status Check
    // =========================
    function startStatusCheck() {
        checkAPIStatus(); // Initial check
        state.statusInterval = setInterval(checkAPIStatus, CONFIG.statusCheckInterval);
    }

    /**
     * Check and update API status
     */
    async function checkAPIStatus() {
        const statusDot = $('.status-dot');
        const statusText = $('.status-operational');

        if (!statusDot || !statusText) return;

        try {
            // In production, this would check real endpoints
            // For now, simulate with random success
            const isOperational = Math.random() > 0.05; // 95% uptime simulation

            if (isOperational) {
                statusDot.style.background = '#00c853';
                statusText.textContent = 'All Systems Operational';
            } else {
                statusDot.style.background = '#ff6d00';
                statusText.textContent = 'Minor Degradation';
            }
        } catch (error) {
            console.error('Status check failed:', error);
            statusDot.style.background = '#ff1744';
            statusText.textContent = 'Status Unknown';
        }
    }

    // =========================
    // Cleanup on page unload
    // =========================
    function initCleanup() {
        window.addEventListener('beforeunload', () => {
            if (state.activityInterval) {
                clearInterval(state.activityInterval);
            }
            if (state.statusInterval) {
                clearInterval(state.statusInterval);
            }
        });
    }

    // =========================
    // Mobile Menu Toggle
    // =========================
    function initMobileMenu() {
        const menuToggle = $('.mobile-menu-toggle');
        const navMenu = $('.nav-menu');
        const navLinks = $$('.nav-menu .nav-link');

        if (!menuToggle || !navMenu) return;

        // Toggle menu
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking overlay
        document.addEventListener('click', (e) => {
            if (document.body.classList.contains('menu-open') &&
                !navMenu.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                menuToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.focus();
            }
        });
    }

    // =========================
    // Service Worker Registration
    // =========================
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('[PWA] Service Worker registered:', registration.scope);

                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            console.log('[PWA] New Service Worker installing...');

                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('[PWA] New content available - refresh to update');
                                    // Show update notification (implement toast in future)
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.error('[PWA] Service Worker registration failed:', error);
                    });
            });
        }
    }

    // =========================
    // Initialization
    // =========================
    function init() {
        console.log('🚀 Luminous Dynamics Developer Portal Initialized');

        // Initialize all features
        initScrollButtons();
        initSmoothScrolling();
        initPlaygroundTabs();
        initCopyButtons();
        initPlaygroundRun();
        initOpenPlayground();
        initHeaderScroll();
        initStatsObserver();
        initMobileMenu();
        initCleanup();

        // Register service worker for PWA
        registerServiceWorker();

        // Start background tasks
        startActivityFeed();
        startStatusCheck();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
