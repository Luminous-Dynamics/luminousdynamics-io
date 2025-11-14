/**
 * Enhanced Playground Features
 * - Request history (localStorage)
 * - Favorites/bookmarks
 * - Share functionality
 * - Enhanced response display
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        maxHistoryItems: 10,
        maxFavorites: 20,
        storageKeys: {
            history: 'luminous_playground_history',
            favorites: 'luminous_playground_favorites'
        }
    };

    // =========================
    // Storage Utilities
    // =========================
    const Storage = {
        /**
         * Get data from localStorage
         * @param {string} key - Storage key
         * @returns {any} Parsed data or default
         */
        get(key, defaultValue = []) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (err) {
                console.error('Storage get error:', err);
                return defaultValue;
            }
        },

        /**
         * Set data in localStorage
         * @param {string} key - Storage key
         * @param {any} value - Value to store
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (err) {
                console.error('Storage set error:', err);
                return false;
            }
        },

        /**
         * Clear specific key
         * @param {string} key - Storage key
         */
        clear(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (err) {
                console.error('Storage clear error:', err);
                return false;
            }
        }
    };

    // =========================
    // History Management
    // =========================
    const History = {
        /**
         * Get all history items
         * @returns {Array} History items
         */
        getAll() {
            return Storage.get(CONFIG.storageKeys.history, []);
        },

        /**
         * Add request to history
         * @param {Object} request - Request data
         */
        add(request) {
            const history = this.getAll();
            const item = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                api: request.api,
                code: request.code,
                response: request.response,
                success: request.success,
                responseTime: request.responseTime
            };

            // Add to beginning
            history.unshift(item);

            // Keep only max items
            if (history.length > CONFIG.maxHistoryItems) {
                history.splice(CONFIG.maxHistoryItems);
            }

            Storage.set(CONFIG.storageKeys.history, history);
            this.render();

            if (window.Toast) {
                window.Toast.info('Request saved to history');
            }
        },

        /**
         * Load request from history
         * @param {number} id - History item ID
         */
        load(id) {
            const history = this.getAll();
            const item = history.find(h => h.id === id);

            if (item) {
                // Switch to the API tab
                const tab = document.querySelector(`.playground-tabs .tab[data-api="${item.api}"]`);
                if (tab) {
                    tab.click();
                }

                // Load the code
                setTimeout(() => {
                    const codeElement = document.getElementById('playground-code');
                    const outputElement = document.getElementById('playground-output');

                    if (codeElement) {
                        codeElement.textContent = item.code;
                        if (window.Prism) {
                            Prism.highlightElement(codeElement);
                        }
                    }

                    if (outputElement && item.response) {
                        outputElement.textContent = item.response;
                        if (window.Prism) {
                            Prism.highlightElement(outputElement);
                        }
                    }

                    if (window.Toast) {
                        window.Toast.success('Loaded from history');
                    }
                }, 100);
            }
        },

        /**
         * Clear all history
         */
        clear() {
            if (confirm('Are you sure you want to clear all history?')) {
                Storage.clear(CONFIG.storageKeys.history);
                this.render();

                if (window.Toast) {
                    window.Toast.info('History cleared');
                }
            }
        },

        /**
         * Export history as JSON
         */
        export() {
            const history = this.getAll();
            const dataStr = JSON.stringify(history, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `playground-history-${new Date().toISOString()}.json`;
            link.click();

            URL.revokeObjectURL(url);

            if (window.Toast) {
                window.Toast.success('History exported');
            }
        },

        /**
         * Render history panel
         */
        render() {
            const container = document.getElementById('history-list');
            if (!container) return;

            const history = this.getAll();

            if (history.length === 0) {
                container.innerHTML = '<div class="empty-state">No history yet. Run a request to get started!</div>';
                return;
            }

            container.innerHTML = history.map(item => `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-header">
                        <span class="history-api">${item.api}</span>
                        <span class="history-status ${item.success ? 'success' : 'error'}">
                            ${item.success ? '✓' : '✗'}
                        </span>
                    </div>
                    <div class="history-time">${this.formatTime(item.timestamp)}</div>
                    <div class="history-actions">
                        <button class="btn-small" onclick="PlaygroundEnhanced.History.load(${item.id})">
                            Load
                        </button>
                        <button class="btn-small" onclick="PlaygroundEnhanced.Favorites.addFromHistory(${item.id})">
                            ⭐
                        </button>
                    </div>
                </div>
            `).join('');
        },

        /**
         * Format timestamp for display
         * @param {string} timestamp - ISO timestamp
         * @returns {string} Formatted time
         */
        formatTime(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            return `${days}d ago`;
        }
    };

    // =========================
    // Favorites Management
    // =========================
    const Favorites = {
        /**
         * Get all favorites
         * @returns {Array} Favorite items
         */
        getAll() {
            return Storage.get(CONFIG.storageKeys.favorites, []);
        },

        /**
         * Add current request to favorites
         */
        add() {
            const codeElement = document.getElementById('playground-code');
            const activeTab = document.querySelector('.playground-tabs .tab.active');

            if (!codeElement || !activeTab) return;

            const api = activeTab.getAttribute('data-api');
            const code = codeElement.textContent;

            const name = prompt('Enter a name for this favorite:');
            if (!name) return;

            const favorites = this.getAll();

            if (favorites.length >= CONFIG.maxFavorites) {
                if (window.Toast) {
                    window.Toast.warning(`Maximum ${CONFIG.maxFavorites} favorites reached`);
                }
                return;
            }

            const item = {
                id: Date.now(),
                name: name,
                api: api,
                code: code,
                timestamp: new Date().toISOString()
            };

            favorites.unshift(item);
            Storage.set(CONFIG.storageKeys.favorites, favorites);
            this.render();

            if (window.Toast) {
                window.Toast.success(`Saved as "${name}"`);
            }
        },

        /**
         * Add from history item
         * @param {number} historyId - History item ID
         */
        addFromHistory(historyId) {
            const history = History.getAll();
            const historyItem = history.find(h => h.id === historyId);

            if (!historyItem) return;

            const name = prompt('Enter a name for this favorite:');
            if (!name) return;

            const favorites = this.getAll();

            const item = {
                id: Date.now(),
                name: name,
                api: historyItem.api,
                code: historyItem.code,
                timestamp: new Date().toISOString()
            };

            favorites.unshift(item);
            Storage.set(CONFIG.storageKeys.favorites, favorites);
            this.render();

            if (window.Toast) {
                window.Toast.success(`Saved as "${name}"`);
            }
        },

        /**
         * Load favorite
         * @param {number} id - Favorite item ID
         */
        load(id) {
            const favorites = this.getAll();
            const item = favorites.find(f => f.id === id);

            if (item) {
                // Switch to the API tab
                const tab = document.querySelector(`.playground-tabs .tab[data-api="${item.api}"]`);
                if (tab) {
                    tab.click();
                }

                // Load the code
                setTimeout(() => {
                    const codeElement = document.getElementById('playground-code');

                    if (codeElement) {
                        codeElement.textContent = item.code;
                        if (window.Prism) {
                            Prism.highlightElement(codeElement);
                        }
                    }

                    if (window.Toast) {
                        window.Toast.success(`Loaded "${item.name}"`);
                    }
                }, 100);
            }
        },

        /**
         * Delete favorite
         * @param {number} id - Favorite item ID
         */
        delete(id) {
            if (confirm('Delete this favorite?')) {
                const favorites = this.getAll().filter(f => f.id !== id);
                Storage.set(CONFIG.storageKeys.favorites, favorites);
                this.render();

                if (window.Toast) {
                    window.Toast.info('Favorite deleted');
                }
            }
        },

        /**
         * Clear all favorites
         */
        clear() {
            if (confirm('Are you sure you want to clear all favorites?')) {
                Storage.clear(CONFIG.storageKeys.favorites);
                this.render();

                if (window.Toast) {
                    window.Toast.info('Favorites cleared');
                }
            }
        },

        /**
         * Export favorites as JSON
         */
        export() {
            const favorites = this.getAll();
            const dataStr = JSON.stringify(favorites, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `playground-favorites-${new Date().toISOString()}.json`;
            link.click();

            URL.revokeObjectURL(url);

            if (window.Toast) {
                window.Toast.success('Favorites exported');
            }
        },

        /**
         * Render favorites panel
         */
        render() {
            const container = document.getElementById('favorites-list');
            if (!container) return;

            const favorites = this.getAll();

            if (favorites.length === 0) {
                container.innerHTML = '<div class="empty-state">No favorites yet. Save your favorite requests!</div>';
                return;
            }

            container.innerHTML = favorites.map(item => `
                <div class="favorite-item" data-id="${item.id}">
                    <div class="favorite-header">
                        <span class="favorite-name">${item.name}</span>
                        <span class="favorite-api">${item.api}</span>
                    </div>
                    <div class="favorite-time">${History.formatTime(item.timestamp)}</div>
                    <div class="favorite-actions">
                        <button class="btn-small" onclick="PlaygroundEnhanced.Favorites.load(${item.id})">
                            Load
                        </button>
                        <button class="btn-small btn-danger" onclick="PlaygroundEnhanced.Favorites.delete(${item.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    };

    // =========================
    // Share Functionality
    // =========================
    const Share = {
        /**
         * Generate shareable URL
         * @returns {string} Shareable URL
         */
        generateURL() {
            const codeElement = document.getElementById('playground-code');
            const activeTab = document.querySelector('.playground-tabs .tab.active');

            if (!codeElement || !activeTab) return '';

            const api = activeTab.getAttribute('data-api');
            const code = codeElement.textContent;

            // Encode to base64
            const encoded = btoa(unescape(encodeURIComponent(code)));

            const url = new URL(window.location.href);
            url.hash = 'playground';
            url.searchParams.set('api', api);
            url.searchParams.set('code', encoded);

            return url.toString();
        },

        /**
         * Copy share link to clipboard
         */
        async copyLink() {
            const url = this.generateURL();

            try {
                await navigator.clipboard.writeText(url);

                if (window.Toast) {
                    window.Toast.success('Share link copied to clipboard!');
                }
            } catch (err) {
                console.error('Failed to copy:', err);

                if (window.Toast) {
                    window.Toast.error('Failed to copy share link');
                }
            }
        },

        /**
         * Load from URL parameters
         */
        loadFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            const api = urlParams.get('api');
            const encoded = urlParams.get('code');

            if (api && encoded) {
                try {
                    const code = decodeURIComponent(escape(atob(encoded)));

                    // Switch to the API tab
                    const tab = document.querySelector(`.playground-tabs .tab[data-api="${api}"]`);
                    if (tab) {
                        tab.click();
                    }

                    // Load the code
                    setTimeout(() => {
                        const codeElement = document.getElementById('playground-code');

                        if (codeElement) {
                            codeElement.textContent = code;
                            if (window.Prism) {
                                Prism.highlightElement(codeElement);
                            }
                        }

                        if (window.Toast) {
                            window.Toast.info('Loaded shared request');
                        }
                    }, 500);
                } catch (err) {
                    console.error('Failed to load shared code:', err);
                }
            }
        }
    };

    // =========================
    // Response Enhancement
    // =========================
    const ResponseDisplay = {
        /**
         * Copy response to clipboard
         */
        async copyResponse() {
            const outputElement = document.getElementById('playground-output');
            if (!outputElement) return;

            const text = outputElement.textContent;

            try {
                await navigator.clipboard.writeText(text);

                if (window.Toast) {
                    window.Toast.success('Response copied to clipboard!');
                }
            } catch (err) {
                console.error('Failed to copy:', err);

                if (window.Toast) {
                    window.Toast.error('Failed to copy response');
                }
            }
        },

        /**
         * Download response as file
         */
        downloadResponse() {
            const outputElement = document.getElementById('playground-output');
            if (!outputElement) return;

            const text = outputElement.textContent;
            const activeTab = document.querySelector('.playground-tabs .tab.active');
            const api = activeTab ? activeTab.getAttribute('data-api') : 'response';

            const blob = new Blob([text], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${api}-response-${Date.now()}.json`;
            link.click();

            URL.revokeObjectURL(url);

            if (window.Toast) {
                window.Toast.success('Response downloaded');
            }
        }
    };

    // =========================
    // Initialization
    // =========================
    function init() {
        console.log('🎮 Enhanced Playground Features Initialized');

        // Render initial state
        History.render();
        Favorites.render();

        // Load from URL if shared
        Share.loadFromURL();
    }

    // Export public API
    window.PlaygroundEnhanced = {
        History,
        Favorites,
        Share,
        ResponseDisplay,
        init
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
