<!-- @format -->

# 🧠 Radiology Assistant Personal Tutor

A **GDPR-compliant** AI-powered personal tutor userscript that enhances your learning experience on [Radiology Assistant](https://radiologyassistant.nl/). Get AI-powered summaries, take knowledge quizzes, and track your learning progress with intelligent tutoring support.

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/simonrek/radiology-assistant-personal-tutor)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GDPR Compliant](https://img.shields.io/badge/GDPR-compliant-green.svg)](.)

## 🎯 Features

- **🤖 AI Summaries** - Get instant summaries of radiology content with different focus areas
- **❓ Interactive Q&A** - Ask questions about the content and get detailed explanations
- **📊 Progress Tracking** - Monitor your learning progress and quiz performance
- **🧩 Knowledge Quizzes** - Test yourself with AI-generated questions
- **🔒 Privacy First** - All data stored locally, GDPR compliant

## 📸 UI Preview

### Main Interface

![Main Interface](assets/ui-main-interface.png)
_AI Tutor panel with summary and quiz tabs_

### AI Summary Example

![AI Summary](assets/ui-ai-summary.png)
_AI-generated summary with key learning points_

### Quiz Interface

![Quiz Interface](assets/ui-quiz.png)
_Interactive quiz with explanations_

### Settings Panel

![Settings](assets/ui-settings.png)
_Data management and API key configuration_

## 🚀 Quick Start

1. **Install a userscript manager** (Tampermonkey, Greasemonkey, or Userscripts for Safari)
2. **Install the script** - See [Installation Guide](INSTALL.md)
3. **Get Mistral API key** - Visit [console.mistral.ai](https://console.mistral.ai/)
4. **Configure in settings** - Enter your API key in the tutor panel
5. **Start learning!** - Visit any Radiology Assistant page

## 🎮 How to Use

1. **Open any page** on radiologyassistant.nl
2. **Click the brain icon** (🧠) on the right side to open the AI Tutor
3. **Get AI summaries** - Choose from different summary types (key points, clinical overview, imaging pearls)
4. **Ask questions** - Use the Q&A section to ask specific questions about the content
5. **Take quizzes** - Test your knowledge with AI-generated questions
6. **View progress** - Check your stats and learning progress

## ⚙️ Configuration

### API Key Setup

1. Get your free API key from [Mistral AI](https://console.mistral.ai/)
2. Open the AI Tutor settings panel
3. Click "Manage Key" and enter your API key
4. Test the connection with "Test Key" button

### Data Management

- **View All Data** - See what information is stored
- **Export Data** - Download your progress and Q&A history
- **Purge Data** - Clear specific data or everything

## 🔒 Privacy & GDPR Compliance

- ✅ **No personal data collection** - Only processes educational content
- ✅ **Local storage only** - All data stays in your browser
- ✅ **European AI provider** - Uses Mistral AI (EU-based)
- ✅ **Right to erasure** - Delete all data anytime from settings
- ✅ **No tracking** - No analytics or external data sharing

## 🛠️ Technical Details

- **Platform**: Userscript (JavaScript)
- **AI Provider**: Mistral AI
- **Storage**: Browser localStorage (GM_setValue)
- **Compatibility**: Chrome, Firefox, Safari, Edge
- **Dependencies**: None (pure JavaScript)

## 📱 Installation

For detailed installation instructions, see [INSTALL.md](INSTALL.md)

### Browser Support

- **Chrome/Edge**: Tampermonkey extension
- **Firefox**: Greasemonkey or Tampermonkey
- **Safari**: Userscripts app from Mac App Store

## � Troubleshooting

### Common Issues

- **API key not working**: Check if key is correctly entered and has credits
- **No summaries generated**: Ensure you have a valid Mistral AI API key
- **Script not loading**: Check if userscript manager is enabled for the site

### Getting Help

- Check the [Installation Guide](INSTALL.md)
- Report issues on GitHub
- Review the [Contributing Guidelines](CONTRIBUTING.md)

## 📝 Recent Changes

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## � Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍� Author

**Simon Rekanovic**

- Website: [simonrekanovic.com](https://www.simonrekanovic.com)
- LinkedIn: [linkedin.com/in/simonrekanovic](https://www.linkedin.com/in/simonrekanovic)
- Email: simon@simonrekanovic.com

---

_Made with ❤️ for the radiology learning community_

## 🎯 Features Overview

### 🔒 GDPR-Compliant AI Tutoring (Mistral AI)

- **Privacy-First Design**: Only anonymous educational content processed
- **European AI Provider**: Mistral AI ensures GDPR compliance by design
- **Local Data Storage**: All personal data stays in your browser only
- **Smart Knowledge Testing**: Real-time quiz generation based on page content
- **Intelligent Feedback**: Detailed explanations for both correct and incorrect answers
- **Context-Aware Prompts**: Timely knowledge checks based on your reading patterns

### 📊 Local Progress Tracking (No External Analytics)

- **Reading Analytics**: Track time spent on each page and total study time
- **Learning Metrics**: Monitor daily progress with pages read and tests completed
- **Performance Statistics**: View your quiz scores and learning trends over time
- **IndexedDB Storage**: Enhanced local storage with automatic data retention policies
- **Right to Erasure**: Delete all your data anytime with one click

### 🎨 Enhanced Learning Interface

- **Floating Tutor Panel**: Always-accessible AI tutor with minimizable design
- **Tabbed Interface**: Switch between Progress, Quiz, and Summary views
- **Smart Content Analysis**: Automatic page summarization with key points extraction
- **Real-time Progress Display**: Live updates of your learning statistics
- **GDPR Controls**: Easy access to privacy settings and data management

### 🔄 Intelligent Content Processing (Privacy-Preserved)

- **Content Sanitization**: Automatic removal of any personal information before AI processing
- **Page Content Extraction**: Smart analysis of educational content only
- **Difficulty Assessment**: Automatic evaluation of content complexity
- **Key Points Identification**: Highlight important concepts and takeaways
- **Reading Time Estimation**: Accurate predictions for study planning

---

## 📸 Preview

_Screenshots coming soon - showing the tutor panel in action on Radiology Assistant pages_

---

## ⚡ What's New

### 🎉 Version 1.0.0 Features

- **🧠 AI Tutor Engine**: Complete intelligent tutoring system with offline fallbacks
- **📊 Advanced Analytics**: Comprehensive progress tracking with daily/total statistics
- **🎯 Smart Quiz Generation**: Context-aware knowledge testing with detailed feedback
- **🎨 Modern UI Design**: Beautiful gradient-based interface with responsive design
- **💾 Robust Data Management**: Advanced localStorage implementation with error handling
- **🔄 Auto-Update System**: GitHub-powered seamless update mechanism
- **📱 Mobile Responsive**: Optimized for all screen sizes and devices
- **🌙 Dark Mode Ready**: Built-in dark mode support for comfortable learning

---

## 🎮 How to Use

### Getting Started

1. **Install the userscript** following the [Installation Guide](INSTALL.md)
2. **Navigate to any Radiology Assistant content page** (excludes homepage)
3. **Look for the AI Tutor panel** that appears on the right side of the page
4. **Start learning** and watch your progress update in real-time!

### Enhanced Learning Workflow

#### 📚 Reading & Progress Tracking

- **Automatic Time Tracking**: Your reading time is tracked automatically
- **Progress Statistics**: View today's and total learning metrics
- **Page Analytics**: See how much time you've spent on each page
- **Floating Progress Bar**: Quick overview always visible at bottom-right

#### 🧠 Knowledge Testing

- **Manual Testing**: Click "Test My Knowledge" anytime for instant quizzes
- **Automatic Prompts**: Receive periodic knowledge checks based on reading time
- **Smart Questions**: AI-generated questions based on current page content
- **Immediate Feedback**: Get explanations for all answers to reinforce learning

#### 📄 Content Analysis

- **Page Summaries**: Automatic extraction of key points from content
- **Difficulty Assessment**: Understand the complexity level of material
- **Reading Time Estimates**: Plan your study sessions effectively
- **Topic Identification**: Recognize main themes and concepts

### Interface Navigation

#### 🎛️ Tutor Panel Controls

- **Minimize/Maximize**: Click header to toggle panel visibility
- **Tab Navigation**: Switch between Progress, Quiz, and Summary views
- **Quiz Generation**: Generate new questions anytime in Quiz tab
- **Progress Overview**: View detailed analytics in Progress tab

#### 📊 Progress Dashboard

- **Today's Learning**: Current session statistics and daily totals
- **Overall Progress**: Lifetime learning metrics and achievements
- **Test Performance**: Quiz scores and improvement trends
- **Time Analytics**: Detailed breakdown of study time allocation

---

## 🤖 Mistral AI Integration

### GDPR-Compliant AI Enhancement

This userscript integrates with **Mistral AI**, a European AI provider that ensures GDPR compliance by design:

**Why Mistral AI?**

- 🇪🇺 **European Company**: Based in France with strong GDPR compliance
- 🔒 **Privacy-First**: No personal data retention in AI processing
- 🧠 **Medical Expertise**: Advanced reasoning capabilities for educational content
- 💰 **Cost-Effective**: Competitive pricing for educational use

### Quick Setup

1. **Get Mistral API Key**: Visit [console.mistral.ai](https://console.mistral.ai/)
2. **Configure in Userscript**: Add your key to the `USER_CONFIG` section
3. **Choose Model**: Select from `mistral-small-latest`, `mistral-medium-latest`, or `mistral-large-latest`
4. **Start Learning**: Enhanced AI-powered quizzes will be generated automatically

### Privacy Protection Features

- ✅ **Content Sanitization**: Automatic removal of any personal information before AI processing
- ✅ **Local Validation**: All AI responses checked for personal data before display
- ✅ **Offline Fallback**: Works without AI if privacy concerns or no API key
- ✅ **Transparent Logging**: All AI interactions clearly logged in console

**📖 Full Integration Guide**: [API Integration Documentation](docs/api-integration.md)

---

## ⚙️ Configuration

The userscript includes user-configurable settings at the top of the file for easy customization:

```javascript
// ========================================
// 🔧 USER CONFIGURABLE SETTINGS - MODIFY THESE AS NEEDED
// ========================================

const USER_CONFIG = {
    // ═══════════════════════════════════════
    // AI SETTINGS (GDPR Compliant - Mistral AI Only)
    // ═══════════════════════════════════════
    ENABLE_AI_TUTOR: true,              // Enable AI-powered features
    MISTRAL_API_KEY: '',                // Add your Mistral API key here
    AI_MODEL: 'mistral-small-latest',   // Mistral model to use

    // ═══════════════════════════════════════
    // LEARNING BEHAVIOR SETTINGS
    // ═══════════════════════════════════════
    AUTO_SUMMARIZE_CONTENT: true,       // Auto-generate page summaries
    SHOW_QUIZ_PROMPTS: true,            // Show periodic quiz prompts
    TRACK_READING_TIME: true,           // Track time spent reading
    QUIZ_FREQUENCY: "medium",           // 'low' (10min), 'medium' (5min), 'high' (3min)
    COMPREHENSION_CHECKS: true,         // Enable comprehension testing
    KNOWLEDGE_TESTING: true,            // Enable knowledge quizzes

    // ═══════════════════════════════════════
    // USER INTERFACE SETTINGS
    // ═══════════════════════════════════════
    TUTOR_PANEL_OPEN_BY_DEFAULT: false, // Start with panel minimized
    ENABLE_FLOATING_PROGRESS: true,     // Show floating progress indicator
    DARK_MODE: false,                   // Enable dark theme

    // ═══════════════════════════════════════
    // DATA STORAGE SETTINGS (All Local - GDPR Compliant)
    // ═══════════════════════════════════════
    SAVE_PROGRESS_LOCALLY: true,        // Save progress in browser storage
    USE_INDEXEDDB: true,                // Use IndexedDB for enhanced storage
    ANALYTICS_ENABLED: true,            // Local analytics only
    DATA_RETENTION_DAYS: 365,          // How long to keep local data
}
  ENABLE_FLOATING_PROGRESS: true, // Show floating progress indicator
  DARK_MODE: false, // Dark mode interface

  // Learning Settings
  QUIZ_FREQUENCY: "medium", // 'low', 'medium', 'high'
  COMPREHENSION_CHECKS: true, // Enable comprehension testing
  KNOWLEDGE_TESTING: true, // Enable knowledge testing

  // Data Settings
  SAVE_PROGRESS_LOCALLY: true, // Local data persistence
  ANALYTICS_ENABLED: true, // Progress analytics
}
```

### Available Settings

- **QUIZ_FREQUENCY**: Controls how often automatic quiz prompts appear
  - `low`: Every 10 minutes
  - `medium`: Every 5 minutes
  - `high`: Every 3 minutes
- **TUTOR_PANEL_OPEN_BY_DEFAULT**: Determines initial panel visibility
- **ENABLE_FLOATING_PROGRESS**: Shows/hides the floating progress indicator
- **DARK_MODE**: Enables dark theme for comfortable night reading

### Auto-Update Configuration

The script automatically updates itself using the metadata file (`userscript.meta.js`). This ensures:

- ✅ Latest features and bug fixes
- ✅ Compatibility with Radiology Assistant changes
- ✅ Enhanced security and performance
- ✅ New AI capabilities delivered seamlessly

> **Note**: Auto-updates respect your custom settings and preserve all stored data.

---

## 🔧 Technical Details

### Platform Compatibility

- **Radiology Assistant**: Works on all `radiologyassistant.nl/*` pages (excludes homepage)
- **Content Analysis**: Deep integration with page content extraction
- **Data Persistence**: Advanced localStorage implementation for robust progress tracking
- **Browser Support**:
  - Safari with Userscripts extension
  - Chrome/Edge/Firefox with Tampermonkey/Greasemonkey
  - All modern browsers with userscript manager support

### Core Technologies

- **Modern JavaScript**: ES6+ with async/await patterns and class-based architecture
- **Advanced CSS3**: Gradient backgrounds, backdrop filters, and responsive design
- **localStorage API**: Sophisticated data persistence with automatic backup
- **DOM Manipulation**: Efficient content extraction and UI rendering
- **GitHub Integration**: Auto-update system with metadata synchronization

### AI Integration Ready

- **API Compatibility**: Built-in support for OpenAI and Anthropic APIs
- **Offline Fallbacks**: Smart offline quiz generation when AI APIs unavailable
- **Content Processing**: Intelligent text analysis and summarization
- **Context Awareness**: Page-specific question generation and difficulty assessment

### Performance Optimizations

- **Efficient DOM Queries**: Optimized selectors and minimal reflows
- **Memory Management**: Proper cleanup and resource management
- **Async Operations**: Non-blocking operations for smooth user experience
- **Lazy Loading**: Content analysis only when needed

---

## 🔒 Privacy & Security (GDPR Compliant)

### Full GDPR Compliance

- **🔒 Local Storage Only**: All progress tracking and analytics stored locally in your browser using localStorage and IndexedDB
- **🚫 Zero Personal Data Collection**: No personal information ever collected, processed, or transmitted
- **🇪🇺 GDPR-Compliant AI**: Only Mistral AI (European provider) used for anonymous content processing
- **🛡️ Content Sanitization**: Automatic removal of any personal information before AI processing
- **✋ Right to Erasure**: Delete all your data anytime with one click
- **📊 Local Analytics Only**: No external tracking, cookies, or analytics services
- **🔍 Transparent Processing**: All data operations clearly logged and visible

### Data Protection Features

- **Automatic Data Expiration**: Configurable data retention policy (default: 365 days)
- **PII Detection & Removal**: Advanced personal information detection and sanitization
- **Secure Storage**: Enhanced local storage with GDPR metadata
- **No External Dependencies**: Works completely offline except for optional Mistral AI integration
- **User Control**: Complete control over all data storage and processing

### Your Rights Under GDPR

```javascript
// Access your data
await window.raTutor.dataManager.getAllKeys()

// Exercise right to erasure (delete all data)
await window.raTutor.dataManager.clearAllUserData()

// View GDPR compliance status
console.log("🔒 GDPR Compliance Status:", {
  personalDataCollection: "NONE",
  dataStorage: "LOCAL_ONLY",
  externalTransmission: "MISTRAL_AI_ONLY (anonymous content)",
  rightToErasure: "IMPLEMENTED",
})
```

---

## 📱 Installation

### Quick Installation Links

- **Direct Install**: [Install Userscript](https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.js)
- **Detailed Guide**: [📥 Complete Installation Instructions](INSTALL.md)

### Supported Platforms

| Browser | Extension                                                                                                       | Status             |
| ------- | --------------------------------------------------------------------------------------------------------------- | ------------------ |
| Safari  | [Userscripts](https://apps.apple.com/app/userscripts/id1463298887)                                              | ✅ Recommended     |
| Chrome  | [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)         | ✅ Fully Supported |
| Firefox | [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)                                    | ✅ Fully Supported |
| Edge    | [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) | ✅ Fully Supported |

---

## 🐛 Troubleshooting

### Common Issues

**Script Not Loading**

- Ensure userscript manager is enabled and active
- Check that the script is installed and enabled in your manager
- Verify you're on a supported Radiology Assistant page (not homepage)

**Progress Not Saving**

- Check browser console for localStorage errors
- Ensure sufficient storage space available
- Verify userscript has necessary permissions

**AI Features Not Working**

- AI features use offline fallbacks by default
- To enable full AI: Set up API keys in configuration
- Check network connectivity for API-based features

**Quiz Questions Not Generating**

- Ensure page has sufficient content for analysis
- Try refreshing the page and waiting for full load
- Check browser console for JavaScript errors

### Current Limitations

- **Content Dependency**: Optimized for text-heavy educational pages
- **Page Scope**: Designed specifically for Radiology Assistant content pages
- **Modern Browser Requirement**: Requires ES6+ support for full functionality
- **API Integration**: Full AI features require API setup (optional)

### Getting Help

- 🐛 [Report Issues](https://github.com/simonrek/radiology-assistant-personal-tutor/issues)
- 💬 [Discussion Forum](https://github.com/simonrek/radiology-assistant-personal-tutor/discussions)
- 📧 Contact: [simon@simonrekanovic.com](mailto:simon@simonrekanovic.com)

---

## 🤝 Contributing

This project thrives on community contributions! Here's how you can help:

### How to Contribute

1. **Fork the repository** on GitHub
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Ideas

- **Advanced AI Integration**: Enhanced question generation and personalization
- **Multi-Language Support**: Internationalization for global users
- **Export/Import Features**: Backup and sync progress across devices
- **Advanced Analytics**: Learning pattern analysis and recommendations
- **Mobile App Companion**: Native mobile app integration
- **Keyboard Shortcuts**: Power user hotkey support
- **Custom Themes**: Personalization and accessibility options

### Development Setup

```bash
# Clone the repository
git clone https://github.com/simonrek/radiology-assistant-personal-tutor.git

# Install dependencies
npm install

# Start development mode
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Simon Rekanovic**

- 🌐 Website: [simonrekanovic.com](https://www.simonrekanovic.com/)
- 💼 LinkedIn: [linkedin.com/in/simonrekanovic](https://www.linkedin.com/in/simonrekanovic)
- 📧 Email: [simon@simonrekanovic.com](mailto:simon@simonrekanovic.com)
- 🐙 GitHub: [@simonrek](https://github.com/simonrek)

---

## 🙏 Acknowledgments

This userscript was created with deep appreciation for the [Radiology Assistant](https://radiologyassistant.nl/) and its incredible educational mission. The Radiology Assistant provides invaluable medical education resources, and this tool aims to enhance the learning experience for medical professionals and students worldwide.

Special thanks to the medical education community for inspiring continuous learning innovation.

---

## ⚠️ Disclaimer

This is an unofficial userscript and is not affiliated with or endorsed by Radiology Assistant. This tool is designed to enhance the user experience without modifying, downloading, or infringing upon the original content. Use at your own discretion and ensure compliance with Radiology Assistant's terms of service.

---

## 🤖 Development Transparency

This project was developed with the assistance of AI tools (GitHub Copilot with Claude) for code generation, optimization, and documentation. The core concept, feature design, user experience decisions, and final implementation were driven by human expertise and creativity. AI was utilized as a development accelerator while maintaining complete oversight of code quality, functionality, and educational value.

---

<div align="center">

**Made with ❤️ for the medical education community**

_Empowering the next generation of radiologists through intelligent learning technology_

</div>
