<!-- @format -->

# 🧠 Radiology Assistant Personal Tutor

A **GDPR-compliant** AI-powered personal tutor userscript that enhances your learning experience on [Radiology Assistant](https://radiologyassistant.nl/). Get AI-powered summaries, ask questions about content, and track your learning progress.

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/simonrek/radiology-assistant-personal-tutor)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GDPR Compliant](https://img.shields.io/badge/GDPR-compliant-green.svg)](.)
[![Safari](https://img.shields.io/badge/Safari-compatible-lightblue.svg)](https://apps.apple.com/app/userscripts/id1463298887)

## 🎯 What This Script Does

- **🤖 AI Summaries** - Get instant summaries of radiology content with different focus areas (key points, clinical overview, imaging pearls)
- **❓ Interactive Q&A** - Ask questions about the content and get detailed AI explanations
- **📊 Progress Tracking** - Monitor pages visited, reading time, and API usage
- **🔒 Privacy First** - All data stored locally in your browser, GDPR compliant

## 📱 Installation (Safari Only)

**Currently works with Safari + Userscripts app only**

1. **Install Userscripts app** from Mac App Store ([link](https://apps.apple.com/app/userscripts/id1463298887))
2. **Copy the script code** from `userscript.js`
3. **Create new userscript** in Userscripts app
4. **Paste the code** and save
5. **Enable for radiologyassistant.nl**

_Note: Chrome/Tampermonkey support may be added in future versions_

## 🚀 Quick Start

1. **Get Mistral API key** - Visit [console.mistral.ai](https://console.mistral.ai/) (free tier available)
2. **Visit any page** on radiologyassistant.nl
3. **Click the brain icon** (🧠) on the right side to open the AI Tutor
4. **Enter your API key** in settings
5. **Start getting AI summaries!**

## 🎮 How to Use

1. **Open any radiology content** on radiologyassistant.nl
2. **Click the brain icon** to open the AI Tutor panel
3. **Choose summary type**:
   - 📝 Main Points
   - 📚 Clinical Overview
   - 💎 Imaging Pearls
   - 🔍 Imaging Differential Key Points
4. **Ask questions** - Type questions about the content for detailed explanations
5. **View your stats** - Check pages visited and API usage in the stats section

## ⚙️ Configuration

### API Key Setup

1. Get your API key from [Mistral AI](https://console.mistral.ai/)
2. Open the AI Tutor settings (⚙️ icon)
3. Click "Manage Key" and enter your API key
4. Test with "Test Key" button

### Data Management

- **View All Data** - See what's stored in your browser
- **Export Data** - Download your Q&A history and progress
- **Purge Data** - Clear all data or keep API key only

## 🔒 Privacy & GDPR Compliance

- ✅ **No personal data collection** - Only processes page content for summaries
- ✅ **Local storage only** - Everything stays in your Safari browser
- ✅ **European AI provider** - Uses Mistral AI (EU-based)
- ✅ **Right to erasure** - Delete all data anytime from settings
- ✅ **No tracking** - No analytics, no external data sharing

## 🛠️ Technical Details

- **Platform**: Safari Userscript (pure JavaScript)
- **AI Provider**: Mistral AI
- **Storage**: Safari localStorage (no external servers)
- **Dependencies**: None
- **File**: Single `userscript.js` file (~3000 lines)

## 🐛 Troubleshooting

### Common Issues

- **No AI summaries**: Check if API key is entered correctly and has credits
- **Script not loading**: Ensure Userscripts app is enabled for radiologyassistant.nl
- **API errors**: Verify your Mistral AI key is valid

### Getting Help

- Check your Mistral AI account credits
- Report issues on GitHub
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development

## 📝 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Simon Rekanovic**

- Website: [simonrekanovic.com](https://www.simonrekanovic.com)
- LinkedIn: [linkedin.com/in/simonrekanovic](https://www.linkedin.com/in/simonrekanovic)

---

_Made with ❤️ for the radiology learning community_
