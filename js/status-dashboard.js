/**
 * Status Dashboard
 * - Real-time API status monitoring
 * - Uptime percentages
 * - Response time visualization
 * - Incident timeline
 * - Scheduled maintenance
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        dataUrl: 'data/status-data.json',
        refreshInterval: 30000, // 30 seconds
        autoRefresh: true,
        maxRetries: 3,
        retryDelay: 2000
    };

    // State
    const state = {
        data: null,
        lastUpdate: null,
        refreshTimer: null,
        retryCount: 0,
        isLoading: false
    };

    // Status types and their visual representation
    const STATUS_CONFIG = {
        operational: {
            label: 'Operational',
            icon: '✓',
            color: '#00c853',
            bgColor: 'rgba(0, 200, 83, 0.1)'
        },
        degraded: {
            label: 'Degraded Performance',
            icon: '⚠',
            color: '#ff6d00',
            bgColor: 'rgba(255, 109, 0, 0.1)'
        },
        outage: {
            label: 'Outage',
            icon: '✕',
            color: '#ff1744',
            bgColor: 'rgba(255, 23, 68, 0.1)'
        },
        maintenance: {
            label: 'Maintenance',
            icon: '🔧',
            color: '#00b8d4',
            bgColor: 'rgba(0, 184, 212, 0.1)'
        }
    };

    // =========================
    // Data Loading
    // =========================

    /**
     * Fetch status data from JSON file
     * @returns {Promise<Object>} Status data
     */
    async function fetchStatusData() {
        try {
            state.isLoading = true;
            updateLoadingState(true);

            const response = await fetch(CONFIG.dataUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Validate data structure
            if (!data.services || !Array.isArray(data.services)) {
                throw new Error('Invalid data structure');
            }

            state.data = data;
            state.lastUpdate = new Date();
            state.retryCount = 0;
            state.isLoading = false;

            updateLoadingState(false);
            console.log('[Status] Data loaded successfully');

            return data;
        } catch (error) {
            console.error('[Status] Failed to fetch data:', error);
            state.isLoading = false;
            updateLoadingState(false);

            // Retry logic
            if (state.retryCount < CONFIG.maxRetries) {
                state.retryCount++;
                console.log(`[Status] Retrying (${state.retryCount}/${CONFIG.maxRetries})...`);

                setTimeout(() => {
                    fetchStatusData().then(renderDashboard);
                }, CONFIG.retryDelay);
            } else {
                showError('Failed to load status data. Please refresh the page.');
            }

            throw error;
        }
    }

    /**
     * Update loading state UI
     * @param {boolean} isLoading - Loading state
     */
    function updateLoadingState(isLoading) {
        const loader = document.getElementById('status-loader');
        const content = document.getElementById('status-content');

        if (loader && content) {
            if (isLoading) {
                loader.style.display = 'flex';
                content.style.opacity = '0.5';
            } else {
                loader.style.display = 'none';
                content.style.opacity = '1';
            }
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    function showError(message) {
        const errorContainer = document.getElementById('status-error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }

        // Show toast if available
        if (window.Toast) {
            window.Toast.error(message);
        }
    }

    // =========================
    // Dashboard Rendering
    // =========================

    /**
     * Render complete dashboard
     */
    function renderDashboard() {
        if (!state.data) {
            console.warn('[Status] No data to render');
            return;
        }

        renderOverallStatus();
        renderServices();
        renderIncidents();
        renderMaintenance();
        renderMetrics();
        renderStatusHistory();
        updateLastRefreshTime();

        console.log('[Status] Dashboard rendered');
    }

    /**
     * Render overall status banner
     */
    function renderOverallStatus() {
        const container = document.getElementById('overall-status');
        if (!container) return;

        const { overall } = state.data;
        const statusConfig = STATUS_CONFIG[overall.status];

        container.innerHTML = `
            <div class="overall-status-card" style="background: ${statusConfig.bgColor}; border-left: 4px solid ${statusConfig.color}">
                <div class="overall-status-icon" style="color: ${statusConfig.color}">${statusConfig.icon}</div>
                <div class="overall-status-content">
                    <h2 class="overall-status-title">${statusConfig.label}</h2>
                    <p class="overall-status-subtitle">
                        All systems operational • ${overall.uptime}% uptime
                    </p>
                </div>
                <div class="overall-status-stats">
                    <div class="stat">
                        <div class="stat-value">${overall.uptime}%</div>
                        <div class="stat-label">Uptime</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${overall.incidents}</div>
                        <div class="stat-label">Active Incidents</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render services status cards
     */
    function renderServices() {
        const container = document.getElementById('services-list');
        if (!container) return;

        const servicesHTML = state.data.services.map(service => {
            const statusConfig = STATUS_CONFIG[service.status];

            return `
                <div class="service-card">
                    <div class="service-header">
                        <div class="service-title-section">
                            <div class="service-status-indicator"
                                 style="background: ${statusConfig.color}"
                                 title="${statusConfig.label}"></div>
                            <div>
                                <h3 class="service-name">${service.name}</h3>
                                <p class="service-description">${service.description}</p>
                            </div>
                        </div>
                        <div class="service-status-badge"
                             style="background: ${statusConfig.bgColor}; color: ${statusConfig.color}">
                            ${statusConfig.icon} ${statusConfig.label}
                        </div>
                    </div>

                    <!-- Uptime Stats -->
                    <div class="service-stats">
                        <div class="stat-item">
                            <span class="stat-label">24h</span>
                            <span class="stat-value">${service.uptime.day}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">7d</span>
                            <span class="stat-value">${service.uptime.week}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">30d</span>
                            <span class="stat-value">${service.uptime.month}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">90d</span>
                            <span class="stat-value">${service.uptime.quarter}%</span>
                        </div>
                    </div>

                    <!-- Response Time -->
                    <div class="service-metrics">
                        <div class="metric-row">
                            <span class="metric-label">Response Time</span>
                            <span class="metric-value">${service.responseTime.current}ms</span>
                        </div>
                        <div class="response-time-bar">
                            <div class="response-time-fill"
                                 style="width: ${Math.min((service.responseTime.current / 500) * 100, 100)}%;
                                        background: ${getResponseTimeColor(service.responseTime.current)}">
                            </div>
                        </div>
                        <div class="metric-details">
                            <span>Avg: ${service.responseTime.average}ms</span>
                            <span>P95: ${service.responseTime.p95}ms</span>
                            <span>P99: ${service.responseTime.p99}ms</span>
                        </div>
                    </div>

                    <!-- Endpoints -->
                    <details class="service-details">
                        <summary class="service-details-toggle">
                            <span>Endpoints (${service.endpoints.length})</span>
                            <span class="toggle-icon">▼</span>
                        </summary>
                        <div class="service-endpoints">
                            ${service.endpoints.map(endpoint => {
                                const endpointStatus = STATUS_CONFIG[endpoint.status];
                                return `
                                    <div class="endpoint-item">
                                        <div class="endpoint-info">
                                            <span class="endpoint-indicator"
                                                  style="background: ${endpointStatus.color}"></span>
                                            <span class="endpoint-name">${endpoint.name}</span>
                                            <code class="endpoint-path">${endpoint.path}</code>
                                        </div>
                                        <span class="endpoint-latency">${endpoint.responseTime}ms</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </details>

                    <!-- Regions -->
                    <details class="service-details">
                        <summary class="service-details-toggle">
                            <span>Regions (${service.regions.length})</span>
                            <span class="toggle-icon">▼</span>
                        </summary>
                        <div class="service-regions">
                            ${service.regions.map(region => {
                                const regionStatus = STATUS_CONFIG[region.status];
                                return `
                                    <div class="region-item">
                                        <div class="region-info">
                                            <span class="region-indicator"
                                                  style="background: ${regionStatus.color}"></span>
                                            <span class="region-name">${region.name}</span>
                                        </div>
                                        <span class="region-latency">${region.latency}ms</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </details>
                </div>
            `;
        }).join('');

        container.innerHTML = servicesHTML;
    }

    /**
     * Get color for response time
     * @param {number} ms - Response time in milliseconds
     * @returns {string} Color code
     */
    function getResponseTimeColor(ms) {
        if (ms < 100) return '#00c853'; // Green - Excellent
        if (ms < 300) return '#00b8d4'; // Blue - Good
        if (ms < 500) return '#ff6d00'; // Orange - Fair
        return '#ff1744'; // Red - Poor
    }

    /**
     * Render incidents timeline
     */
    function renderIncidents() {
        const container = document.getElementById('incidents-list');
        if (!container) return;

        if (!state.data.incidents || state.data.incidents.length === 0) {
            container.innerHTML = `
                <div class="no-incidents">
                    <div class="no-incidents-icon">✓</div>
                    <h3>No Recent Incidents</h3>
                    <p>All services are running smoothly</p>
                </div>
            `;
            return;
        }

        const incidentsHTML = state.data.incidents.map(incident => {
            const severityConfig = {
                maintenance: { color: '#00b8d4', label: 'Maintenance' },
                degraded: { color: '#ff6d00', label: 'Degraded' },
                outage: { color: '#ff1744', label: 'Outage' }
            };

            const config = severityConfig[incident.severity];
            const duration = formatDuration(incident.duration);

            return `
                <div class="incident-card">
                    <div class="incident-header">
                        <div class="incident-severity"
                             style="background: ${config.color}20; color: ${config.color}">
                            ${config.label}
                        </div>
                        <div class="incident-status ${incident.status}">
                            ${incident.status}
                        </div>
                    </div>
                    <h3 class="incident-title">${incident.title}</h3>
                    <p class="incident-description">${incident.description}</p>
                    <div class="incident-meta">
                        <span>Started: ${formatDate(incident.startTime)}</span>
                        <span>Duration: ${duration}</span>
                        <span>Affected: ${incident.affectedServices.length} service${incident.affectedServices.length > 1 ? 's' : ''}</span>
                    </div>
                    <details class="incident-details">
                        <summary>View Updates (${incident.updates.length})</summary>
                        <div class="incident-updates">
                            ${incident.updates.map(update => `
                                <div class="update-item">
                                    <div class="update-time">${formatTime(update.time)}</div>
                                    <div class="update-message">${update.message}</div>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                </div>
            `;
        }).join('');

        container.innerHTML = incidentsHTML;
    }

    /**
     * Render scheduled maintenance
     */
    function renderMaintenance() {
        const container = document.getElementById('maintenance-list');
        if (!container) return;

        if (!state.data.maintenance || state.data.maintenance.length === 0) {
            container.innerHTML = `
                <div class="no-maintenance">
                    <p>No scheduled maintenance</p>
                </div>
            `;
            return;
        }

        const maintenanceHTML = state.data.maintenance.map(item => {
            const impactColors = {
                minimal: '#00c853',
                moderate: '#ff6d00',
                significant: '#ff1744'
            };

            return `
                <div class="maintenance-card">
                    <div class="maintenance-header">
                        <div class="maintenance-icon">🔧</div>
                        <div>
                            <h3 class="maintenance-title">${item.title}</h3>
                            <div class="maintenance-impact"
                                 style="color: ${impactColors[item.impact]}">
                                ${item.impact.charAt(0).toUpperCase() + item.impact.slice(1)} Impact
                            </div>
                        </div>
                    </div>
                    <p class="maintenance-description">${item.description}</p>
                    <div class="maintenance-meta">
                        <div class="meta-item">
                            <strong>Scheduled:</strong>
                            ${formatDate(item.scheduledStart)} - ${formatTime(item.scheduledEnd)}
                        </div>
                        <div class="meta-item">
                            <strong>Duration:</strong>
                            ${formatDuration(item.duration)}
                        </div>
                        <div class="meta-item">
                            <strong>Affected:</strong>
                            ${item.services.length} service${item.services.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = maintenanceHTML;
    }

    /**
     * Render metrics section
     */
    function renderMetrics() {
        const container = document.getElementById('metrics-section');
        if (!container) return;

        const { metrics } = state.data;

        container.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-icon">📊</div>
                    <div class="metric-content">
                        <div class="metric-value">${formatNumber(metrics.totalRequests.day)}</div>
                        <div class="metric-label">Requests Today</div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">✓</div>
                    <div class="metric-content">
                        <div class="metric-value">${metrics.successRate.day}%</div>
                        <div class="metric-label">Success Rate</div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">⚡</div>
                    <div class="metric-content">
                        <div class="metric-value">${formatNumber(metrics.totalRequests.hour)}</div>
                        <div class="metric-label">Requests/Hour</div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">🌍</div>
                    <div class="metric-content">
                        <div class="metric-value">4</div>
                        <div class="metric-label">Global Regions</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render status history chart
     */
    function renderStatusHistory() {
        const container = document.getElementById('status-history');
        if (!container) return;

        const history = state.data.statusHistory.slice().reverse();
        const maxHeight = 80; // pixels

        const barsHTML = history.map(day => {
            const barHeight = (day.uptime / 100) * maxHeight;
            const color = day.uptime >= 99.9 ? '#00c853' :
                         day.uptime >= 95 ? '#ff6d00' : '#ff1744';

            return `
                <div class="history-bar-container" title="${day.date}: ${day.uptime}% uptime">
                    <div class="history-bar"
                         style="height: ${barHeight}px; background: ${color}">
                    </div>
                    <div class="history-date">${formatShortDate(day.date)}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="history-chart">
                ${barsHTML}
            </div>
            <div class="history-legend">
                <span class="legend-item">
                    <span class="legend-color" style="background: #00c853"></span>
                    Excellent (99.9%+)
                </span>
                <span class="legend-item">
                    <span class="legend-color" style="background: #ff6d00"></span>
                    Fair (95-99.9%)
                </span>
                <span class="legend-item">
                    <span class="legend-color" style="background: #ff1744"></span>
                    Poor (<95%)
                </span>
            </div>
        `;
    }

    // =========================
    // Auto-Refresh
    // =========================

    /**
     * Start auto-refresh timer
     */
    function startAutoRefresh() {
        if (!CONFIG.autoRefresh) {
            return;
        }

        stopAutoRefresh();

        state.refreshTimer = setInterval(async () => {
            console.log('[Status] Auto-refreshing...');
            try {
                await fetchStatusData();
                renderDashboard();

                if (window.Toast) {
                    window.Toast.info('Status updated');
                }
            } catch (error) {
                console.error('[Status] Auto-refresh failed:', error);
            }
        }, CONFIG.refreshInterval);

        console.log(`[Status] Auto-refresh enabled (every ${CONFIG.refreshInterval / 1000}s)`);
    }

    /**
     * Stop auto-refresh timer
     */
    function stopAutoRefresh() {
        if (state.refreshTimer) {
            clearInterval(state.refreshTimer);
            state.refreshTimer = null;
        }
    }

    /**
     * Update last refresh time display
     */
    function updateLastRefreshTime() {
        const element = document.getElementById('last-refresh-time');
        if (element && state.lastUpdate) {
            element.textContent = formatTime(state.lastUpdate.toISOString());
        }
    }

    /**
     * Manual refresh handler
     */
    function handleManualRefresh() {
        const button = document.getElementById('refresh-button');
        if (button) {
            button.classList.add('refreshing');
        }

        fetchStatusData()
            .then(() => {
                renderDashboard();
                if (window.Toast) {
                    window.Toast.success('Status refreshed');
                }
            })
            .catch(error => {
                console.error('[Status] Manual refresh failed:', error);
            })
            .finally(() => {
                if (button) {
                    button.classList.remove('refreshing');
                }
            });
    }

    // =========================
    // Status Badges
    // =========================

    /**
     * Generate embeddable status badge
     */
    function generateStatusBadge() {
        if (!state.data) return;

        const status = state.data.overall.status;
        const statusConfig = STATUS_CONFIG[status];

        const badgeUrl = `https://img.shields.io/badge/status-${statusConfig.label.replace(/ /g, '%20')}-${statusConfig.color.replace('#', '')}.svg`;
        const badgeMarkdown = `[![Status](${badgeUrl})](https://luminousdynamics.io/status.html)`;
        const badgeHTML = `<a href="https://luminousdynamics.io/status.html"><img src="${badgeUrl}" alt="Status: ${statusConfig.label}"></a>`;

        // Show modal with badge code
        if (window.Toast) {
            window.Toast.info('Badge code copied!');
        }

        // Copy to clipboard
        navigator.clipboard.writeText(badgeMarkdown).catch(err => {
            console.error('[Status] Failed to copy badge:', err);
        });
    }

    // =========================
    // Utility Functions
    // =========================

    /**
     * Format date
     * @param {string} isoString - ISO date string
     * @returns {string} Formatted date
     */
    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Format time only
     * @param {string} isoString - ISO date string
     * @returns {string} Formatted time
     */
    function formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Format short date for history
     * @param {string} dateString - Date string
     * @returns {string} Short formatted date
     */
    function formatShortDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format duration in minutes
     * @param {number} minutes - Duration in minutes
     * @returns {string} Formatted duration
     */
    function formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }

    /**
     * Format large numbers
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // =========================
    // Event Handlers
    // =========================

    /**
     * Initialize event handlers
     */
    function initEventHandlers() {
        // Manual refresh button
        const refreshBtn = document.getElementById('refresh-button');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', handleManualRefresh);
        }

        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.checked = CONFIG.autoRefresh;
            autoRefreshToggle.addEventListener('change', (e) => {
                CONFIG.autoRefresh = e.target.checked;
                if (CONFIG.autoRefresh) {
                    startAutoRefresh();
                    if (window.Toast) {
                        window.Toast.success('Auto-refresh enabled');
                    }
                } else {
                    stopAutoRefresh();
                    if (window.Toast) {
                        window.Toast.info('Auto-refresh disabled');
                    }
                }
            });
        }

        // Status badge generator
        const badgeBtn = document.getElementById('badge-button');
        if (badgeBtn) {
            badgeBtn.addEventListener('click', generateStatusBadge);
        }

        // Subscribe button (placeholder)
        const subscribeBtn = document.getElementById('subscribe-button');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', () => {
                if (window.Toast) {
                    window.Toast.info('Status notifications coming soon!');
                }
            });
        }
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize status dashboard
     */
    async function init() {
        console.log('📊 Status Dashboard Initialized');

        try {
            await fetchStatusData();
            renderDashboard();
            initEventHandlers();
            startAutoRefresh();
        } catch (error) {
            console.error('[Status] Initialization failed:', error);
        }
    }

    // =========================
    // Public API
    // =========================
    window.StatusDashboard = {
        init,
        refresh: handleManualRefresh,
        getData: () => state.data,
        getStatus: () => state.data?.overall.status,
        startAutoRefresh,
        stopAutoRefresh
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
