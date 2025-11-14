# Contributing to Luminous Dynamics Developer Portal

Thank you for your interest in contributing to the Luminous Dynamics Developer Portal! We welcome contributions that help us build better consciousness-first technology.

## 🌟 Code of Conduct

This project adheres to a code of mutual respect and collaboration. By participating, you are expected to uphold this code. Please be respectful, inclusive, and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Git
- A modern web browser
- A text editor or IDE
- Basic knowledge of HTML, CSS, and JavaScript

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/luminousdynamics-io.git
   cd luminousdynamics-io
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx http-server -p 8000
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

## 📝 How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues. When creating a new issue, include:

- **Clear, descriptive title**
- **Steps to reproduce** the problem
- **Expected behavior** vs. actual behavior
- **Screenshots** (if applicable)
- **Browser and OS** information
- **Console errors** (if applicable)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear, descriptive title**
- **Detailed description** of the proposed feature
- **Use cases** and examples
- **Mockups or sketches** (if applicable)

### Pull Requests

1. **Follow the coding standards** (see below)
2. **Test your changes** across browsers
3. **Update documentation** if needed
4. **Write clear commit messages**
5. **Reference related issues**

## 💻 Coding Standards

### HTML

- Use semantic HTML5 elements
- Include ARIA labels for accessibility
- Maintain proper indentation (4 spaces)
- Add comments for complex sections
- Ensure all links have proper targets and rel attributes

**Example:**
```html
<button
    class="btn btn-primary"
    data-action="submit"
    aria-label="Submit form">
    Submit
</button>
```

### CSS

- Use CSS custom properties for theming
- Follow BEM-inspired naming conventions
- Group related properties
- Add comments for complex selectors
- Ensure responsive design (mobile-first)

**Example:**
```css
/* Component: Button */
.btn {
    padding: var(--space-md) var(--space-lg);
    border-radius: 8px;
    transition: all var(--transition-base);
}

.btn--primary {
    background: var(--accent-primary);
    color: var(--bg-primary);
}
```

### JavaScript

- Use ES6+ features
- Write modular, reusable code
- Add JSDoc comments for functions
- Handle errors gracefully
- Use event delegation where possible
- Avoid global variables (use IIFE or modules)

**Example:**
```javascript
/**
 * Toggle element visibility
 * @param {Element} element - Element to toggle
 * @param {boolean} show - Whether to show or hide
 */
function toggleElement(element, show) {
    if (!element) return;
    element.style.display = show ? 'block' : 'none';
}
```

## ♿ Accessibility Requirements

All contributions must meet WCAG 2.1 AA standards:

- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **ARIA Labels**: Provide descriptive labels for screen readers
- **Color Contrast**: Maintain 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Alt Text**: Descriptive alt text for all images
- **Semantic HTML**: Use appropriate HTML elements

### Testing Accessibility

- Test with keyboard only (Tab, Enter, Escape, Arrow keys)
- Test with a screen reader (NVDA, JAWS, VoiceOver)
- Run axe DevTools or Lighthouse accessibility audit
- Ensure `prefers-reduced-motion` is respected

## 🧪 Testing

Before submitting a pull request:

1. **Manual Testing**
   - Test in Chrome, Firefox, Safari, and Edge
   - Test on mobile devices or using browser dev tools
   - Test with JavaScript disabled
   - Test keyboard navigation
   - Test with a screen reader

2. **Automated Testing**
   - Run Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
   - Check for console errors
   - Validate HTML
   - Check CSS for errors

3. **Cross-Browser Testing**
   - Chrome (latest 2 versions)
   - Firefox (latest 2 versions)
   - Safari (latest 2 versions)
   - Edge (latest 2 versions)

## 📊 Performance Guidelines

- **Images**: Optimize and use appropriate formats (WebP, SVG)
- **Scripts**: Defer non-critical JavaScript
- **CSS**: Minimize and combine where possible
- **Fonts**: Use system fonts or limit web fonts
- **Animations**: Use CSS animations, respect `prefers-reduced-motion`

### Performance Budgets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Total page size: < 500KB (excluding CDN assets)
- JavaScript bundle: < 100KB

## 📚 Documentation

If your contribution changes functionality:

- Update the README.md
- Add inline code comments
- Update JSDoc comments
- Add examples if introducing new features

## 🔧 Commit Message Guidelines

Use clear, descriptive commit messages:

```bash
# Format
<type>: <subject>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting, etc.)
refactor: Code refactoring
perf:     Performance improvements
test:     Adding or updating tests
chore:    Build process or auxiliary tool changes

# Examples
feat: Add mobile hamburger menu
fix: Resolve keyboard navigation in playground
docs: Update API documentation
style: Format CSS with consistent indentation
refactor: Simplify event handling in main.js
perf: Optimize scroll performance with requestAnimationFrame
```

## 🎨 Design Guidelines

- **Dark Mode First**: Design with dark mode as the default
- **Accessibility**: Follow WCAG 2.1 AA standards minimum
- **Responsive**: Mobile-first responsive design
- **Performance**: Optimize for fast loading
- **Consistency**: Use existing design tokens and patterns

### Color Palette

```css
--bg-primary: #0a0b0d;
--text-primary: #e8eaed;
--accent-primary: #00e5ff;
--accent-secondary: #ffd740;
--brand-sacred: #b388ff;
```

## 🔍 Code Review Process

1. **Automated Checks**: PRs must pass all automated checks
2. **Code Review**: At least one maintainer review required
3. **Testing**: Changes must be tested across browsers
4. **Accessibility**: Accessibility review for UI changes
5. **Documentation**: Documentation must be updated if needed

## 📋 Pull Request Checklist

Before submitting your pull request, ensure:

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Cross-browser testing completed
- [ ] Documentation updated
- [ ] Commit messages are clear and descriptive
- [ ] No console errors or warnings
- [ ] Performance impact assessed
- [ ] Mobile responsive design verified

## 🎯 Areas for Contribution

We especially welcome contributions in:

- **Accessibility improvements**
- **Performance optimizations**
- **Documentation enhancements**
- **Bug fixes**
- **Browser compatibility fixes**
- **Mobile experience improvements**
- **Internationalization (i18n)**
- **Testing and quality assurance**

## 💬 Questions?

If you have questions:

- Check existing issues and discussions
- Open a new issue with the "question" label
- Email: dev@luminousdynamics.io

## 📜 License

By contributing to this project, you agree that your contributions will be licensed under the Sacred Reciprocity License.

---

## Thank You! 🙏

Your contributions help build technology that serves consciousness. Every improvement, no matter how small, makes a difference.

**Built with consciousness ⚡ by the community**
