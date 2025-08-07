
# 🧠 Radiology Assistant Personal Tutor

A **GDPR-compliant** AI-powered personal tutor userscript that enhances your learning experience on [Radiology Assistant](https://radiologyassistant.nl/). Get AI-powered summaries, interactive Q&A, and intelligent cost tracking with the latest Mistral AI integration.

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/simonrek/Radiology-assistant-learning-add-on)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GDPR Compliant](https://img.shields.io/badge/GDPR-compliant-green.svg)](.)
[![Mistral AI](https://img.shields.io/badge/AI-Mistral%20Latest-orange.svg)](https://mistral.ai/)

## 🚀 Quick Start

**[📥 Install Now](https://raw.githubusercontent.com/simonrek/Radiology-assistant-learning-add-on/main/userscript.js)** | **[📖 Quick Start Guide](QUICKSTART.md)** | **[📋 Full Installation](INSTALL.md)**

## ✨ What's New in v0.3.0

### Major Updates & Improvements
- **Complete Export System Redesign**: Four distinct export types (Q&A, Summaries, Combined, Metadata) with proper CSV formatting
- **🎨 Enhanced Content Display**: Advanced markdown-to-HTML conversion with nested list support - no more raw markdown!
- **New lenght setting in UI**: For the user to be able to change answer lenght like a breeze!
- **Critical Bug Fixes**: Resolved "[object Object]" display issue and CSV export column separation problems
- **🧹 Cleaner Code**: Clean console output with essential monitoring while preserving error handling
- **⚡ Improved Caching**: Enhanced backward compatibility with legacy data formats and better cache retrieval

### 💸 Current Mistral AI Pricing (EUR)
- **Small Model**: €0.1/M input, €0.3/M output tokens
- **Medium Model**: €0.4/M input, €2.0/M output tokens  
- **Large Model**: €1.8/M input, €5.4/M output tokens
- **Typical Cost per Page**: €0.001-€0.01 (extremely affordable!)

## 🎯 Key Features

### 🤖 AI-Powered Learning (No Coding Required!)
- **Auto & Manual Summaries**: Get instant summaries automatically or on-demand
- **Multiple Languages**: Works with any language content on Radiology Assistant
- **Smart Summary Types**: Key Learning Points, Clinical Overview, Imaging Pearls, Differential Diagnosis
- **Interactive Q&A**: Ask any questions about the content you're reading
- **Intelligent Caching**: Responses saved automatically to minimize costs (60-80% savings)

### 📊 Cost Tracking & Analytics  
- **Real-time EUR Pricing**: See exactly how much each summary costs (typically €0.001-€0.01)
- **Token Usage Statistics**: Detailed breakdown of AI usage and spending
- **Export Your Data**: Download all your Q&A history and progress anytime

### 🔒 Privacy & GDPR Compliance
- **100% Local Storage**: All your data stays in your browser only
- **European AI Provider**: Mistral AI (France-based, GDPR compliant)
- **No Personal Data Collection**: Only processes anonymous educational content
- **One-Click Data Deletion**: Delete everything anytime from settings

## �️ AI Interaction Storage Architecture

### Complete Data Storage Overview

The userscript implements a comprehensive dual-storage system that tracks both **AI interactions** and **token usage** for complete transparency and data export capabilities.

#### Storage System 1: AI Response Data (`ai_response_*`)

Every AI interaction (summary or Q&A) is stored with complete metadata:

**Storage Key Pattern**: `ai_response_{pageHash}_{type}_{requestHash}`

**Complete Data Structure**:
```javascript
{
  type: "summary" | "qa",
  timestamp: "2024-01-01T12:00:00.000Z",
  pageUrl: "https://radiologyassistant.nl/...",
  pageTitle: "Chest X-ray - Normal anatomy",
  request: {
    // For summaries:
    type: "Key Learning Points",
    content: "Full page content...",
    // For Q&A:
    question: "What are the key features of..."
  },
  response: {
    raw: "**Key Learning Points**\n\n1. Normal chest anatomy...",
    parsed: "<strong>Key Learning Points</strong><br><br>1. Normal chest anatomy..."
  },
  metadata: {
    model: "mistral-large-latest",
    prompt_tokens: 1245,
    completion_tokens: 387,
    total_tokens: 1632,
    cost_eur: 0.0089,
    pageHash: "abc123def",
    requestHash: "xyz789ghi"
  }
}
```

#### Storage System 2: Token Usage Logs (`token_log_*`)

Every API call generates a parallel cost tracking entry:

**Storage Key Pattern**: `token_log_{timestamp}`

**Complete Data Structure**:
```javascript
{
  timestamp: "2024-01-01T12:00:00.000Z",
  model: "mistral-large-latest",
  type: "summary" | "qa",
  pageUrl: "https://radiologyassistant.nl/...",
  tokens: {
    prompt: 1245,
    completion: 387,
    total: 1632
  },
  cost: 0.0089,
  requestId: "ai_response_abc123def_summary_xyz789ghi"
}
```

### CSV Export Mapping

The export system creates two separate CSV files with consistent column structures:

#### Q&A Export Columns
- **timestamp**: ISO date of interaction
- **page_title**: Title of the radiology page
- **page_url**: Full URL of the page
- **question**: User's question text
- **answer**: AI response (raw markdown)
- **answer_length**: Character count of answer
- **model_used**: Mistral model identifier
- **cost_eur**: Cost in euros
- **length_setting**: Characters setting used for summaries

#### Summary Export Columns  
- **timestamp**: ISO date of summary generation
- **page_title**: Title of the radiology page
- **page_url**: Full URL of the page
- **summary_type**: Type (Key Learning Points, Clinical Overview, etc.)
- **summary**: AI-generated summary (raw markdown)
- **summary_length**: Character count of summary
- **model_used**: Mistral model identifier
- **cost_eur**: Cost in euros
- **length_setting**: Characters setting used

### Data Relationship Architecture

```
Page Visit → AI Request → Dual Storage
     ↓            ↓           ↓
Page Hash → Request Hash → ai_response_* + token_log_*
     ↓            ↓           ↓
Caching Key → Cost Tracking → CSV Export Data
```

### Storage Benefits

1. **Complete Transparency**: Every interaction fully documented
2. **Cost Control**: Real-time tracking of all AI usage costs
3. **Data Portability**: Full CSV export of learning history
4. **Intelligent Caching**: Duplicate requests served from storage (60-80% cost savings)
5. **GDPR Compliance**: All data stored locally, exportable, and deletable

### Storage Management

- **Location**: Browser local storage via Greasemonkey API
- **Persistence**: Survives browser restarts and updates
- **Size**: Efficient JSON serialization with metadata compression
- **Cleanup**: One-click deletion via settings panel
- **Export**: Complete data export to CSV format anytime

## �📸 Screenshots

*UI screenshots will be added in the next update*

## 🔧 Installation & Setup (No Coding Required!)

> **💡 Important**: This is a simple browser extension - no programming knowledge needed!

### 1. Install Userscript Manager (One-Time Setup)
- **Chrome/Edge**: [Tampermonkey](https://tampermonkey.net/) (free)
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) (free)
- **Safari**: [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) (paid, ~$3)

### 2. Install the Script (One Click)
**[🔗 Click here to install](https://raw.githubusercontent.com/simonrek/Radiology-assistant-learning-add-on/main/userscript.js)** - Your browser will handle everything automatically!

### 3. Get API Key (Optional but Recommended)
1. Visit [console.mistral.ai](https://console.mistral.ai/) and create a free account
2. Get your API key (free tier includes enough credits for testing)
3. Open any Radiology Assistant page and click the 🧠 brain icon
4. Go to Settings and paste your API key

### 4. Start Learning!
Visit any Radiology Assistant article and look for the **🧠 AI Tutor** panel on the right side.

## 🎮 How to Use (Simple & Intuitive)

1. **Open any radiology article** on radiologyassistant.nl
2. **Look for the 🧠 brain icon** on the right side of your screen
3. **Click it to open the AI Tutor panel** - that's it!

### What you can do:
- **Auto Summaries**: Summaries generate automatically when you open articles
- **Manual Summaries**: Click "Generate Summary" for on-demand analysis
- **Choose Summary Types**: Key points, clinical overview, imaging pearls, or differential diagnosis
- **Ask Questions**: Type any question about the content in the Q&A section
- **View Cost Tracking**: See how much you're spending (typically €0.001-€0.01 per page)
- **Export Your Data**: Download all your Q&A history and learning progress

## �️ Technical Details

- **Platform**: Browser userscript (works like a browser extension)
- **AI Provider**: Mistral AI (European, GDPR-compliant)
- **Languages**: Works with any language content on Radiology Assistant
- **Storage**: Local browser storage only (GM_setValue)
- **Compatibility**: Chrome, Firefox, Safari, Edge
- **No Coding Required**: Simple point-and-click interface

## � Troubleshooting

### Common Issues
- **Script not appearing**: Make sure you're on an article page (not the homepage)
- **No AI summaries**: Check if your API key is entered correctly and has credits
- **Script not loading**: Ensure your userscript manager is enabled for radiologyassistant.nl

### Getting Help
- Check the [Installation Guide](INSTALL.md) for detailed setup
- Report issues on [GitHub Issues](https://github.com/simonrek/Radiology-assistant-learning-add-on/issues)

## 📋 Documentation

- **[Quick Start Guide](QUICKSTART.md)**: Get running in 5 minutes
- **[Installation Guide](INSTALL.md)**: Platform-specific instructions
- **[Changelog](CHANGELOG.md)**: Version history and updates
- **[Contributing](CONTRIBUTING.md)**: Development guidelines

## 🤝 Contributing

I will be happy if you are willing to contribute! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## � License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**Simon Rekanovic**
- Website: [simonrekanovic.com](https://www.simonrekanovic.com)
- LinkedIn: [linkedin.com/in/simonrekanovic](https://www.linkedin.com/in/simonrekanovic)

---

_Made with ❤️ for the radiology learning community_

---

## ⚙️ Configuration

The userscript includes user-configurable settings at the top of the file for easy customization:

```javascript
const USER_CONFIG = {
    // ═══════════════════════════════════════
    // AI SETTINGS (Solution was built in Europe - therefore Mistral AI Only)
    // ═══════════════════════════════════════
    MISTRAL_API_KEY: "", //API key later added by user (stored locally only)
    AI_MODEL: "mistral-medium-latest", // Mistral model to use

    // ═══════════════════════════════════════
    // PRICING CONFIGURATION (EUR per 1K tokens)
    // ═══════════════════════════════════════
    PRICING: {
      // Mistral pricing as of August 2025 (per 1K tokens in EUR)
      "mistral-small-latest": {
        input: 0.0001, // €0.0001 per 1K input tokens (€0.1/M tokens)
        output: 0.0003, // €0.0003 per 1K output tokens (€0.3/M tokens)
      },
      "mistral-medium-latest": {
        input: 0.0004, // €0.0004 per 1K input tokens (€0.4/M tokens)
        output: 0.002, // €0.002 per 1K output tokens (€2.0/M tokens)
      },
      "mistral-large-latest": {
        input: 0.0018, // €0.0018 per 1K input tokens (€1.8/M tokens)
        output: 0.0054, // €0.0054 per 1K output tokens (€5.4/M tokens)
      },
      // Default fallback pricing (using Small model rates)
      default: {
        input: 0.0001,
        output: 0.0003,
      },
    },

    // ═══════════════════════════════════════
    // USER INTERFACE SETTINGS
    // ═══════════════════════════════════════
    TUTOR_PANEL_OPEN_BY_DEFAULT: true, // Start with panel open

    // ═══════════════════════════════════════
    // DATA STORAGE SETTINGS (All Local - GDPR Compliant)
    // ═══════════════════════════════════════
    SAVE_PROGRESS_LOCALLY: true, // Save progress in browser storage
    USE_GM_STORAGE_ONLY: true, // Use only GM storage for consistency
    DATA_RETENTION_DAYS: 365, // How long to keep local data
  }

  // ========================================
  // 🔒 PRIVACY & GDPR AWARENESS NOTICE
  // ========================================
  // This userscript is designed with data protection in mind and to be GDPR compliant:
  // ✅ NO personal data collection
  // ✅ NO data transmission except to Mistral AI for summary and answer generation - no personal data included
  // ✅ ALL usage data stored locally in your browser only
  // ✅ NO tracking, cookies, or external analytics
  // ✅ ALL data generated by the app can be deleted anytime by the user, no data is sent to external servers

  // ========================================
  // 🎛️ INTERNAL CONFIGURATION (DO NOT MODIFY)
  // ========================================
  const CONFIG = {
    // Copy user settings for internal use
    ...USER_CONFIG,

    // Mistral AI Configuration
    MISTRAL_BASE_URL: "https://api.mistral.ai/v1",
    MISTRAL_DEFAULT_MODEL: USER_CONFIG.AI_MODEL || "mistral-small-latest",

    // Storage configuration
    STORAGE_PREFIX: "ra_tutor_gdpr_",

    // Privacy settings
    NO_PERSONAL_DATA: true,
    GDPR_COMPLIANT: true,
  }

```



