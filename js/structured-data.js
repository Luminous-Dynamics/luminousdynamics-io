/**
 * Structured Data (JSON-LD) Manager
 * - Automatically adds schema.org structured data to pages
 * - Improves SEO and rich snippets in search results
 * - Supports Organization, WebPage, SoftwareApplication, BreadcrumbList schemas
 */

(function() {
    'use strict';

    // =========================
    // Configuration
    // =========================
    const CONFIG = {
        organization: {
            name: 'Luminous Dynamics',
            url: 'https://luminousdynamics.io',
            logo: 'https://luminousdynamics.io/logo.svg',
            description: 'APIs, SDKs, and tools for building consciousness-first applications',
            email: 'dev@luminousdynamics.io',
            sameAs: [
                'https://github.com/Luminous-Dynamics',
                'https://discord.gg/luminous',
                'https://twitter.com/LuminousDyn',
                'https://linkedin.com/company/luminous-dynamics'
            ]
        },
        website: {
            name: 'Luminous Dynamics Developer Portal',
            alternateName: 'Luminous Dynamics',
            url: 'https://luminousdynamics.io'
        }
    };

    // =========================
    // Schema Generators
    // =========================

    /**
     * Generate Organization schema
     * @returns {Object} Organization schema
     */
    function generateOrganizationSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: CONFIG.organization.name,
            url: CONFIG.organization.url,
            logo: CONFIG.organization.logo,
            description: CONFIG.organization.description,
            email: CONFIG.organization.email,
            sameAs: CONFIG.organization.sameAs,
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Support',
                email: CONFIG.organization.email,
                availableLanguage: ['English']
            }
        };
    }

    /**
     * Generate WebSite schema
     * @returns {Object} WebSite schema
     */
    function generateWebSiteSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: CONFIG.website.name,
            alternateName: CONFIG.website.alternateName,
            url: CONFIG.website.url,
            publisher: {
                '@type': 'Organization',
                name: CONFIG.organization.name,
                logo: {
                    '@type': 'ImageObject',
                    url: CONFIG.organization.logo
                }
            }
        };
    }

    /**
     * Generate WebPage schema
     * @param {Object} pageData - Page-specific data
     * @returns {Object} WebPage schema
     */
    function generateWebPageSchema(pageData) {
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: pageData.title || document.title,
            description: pageData.description || getMetaDescription(),
            url: pageData.url || window.location.href,
            publisher: {
                '@type': 'Organization',
                name: CONFIG.organization.name
            },
            inLanguage: 'en-US',
            isPartOf: {
                '@type': 'WebSite',
                name: CONFIG.website.name,
                url: CONFIG.website.url
            }
        };

        // Add breadcrumbs if available
        if (pageData.breadcrumb) {
            schema.breadcrumb = pageData.breadcrumb;
        }

        return schema;
    }

    /**
     * Generate SoftwareApplication schema
     * @returns {Object} SoftwareApplication schema
     */
    function generateSoftwareApplicationSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Luminous Dynamics API',
            applicationCategory': 'DeveloperApplication',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
            },
            operatingSystem: 'Any',
            description: 'Developer APIs for renewable energy data, NixOS automation, and consciousness-first networking'
        };
    }

    /**
     * Generate BreadcrumbList schema
     * @param {Array} breadcrumbs - Array of breadcrumb items
     * @returns {Object} BreadcrumbList schema
     */
    function generateBreadcrumbListSchema(breadcrumbs) {
        if (!breadcrumbs || breadcrumbs.length === 0) {
            return null;
        }

        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.name,
                item: crumb.url
            }))
        };
    }

    /**
     * Generate FAQPage schema
     * @param {Array} faqs - Array of FAQ items
     * @returns {Object} FAQPage schema
     */
    function generateFAQPageSchema(faqs) {
        if (!faqs || faqs.length === 0) {
            return null;
        }

        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer
                }
            }))
        };
    }

    // =========================
    // Helper Functions
    // =========================

    /**
     * Get meta description from page
     * @returns {string} Meta description
     */
    function getMetaDescription() {
        const metaDescription = document.querySelector('meta[name="description"]');
        return metaDescription ? metaDescription.getAttribute('content') : '';
    }

    /**
     * Detect page type from URL and content
     * @returns {string} Page type
     */
    function detectPageType() {
        const path = window.location.pathname;

        if (path === '/' || path === '/index.html') {
            return 'home';
        } else if (path.includes('/docs/')) {
            return 'documentation';
        } else if (path.includes('/changelog')) {
            return 'changelog';
        } else if (path.includes('/contributing')) {
            return 'contributing';
        } else if (path.includes('/security')) {
            return 'security';
        } else if (path.includes('/examples')) {
            return 'examples';
        } else {
            return 'page';
        }
    }

    /**
     * Generate breadcrumbs from URL
     * @returns {Array|null} Breadcrumb items
     */
    function generateBreadcrumbsFromPath() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(s => s && s !== 'index.html');

        if (segments.length === 0) {
            return null;
        }

        const breadcrumbs = [{
            name: 'Home',
            url: 'https://luminousdynamics.io/'
        }];

        let currentPath = '';
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;

            // Clean up segment name
            const name = segment
                .replace('.html', '')
                .replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            breadcrumbs.push({
                name,
                url: `https://luminousdynamics.io${currentPath}`
            });
        });

        return breadcrumbs;
    }

    // =========================
    // Schema Injection
    // =========================

    /**
     * Inject schema into page head
     * @param {Object} schema - Schema object
     */
    function injectSchema(schema) {
        if (!schema) {
            return;
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
    }

    /**
     * Inject multiple schemas
     * @param {Array} schemas - Array of schema objects
     */
    function injectSchemas(schemas) {
        schemas.forEach(schema => {
            if (schema) {
                injectSchema(schema);
            }
        });
    }

    // =========================
    // Page-Specific Schemas
    // =========================

    /**
     * Add schemas for home page
     */
    function addHomePageSchemas() {
        const schemas = [
            generateOrganizationSchema(),
            generateWebSiteSchema(),
            generateWebPageSchema({
                title: 'Luminous Dynamics Developer Portal',
                description: 'APIs, SDKs, and tools for building consciousness-first applications',
                url: 'https://luminousdynamics.io/'
            }),
            generateSoftwareApplicationSchema()
        ];

        injectSchemas(schemas);
        console.log('[Structured Data] Added home page schemas');
    }

    /**
     * Add schemas for documentation pages
     */
    function addDocumentationPageSchemas() {
        const breadcrumbs = generateBreadcrumbsFromPath();

        const schemas = [
            generateOrganizationSchema(),
            generateWebPageSchema({
                title: document.title,
                description: getMetaDescription(),
                url: window.location.href
            })
        ];

        if (breadcrumbs) {
            schemas.push(generateBreadcrumbListSchema(breadcrumbs));
        }

        injectSchemas(schemas);
        console.log('[Structured Data] Added documentation page schemas');
    }

    /**
     * Add schemas for generic pages
     */
    function addGenericPageSchemas() {
        const breadcrumbs = generateBreadcrumbsFromPath();

        const schemas = [
            generateOrganizationSchema(),
            generateWebPageSchema({
                title: document.title,
                description: getMetaDescription(),
                url: window.location.href
            })
        ];

        if (breadcrumbs) {
            schemas.push(generateBreadcrumbListSchema(breadcrumbs));
        }

        injectSchemas(schemas);
        console.log('[Structured Data] Added generic page schemas');
    }

    // =========================
    // Initialization
    // =========================

    /**
     * Initialize structured data
     */
    function init() {
        const pageType = detectPageType();

        console.log('📊 Structured Data Initialized');
        console.log(`[Structured Data] Page type: ${pageType}`);

        // Add schemas based on page type
        switch (pageType) {
            case 'home':
                addHomePageSchemas();
                break;
            case 'documentation':
            case 'examples':
            case 'changelog':
            case 'contributing':
            case 'security':
                addDocumentationPageSchemas();
                break;
            default:
                addGenericPageSchemas();
                break;
        }
    }

    // =========================
    // Public API
    // =========================
    window.StructuredData = {
        init,
        generateOrganizationSchema,
        generateWebPageSchema,
        generateBreadcrumbListSchema,
        generateFAQPageSchema,
        injectSchema,
        injectSchemas
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
