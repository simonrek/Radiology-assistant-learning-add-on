# 📋 Changelog

All notable changes to the **Radiology Assistant Personal Tutor** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-08-04 - API error logging improvement and API initial setup made more user friendly🚀

### 🐛 Fixed
- Errors in handling the users UI
- A minor bug fix in API setup
- Removed overuse of logging for setup/development - made many of them optional for developers to use at their own wish.
- Fixed data retriveal.

## [0.1.0] - 2025-08-02 - Major Feature Release 🚀

### 🎉 Added
- **Dynamic Pricing Management System**
  - Real-time EUR pricing configuration with current Mistral AI rates
  - User-configurable pricing through settings UI
  - Model-specific pricing (Small: €0.1/M, Medium: €0.4/M, Large: €1.8/M input tokens)
  - Accurate cost tracking and token usage analytics

- **Enhanced AI Response System**
  - Unified AI response storage architecture
  - Intelligent caching system to minimize API costs
  - Dynamic content parsing for flexible AI response structures
  - Smart cache management with timestamp tracking

- **Improved User Interface**
  - Modern settings panel with pricing management
  - Enhanced data overview with detailed statistics
  - Better visual feedback for user actions
  - Improved modal designs and user flows

- **Advanced Progress Tracking**
  - Comprehensive token usage logging
  - Detailed cost analysis in EUR
  - API call tracking and analytics
  - Enhanced data export capabilities

- **Better Content Processing**
  - Dynamic summary section generation
  - Flexible AI response parsing
  - Enhanced markdown formatting
  - Improved content sanitization

### 🔧 Changed
- **Default AI Model**: Switched to `mistral-medium-latest` for better performance
- **Storage Architecture**: Upgraded to unified response storage system
- **Pricing Display**: All costs now shown in EUR instead of USD
- **API Integration**: Enhanced error handling and logging
- **UI Layout**: Improved settings organization and visual hierarchy

### 🐛 Fixed
- **API Key Initialization**: Fixed race condition in API key loading sequence
- **UI Refresh Issues**: Resolved timing problems with panel updates after API key setup
- **Cost Calculation**: Corrected dynamic pricing implementation
- **Cache Management**: Fixed cache key generation and retrieval
- **Event Listeners**: Improved event handling for settings interactions

### 🚀 Performance
- **Faster Response Times**: Intelligent caching reduces repeated API calls
- **Optimized Storage**: More efficient data structure for responses
- **Reduced Costs**: Smart caching can reduce API costs by 60-80%
- **Better Memory Management**: Improved cleanup and resource handling

---

## [0.0.3] - 2025-07-28 - UI & API Improvements

### 🎉 Added
- Enhanced Q&A system with conversation history
- Smart content extraction for better AI prompts
- Improved error handling and user feedback
- Better modal designs for API key setup

### 🔧 Changed
- Refined AI prompting for more accurate responses
- Updated styling for better mobile compatibility
- Enhanced logging for debugging

### 🐛 Fixed
- API key validation issues
- Panel positioning on different screen sizes
- Content extraction edge cases

---

## [0.0.2] - 2025-07-25 - Core Functionality

### 🎉 Added
- Basic AI-powered summary generation
- Simple Q&A functionality
- Progress tracking foundation
- GDPR-compliant data storage

### 🔧 Changed
- Improved content analysis algorithms
- Better integration with Radiology Assistant pages
- Enhanced user interface responsiveness

---

## [0.0.1] - 2025-07-20 - Initial Release

### 🎉 Added
- 🧠 **AI Tutor Engine** - Intelligent tutoring system with offline fallbacks
- 📊 **Progress Tracking** - Comprehensive analytics for reading time, pages visited, and test performance
- 🎯 **Knowledge Testing** - Context-aware quiz generation with multiple choice questions
- 🎨 **Modern UI** - Modern gradient-based interface with navigation
- 💾 **Data Persistence** - Robust localStorage implementation with error handling
- 🔄 **Auto-Update System** - GitHub-powered update mechanism
- ⚙️ **Configuration System** - Extensive customization options
- 🔒 **Privacy First** - Local-only data storage with no external tracking

### Technical Features
- ES6+ modern JavaScript with class-based architecture
- Advanced CSS3 with gradient backgrounds and backdrop filters
- Efficient DOM manipulation and content extraction
- Smart content analysis and difficulty assessment
- Offline quiz generation algorithms
- Comprehensive error handling and logging

### Documentation
- Complete README with feature overview and usage instructions
- Detailed installation guide for all major browsers
- Contributing guidelines for community involvement
- MIT license for open-source distribution

---

## 🔮 Upcoming Features (Next Releases)

### [0.1.1] - Minor Bug Fixes (Planned)
- Enhanced error handling for edge cases
- Improved mobile UI responsiveness
- Additional summary types and focus areas
- Better offline fallback capabilities

### [0.2.0] - Advanced Learning Features (Planned)
- Learning path recommendations
- Advanced analytics and insights
- Export capabilities for study notes
- Advanced personalization

---

## 🏷️ Version Numbering

- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (0.X.0)**: New features, significant improvements
- **Patch (0.0.X)**: Bug fixes, small improvements

---

## 📞 Support & Feedback

- **Report Issues**: [GitHub Issues](https://github.com/simonrek/Radiology-assistant-learning-add-on/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/simonrek/Radiology-assistant-learning-add-on/discussions)
- **Contact**: simon@simonrekanovic.com

---

_This changelog is maintained by the development team and updated with each release._

### Initial Release Notes

This is the first public release of the Radiology Assistant Personal Tutor. The userscript provides a comprehensive learning enhancement system for the Radiology Assistant website, featuring intelligent tutoring, progress tracking, and knowledge testing capabilities.

**Supported Platforms:**

- Safari with Userscripts extension
- Chrome/Edge/Firefox with Tampermonkey
- All modern browsers with userscript manager support

**Target Website:**

- radiologyassistant.nl content pages (excludes homepage)

---

## Version History Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- New features

### Changed

- Changes to existing functionality

### Deprecated

- Soon-to-be removed features

### Removed

- Removed features

### Fixed

- Bug fixes

### Security

- Security improvements
```
