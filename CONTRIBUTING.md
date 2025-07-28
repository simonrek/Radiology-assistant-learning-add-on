<!-- @format -->

# Contributing to Radiology Assistant Personal Tutor

Thank you for your interest in contributing to this **GDPR-compliant** project! This guide will help you get started while maintaining our privacy-first approach.

## � GDPR Compliance Requirements

**All contributions must maintain GDPR compliance:**

- ✅ **No personal data collection** - Only anonymous educational content processing
- ✅ **Local storage only** - All user data stays in browser
- ✅ **Mistral AI only** - European AI provider for GDPR compliance
- ✅ **Privacy by design** - All features must respect user privacy
- ✅ **Transparent processing** - Clear logging of all data operations

## �🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- Git installed
- Basic knowledge of JavaScript and userscripts
- Familiarity with Radiology Assistant website
- **Understanding of GDPR requirements** for data processing

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/radiology-assistant-personal-tutor.git
   cd radiology-assistant-personal-tutor
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development**
   ```bash
   npm run dev  # Starts file watcher
   ```

## 📝 Development Guidelines

### 🔒 GDPR Compliance Rules

**All code contributions MUST:**

- Never collect personal information (names, emails, phone numbers, etc.)
- Only process anonymous educational content
- Store data locally only (localStorage/IndexedDB)
- Use Mistral AI exclusively for AI features
- Include privacy logging for transparency
- Implement data sanitization for AI inputs
- Respect user's right to erasure

### Code Style

- Use ES6+ modern JavaScript
- Follow the existing code structure with classes
- Use meaningful variable and function names
- Add comments for complex logic, especially privacy-related code
- Maintain consistent indentation (4 spaces)
- **Add GDPR compliance comments** for data processing code

### Privacy-First Development

```javascript
// ✅ GOOD: GDPR-compliant data processing
const sanitizedContent = this.sanitizeContent(content)
console.log("🔒 GDPR: Processing anonymous educational content")
GM_setValue(
  "local_key",
  JSON.stringify({
    ...data,
    _gdpr_local_only: true,
    _gdpr_no_personal_data: true,
  })
)

// ❌ BAD: Personal data collection
const userEmail = extractEmail(content) // Never do this
sendToExternalService(personalData) // Never do this
```

### Linting & GDPR Validation

```bash
# Run standard linting
npm run lint

# TODO: Add GDPR compliance checker
npm run gdpr-check
```

### Testing Requirements

- Test on multiple browsers (Safari, Chrome, Firefox)
- Verify functionality on different Radiology Assistant pages
- **Test GDPR compliance** - ensure no personal data leaks
- Check console for errors and privacy warnings
- Test with different userscript managers
- **Verify Mistral AI integration** works correctly
- **Test data sanitization** functions thoroughly

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues
2. Test with latest version
3. Try in different browsers
4. Clear browser cache/data

### Bug Report Template

```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**

1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Screenshots**
If applicable, add screenshots.

**Environment**

- Browser: [e.g., Safari 17.1]
- Userscript Manager: [e.g., Userscripts 4.1]
- Script Version: [e.g., 1.0.0]
```

## ✨ Feature Requests

### Proposing Features

1. **Check existing issues** - Feature might be planned
2. **Describe the use case** - Why is this needed?
3. **Suggest implementation** - How might it work?
4. **Consider alternatives** - Are there other solutions?

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why would this feature be useful?

**Proposed Implementation**
How might this feature work?

**Additional Context**
Any other relevant information.
```

## 🔧 Code Contributions

### Types of Contributions

- **Bug fixes** - Fix existing issues
- **Feature additions** - Add new functionality
- **UI improvements** - Enhance user interface
- **Performance optimizations** - Improve efficiency
- **Documentation** - Improve docs and comments

### Pull Request Process

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make Changes**

   - Write clean, well-commented code
   - Follow existing patterns
   - Test thoroughly

3. **Commit Changes**

   ```bash
   git commit -m "Add amazing feature"
   ```

4. **Update Version** (if needed)

   ```bash
   npm run version 1.1.0
   ```

5. **Push Branch**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Use the PR template
   - Link any related issues
   - Describe changes clearly

### Pull Request Template

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tested on Safari
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] No console errors
- [ ] Linting passes

## Related Issues

Closes #123
```

## 📚 Documentation

### Areas Needing Documentation

- Code comments for complex functions
- README updates for new features
- Installation guide improvements
- Troubleshooting additions

### Documentation Style

- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI features
- Keep formatting consistent

## 🎯 Priority Areas

### High Priority

- AI integration improvements
- Mobile responsiveness
- Performance optimizations
- Cross-browser compatibility

### Medium Priority

- Additional quiz types
- Export/import features
- Customization options
- Accessibility improvements

### Low Priority

- Visual themes
- Advanced analytics
- Integration with other sites
- Native app companion

## 🤝 Community Guidelines

### Be Respectful

- Be kind and respectful to all contributors
- Provide constructive feedback
- Help newcomers learn and contribute
- Respect different perspectives and approaches

### Quality Standards

- Write clean, maintainable code
- Test changes thoroughly
- Document new features
- Follow security best practices

## 📞 Getting Help

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Email** - [simon@simonrekanovic.com](mailto:simon@simonrekanovic.com)

### Response Times

- Issues: Within 1-3 days
- Pull requests: Within 1-5 days
- Discussions: Within 1-7 days

## 🏆 Recognition

Contributors will be recognized in:

- README acknowledgments
- Release notes
- Contributor hall of fame (coming soon)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make medical education more effective! 🚀
