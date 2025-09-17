// Luminous Dynamics Developer Portal - Interactive JavaScript
// Professional, Fast, Smooth Interactions

// =========================
// Smooth Scrolling
// =========================
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = document.querySelector('.site-header').offsetHeight;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// =========================
// Playground Functionality
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

// Tab switching for playground
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.playground-tabs .tab');
    const codeElement = document.getElementById('playground-code');
    const outputElement = document.getElementById('playground-output');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Update playground content
            const api = tab.getAttribute('data-api');
            const example = playgroundExamples[api];
            
            if (example) {
                codeElement.textContent = example.code;
                outputElement.textContent = example.response;
                
                // Re-highlight syntax
                if (window.Prism) {
                    Prism.highlightElement(codeElement);
                    Prism.highlightElement(outputElement);
                }
            }
        });
    });
});

// =========================
// Copy to Clipboard
// =========================
function copyCode() {
    const codeElement = document.getElementById('playground-code');
    const text = codeElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const copyBtn = document.querySelector('.btn-copy');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = 'rgba(0, 200, 83, 0.1)';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// =========================
// Run Playground Request
// =========================
async function runPlayground() {
    const activeTab = document.querySelector('.playground-tabs .tab.active');
    const api = activeTab.getAttribute('data-api');
    const runBtn = document.querySelector('.btn-run');
    const outputElement = document.getElementById('playground-output');
    
    // Show loading state
    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update with "live" response
    const example = playgroundExamples[api];
    
    // Add a timestamp to make it feel live
    const response = JSON.parse(example.response);
    if (response.meta) {
        response.meta.timestamp = new Date().toISOString();
        response.meta.live = true;
    }
    
    outputElement.textContent = JSON.stringify(response, null, 2);
    
    // Re-highlight
    if (window.Prism) {
        Prism.highlightElement(outputElement);
    }
    
    // Reset button
    runBtn.disabled = false;
    runBtn.innerHTML = '<span class="btn-icon">▶</span> Run Request';
    
    // Flash success color on output
    const outputContainer = document.querySelector('.playground-output');
    outputContainer.style.borderColor = '#00c853';
    setTimeout(() => {
        outputContainer.style.borderColor = '';
    }, 500);
}

// =========================
// Header Scroll Effect
// =========================
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.style.boxShadow = 'none';
        header.style.background = 'rgba(10, 11, 13, 0.95)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        header.style.background = 'rgba(10, 11, 13, 0.98)';
    }
    
    lastScroll = currentScroll;
});

// =========================
// Live Activity Feed Simulation
// =========================
const activityTypes = [
    { icon: '⚡', class: 'commit', title: 'New commit to {repo}', repos: ['luminous-nix', 'terra-atlas', 'sacred-bridge'] },
    { icon: '🚀', class: 'release', title: '{repo} v{version} released', repos: ['Terra Atlas', 'Luminous Nix', 'Mycelix'] },
    { icon: '🔀', class: 'pr', title: 'PR merged: {feature}', features: ['Add GraphQL support', 'Improve performance', 'Fix memory leak'] },
    { icon: '⭐', class: 'star', title: '{repo} reached {count} stars', repos: ['luminous-nix', 'terra-atlas'], counts: [1000, 2000, 5000] }
];

function addActivityItem() {
    const feed = document.querySelector('.activity-feed');
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
        title = title.replace('{count}', activityType.counts[Math.floor(Math.random() * activityType.counts.length)]);
    }
    title = title.replace('{version}', `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`);
    
    // Create new activity item
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.opacity = '0';
    item.innerHTML = `
        <span class="activity-icon ${activityType.class}">${activityType.icon}</span>
        <div class="activity-content">
            <div class="activity-title">${title}</div>
            <div class="activity-meta">Just now</div>
        </div>
    `;
    
    // Add to feed
    feed.insertBefore(item, feed.firstChild);
    
    // Animate in
    setTimeout(() => {
        item.style.transition = 'opacity 0.5s';
        item.style.opacity = '1';
    }, 10);
    
    // Remove old items if too many
    const items = feed.querySelectorAll('.activity-item');
    if (items.length > 4) {
        const lastItem = items[items.length - 1];
        lastItem.style.opacity = '0';
        setTimeout(() => lastItem.remove(), 500);
    }
    
    // Update timestamps of existing items
    items.forEach((item, index) => {
        if (index > 0) {
            const meta = item.querySelector('.activity-meta');
            if (meta.textContent === 'Just now') {
                meta.textContent = '1 minute ago';
            } else if (meta.textContent === '1 minute ago') {
                meta.textContent = '5 minutes ago';
            } else if (meta.textContent === '5 minutes ago') {
                meta.textContent = '15 minutes ago';
            }
        }
    });
}

// Start activity feed simulation after page load
window.addEventListener('load', () => {
    // Add an activity every 5-10 seconds
    setInterval(() => {
        if (Math.random() > 0.3) { // 70% chance
            addActivityItem();
        }
    }, 7000);
});

// =========================
// Open Playground with specific API
// =========================
function openPlayground(api) {
    // Scroll to playground
    scrollToSection('playground');
    
    // Switch to the right tab
    const tab = document.querySelector(`.playground-tabs .tab[data-api="${api}"]`);
    if (tab) {
        tab.click();
    }
}

// =========================
// Stats Counter Animation
// =========================
function animateStats() {
    const stats = document.querySelectorAll('.stat-value');
    
    stats.forEach(stat => {
        const text = stat.textContent;
        // Check if it's a number we should animate
        if (text.includes('M')) {
            const target = parseFloat(text) * 1000000;
            animateNumber(stat, target, 'M+', 1000000);
        } else if (text.includes('K')) {
            const target = parseFloat(text) * 1000;
            animateNumber(stat, target, 'K', 1000);
        } else if (text.includes('ms')) {
            // Don't animate latency
        } else if (text.includes('%')) {
            // Don't animate percentages
        } else if (!isNaN(parseInt(text))) {
            animateNumber(stat, parseInt(text), '', 1);
        }
    });
}

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

// Trigger animation when stats section comes into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            observer.disconnect();
        }
    });
});

// Observe API section for stats animation
window.addEventListener('load', () => {
    const apiSection = document.querySelector('#apis');
    if (apiSection) {
        observer.observe(apiSection);
    }
});

// =========================
// Initialize on DOM Ready
// =========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Luminous Dynamics Developer Portal Initialized');
    
    // Add smooth scroll to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                scrollToSection(target.id);
            }
        });
    });
});

// =========================
// Live API Status Check (Optional)
// =========================
async function checkAPIStatus() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-operational');
    
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
        statusDot.style.background = '#ff1744';
        statusText.textContent = 'Status Unknown';
    }
}

// Check status every 30 seconds
setInterval(checkAPIStatus, 30000);