# Luminous Dynamics Developer Portal

> Build Sacred Technology That Serves Consciousness

[![Live Site](https://img.shields.io/badge/live-luminousdynamics.io-00e5ff)](https://luminousdynamics.io)
[![License](https://img.shields.io/badge/license-Sacred_Reciprocity-ffd740)](https://luminousdynamics.io/sacred-reciprocity-license)

A modern, accessible, and performant developer portal showcasing Luminous Dynamics' suite of consciousness-first APIs and tools.

## 🌟 Features

- **Interactive API Playground**: Test Terra Atlas, Luminous Nix, and Sacred Bridge APIs directly in your browser
- **Comprehensive Documentation**: Quick start guides, API references, and best practices
- **Live Activity Feed**: Real-time updates from the ecosystem
- **Fully Accessible**: WCAG 2.1 AA compliant with keyboard navigation, ARIA labels, and screen reader support
- **Performance Optimized**: Fast loading times with deferred scripts, resource hints, and optimized animations
- **Dark Mode First**: Beautiful dark theme with electric cyan, warm gold, and mystical purple accents
- **Responsive Design**: Works seamlessly across all devices and screen sizes

## 🏗️ Project Structure

```
luminousdynamics-io/
├── index.html              # Main landing page
├── styles/
│   ├── main.css           # Primary stylesheet
│   └── syntax.css         # Code syntax highlighting
├── js/
│   └── main.js           # Interactive JavaScript
├── CNAME                  # Custom domain configuration
├── .nojekyll             # GitHub Pages configuration
├── README.md             # This file
└── [static assets]       # Favicons, images, etc.
```

## 🚀 APIs Showcased

### Terra Atlas API
Access 4M+ renewable energy sites with real-time project information, pricing, and investment analytics.

### Luminous Nix API
Natural language interface for NixOS system operations with 98.5% accuracy across 100+ languages.

### Sacred Bridge
Unified consciousness bus for service coordination with event streaming, service mesh, and state synchronization.

## 🛠️ Technologies Used

### Frontend Stack
- **HTML5**: Semantic markup with accessibility best practices
- **CSS3**: Modern CSS with custom properties, flexbox, gradients, and animations
- **Vanilla JavaScript**: No frameworks - pure, performant JavaScript with IIFE module pattern
- **Prism.js**: Syntax highlighting for code examples

### Performance Features
- Resource hints (preconnect, dns-prefetch)
- Deferred script loading
- RequestAnimationFrame for smooth animations
- IntersectionObserver for lazy stats animation
- Optimized with will-change for GPU acceleration

### Accessibility Features
- WCAG 2.1 AA compliant
- Skip-to-content link
- Proper ARIA labels and roles
- Keyboard navigation (Tab, Arrow keys, Home, End)
- Focus indicators
- Screen reader friendly
- Reduced motion support

### SEO Optimizations
- Semantic HTML structure
- Open Graph meta tags
- Twitter Cards
- Canonical URLs
- Structured metadata
- Optimized page titles and descriptions

## 📦 Development

### Prerequisites
None! This is a static site with no build process required.

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Luminous-Dynamics/luminousdynamics-io.git
   cd luminousdynamics-io
   ```

2. **Serve locally**

   Using Python:
   ```bash
   python -m http.server 8000
   ```

   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```

   Or use any static file server of your choice.

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Making Changes

The site is built with vanilla HTML, CSS, and JavaScript - no build tools required!

- **HTML**: Edit `index.html`
- **Styles**: Edit files in `styles/` directory
- **JavaScript**: Edit `js/main.js`
- **Content**: Update text directly in `index.html`

## 🎨 Design System

### Color Palette

```css
/* Primary */
--bg-primary: #0a0b0d;
--bg-secondary: #13161a;
--text-primary: #e8eaed;

/* Accents */
--accent-primary: #00e5ff;    /* Electric Cyan */
--brand-luminous: #ffd740;    /* Warm Gold */
--brand-sacred: #b388ff;      /* Mystical Purple */
```

### Typography

- **Sans-serif**: System font stack for optimal performance
- **Monospace**: JetBrains Mono, Fira Code for code blocks

### Spacing Scale

```css
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-xxl: 3rem;
```

## ♿ Accessibility

This site is built with accessibility as a core principle:

- **Keyboard Navigation**: Full site navigation without a mouse
  - `Tab` / `Shift+Tab`: Navigate interactive elements
  - `Arrow Keys`: Navigate playground tabs
  - `Home` / `End`: Jump to first/last tab
  - `Enter` / `Space`: Activate buttons

- **Screen Readers**: Properly labeled with ARIA attributes
- **Skip Links**: Quick navigation to main content
- **Focus Indicators**: Clear visual feedback
- **Color Contrast**: WCAG AA compliant ratios
- **Reduced Motion**: Respects `prefers-reduced-motion`

## 🚢 Deployment

### GitHub Pages

This site is deployed automatically via GitHub Pages:

1. Push changes to the `main` branch
2. GitHub Pages automatically deploys from the root directory
3. Site is live at `luminousdynamics.io`

### Custom Domain

The custom domain is configured via:
- `CNAME` file containing `luminousdynamics.io`
- DNS A records pointing to GitHub Pages IPs
- HTTPS enabled via GitHub Pages

## 📊 Performance

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)

### Optimization Techniques
- Deferred JavaScript loading
- Resource hints for external CDNs
- Minimal dependencies
- Optimized animations with GPU acceleration
- Efficient event delegation

## 🤝 Contributing

We welcome contributions to improve the developer portal!

### Guidelines

1. Maintain accessibility standards
2. Follow the existing code style
3. Test across browsers and devices
4. Ensure no console errors
5. Keep performance in mind

### Code Style

- **HTML**: Semantic, properly indented (4 spaces)
- **CSS**: BEM-inspired naming, organized by component
- **JavaScript**: ES6+, JSDoc comments, event delegation

## 📝 License

This project is licensed under the [Sacred Reciprocity License](https://luminousdynamics.io/sacred-reciprocity-license).

## 🔗 Links

- **Website**: [luminousdynamics.io](https://luminousdynamics.io)
- **GitHub**: [github.com/Luminous-Dynamics](https://github.com/Luminous-Dynamics)
- **Terra Atlas**: [terra.luminousdynamics.io](https://terra.luminousdynamics.io)
- **Luminous Nix**: [nixforhumanity.org](https://nixforhumanity.org)
- **Mycelix Network**: [mycelix.net](https://mycelix.net)

## 📧 Contact

For questions or support:
- **Email**: dev@luminousdynamics.io
- **Website**: [luminousdynamics.org](https://luminousdynamics.org)

---

<div align="center">

**Built with consciousness** ⚡ **by Luminous Dynamics**

© 2025 Luminous Dynamics - Building consciousness-first technology

</div>
