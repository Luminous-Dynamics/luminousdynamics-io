/**
 * Core Web Vitals Monitoring
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 * - INP (Interaction to Next Paint)
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        // Performance thresholds (milliseconds)
        thresholds: {
            LCP: { good: 2500, needsImprovement: 4000 },
            FID: { good: 100, needsImprovement: 300 },
            CLS: { good: 0.1, needsImprovement: 0.25 },
            TTFB: { good: 600, needsImprovement: 1500 },
            FCP: { good: 1800, needsImprovement: 3000 },
            INP: { good: 200, needsImprovement: 500 }
        },
        // Log to console in development
        enableConsoleLogging: true,
        // Send to analytics (future)
        enableAnalytics: false
    };

    // Storage for metrics
    const metrics = {
        LCP: null,
        FID: null,
        CLS: null,
        TTFB: null,
        FCP: null,
        INP: null
    };

    // =========================
    // Metric Rating
    // =========================

    /**
     * Get rating for a metric
     * @param {string} name - Metric name
     * @param {number} value - Metric value
     * @returns {string} Rating: 'good', 'needs-improvement', or 'poor'
     */
    function getRating(name, value) {
        const threshold = CONFIG.thresholds[name];
        if (!threshold) return 'unknown';

        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Get emoji for rating
     * @param {string} rating - Rating
     * @returns {string} Emoji
     */
    function getRatingEmoji(rating) {
        switch (rating) {
            case 'good': return '✅';
            case 'needs-improvement': return '⚠️';
            case 'poor': return '❌';
            default: return '❓';
        }
    }

    // =========================
    // Metric Handlers
    // =========================

    /**
     * Handle metric and log it
     * @param {Object} metric - Metric object
     */
    function handleMetric(metric) {
        const { name, value, rating } = metric;

        // Store metric
        metrics[name] = {
            value,
            rating,
            timestamp: Date.now()
        };

        // Log to console
        if (CONFIG.enableConsoleLogging) {
            const emoji = getRatingEmoji(rating);
            console.log(
                `%c${emoji} ${name}`,
                'font-weight: bold; font-size: 14px;',
                `${formatValue(name, value)} (${rating})`
            );
        }

        // Send to analytics
        if (CONFIG.enableAnalytics) {
            sendToAnalytics(metric);
        }

        // Show toast for poor performance
        if (rating === 'poor' && window.Toast) {
            window.Toast.warning(
                `Performance alert: ${name} is ${formatValue(name, value)} (target: ${formatValue(name, CONFIG.thresholds[name].good)})`,
                { duration: 5000 }
            );
        }
    }

    /**
     * Format value for display
     * @param {string} name - Metric name
     * @param {number} value - Metric value
     * @returns {string} Formatted value
     */
    function formatValue(name, value) {
        if (name === 'CLS') {
            return value.toFixed(3);
        }
        return `${Math.round(value)}ms`;
    }

    /**
     * Send metric to analytics
     * @param {Object} metric - Metric object
     */
    function sendToAnalytics(metric) {
        // Future implementation: send to analytics service
        // Example: Google Analytics, Plausible, Umami, etc.
        console.log('[Analytics]', metric);
    }

    // =========================
    // Web Vitals Implementation
    // =========================

    /**
     * Measure Largest Contentful Paint (LCP)
     */
    function measureLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];

                const value = lastEntry.renderTime || lastEntry.loadTime;
                const rating = getRating('LCP', value);

                handleMetric({
                    name: 'LCP',
                    value,
                    rating,
                    entries: [lastEntry]
                });
            });

            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (error) {
            console.error('[Web Vitals] LCP measurement failed:', error);
        }
    }

    /**
     * Measure First Input Delay (FID)
     */
    function measureFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach((entry) => {
                    const value = entry.processingStart - entry.startTime;
                    const rating = getRating('FID', value);

                    handleMetric({
                        name: 'FID',
                        value,
                        rating,
                        entries: [entry]
                    });
                });
            });

            observer.observe({ type: 'first-input', buffered: true });
        } catch (error) {
            console.error('[Web Vitals] FID measurement failed:', error);
        }
    }

    /**
     * Measure Cumulative Layout Shift (CLS)
     */
    function measureCLS() {
        try {
            let clsValue = 0;
            let sessionValue = 0;
            let sessionEntries = [];

            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach((entry) => {
                    // Only count layout shifts without recent user input
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0];
                        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

                        // If the entry occurred less than 1 second after the previous entry
                        // and less than 5 seconds after the first entry in the session,
                        // include the entry in the current session.
                        if (sessionValue &&
                            entry.startTime - lastSessionEntry.startTime < 1000 &&
                            entry.startTime - firstSessionEntry.startTime < 5000) {
                            sessionValue += entry.value;
                            sessionEntries.push(entry);
                        } else {
                            sessionValue = entry.value;
                            sessionEntries = [entry];
                        }

                        // If the current session value is larger than the current CLS value,
                        // update CLS and the entries contributing to it.
                        if (sessionValue > clsValue) {
                            clsValue = sessionValue;

                            const rating = getRating('CLS', clsValue);

                            handleMetric({
                                name: 'CLS',
                                value: clsValue,
                                rating,
                                entries: sessionEntries
                            });
                        }
                    }
                });
            });

            observer.observe({ type: 'layout-shift', buffered: true });
        } catch (error) {
            console.error('[Web Vitals] CLS measurement failed:', error);
        }
    }

    /**
     * Measure Time to First Byte (TTFB)
     */
    function measureTTFB() {
        try {
            const navigationEntry = performance.getEntriesByType('navigation')[0];

            if (navigationEntry) {
                const value = navigationEntry.responseStart - navigationEntry.requestStart;
                const rating = getRating('TTFB', value);

                handleMetric({
                    name: 'TTFB',
                    value,
                    rating,
                    entries: [navigationEntry]
                });
            }
        } catch (error) {
            console.error('[Web Vitals] TTFB measurement failed:', error);
        }
    }

    /**
     * Measure First Contentful Paint (FCP)
     */
    function measureFCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        const value = entry.startTime;
                        const rating = getRating('FCP', value);

                        handleMetric({
                            name: 'FCP',
                            value,
                            rating,
                            entries: [entry]
                        });
                    }
                });
            });

            observer.observe({ type: 'paint', buffered: true });
        } catch (error) {
            console.error('[Web Vitals] FCP measurement failed:', error);
        }
    }

    /**
     * Measure Interaction to Next Paint (INP)
     */
    function measureINP() {
        try {
            let worstINP = 0;

            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach((entry) => {
                    const duration = entry.processingEnd - entry.startTime;

                    if (duration > worstINP) {
                        worstINP = duration;

                        const rating = getRating('INP', worstINP);

                        handleMetric({
                            name: 'INP',
                            value: worstINP,
                            rating,
                            entries: [entry]
                        });
                    }
                });
            });

            observer.observe({ type: 'event', buffered: true, durationThreshold: 0 });
        } catch (error) {
            // INP might not be supported in all browsers yet
            console.log('[Web Vitals] INP measurement not supported');
        }
    }

    // =========================
    // Public API
    // =========================

    /**
     * Get all collected metrics
     * @returns {Object} Metrics object
     */
    function getMetrics() {
        return { ...metrics };
    }

    /**
     * Generate performance report
     * @returns {string} Report string
     */
    function generateReport() {
        const lines = ['📊 Core Web Vitals Report', ''];

        for (const [name, data] of Object.entries(metrics)) {
            if (data) {
                const emoji = getRatingEmoji(data.rating);
                lines.push(`${emoji} ${name}: ${formatValue(name, data.value)} (${data.rating})`);
            }
        }

        return lines.join('\n');
    }

    /**
     * Log performance report to console
     */
    function logReport() {
        console.log(generateReport());
    }

    // =========================
    // Initialization
    // =========================
    function init() {
        console.log('📊 Web Vitals Monitoring Initialized');

        // Measure all vitals
        measureLCP();
        measureFID();
        measureCLS();
        measureTTFB();
        measureFCP();
        measureINP();

        // Log report after page load completes
        window.addEventListener('load', () => {
            setTimeout(() => {
                logReport();
            }, 3000);
        });
    }

    // Export public API
    window.WebVitals = {
        getMetrics,
        generateReport,
        logReport,
        init
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
