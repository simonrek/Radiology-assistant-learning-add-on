<!-- @format -->

# 📥 Installation Guide

This guide will walk you through installing the **Radiology Assistant Personal Tutor** userscript on various browsers and platforms.

## 🚀 Quick Installation

### One-Click Install (Recommended)

If you already have a userscript manager installed:

**[📥 Install Radiology Assistant Personal Tutor](https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.js)**

_Click the link above and your userscript manager should automatically prompt you to install._

---

## 📱 Platform-Specific Instructions

### 🍎 Safari (macOS/iOS)

**Step 1: Install Userscripts Extension**

1. Download [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) from the App Store
2. Open Safari and enable the Userscripts extension:
   - Safari → Preferences → Extensions
   - Check the box next to "Userscripts"

**Step 2: Install the Script**

1. Click the [install link](https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.js)
2. Userscripts will prompt you to install
3. Click "Install" to confirm

**Step 3: Enable the Script**

1. Navigate to any Radiology Assistant content page
2. Click the Userscripts icon in Safari's toolbar
3. Ensure "Radiology Assistant Personal Tutor" is enabled

### 🟦 Chrome

**Step 1: Install Tampermonkey**

1. Go to the [Tampermonkey Chrome Web Store page](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
2. Click "Add to Chrome"
3. Click "Add Extension" when prompted

**Step 2: Install the Script**

1. Click the [install link](https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.js)
2. Tampermonkey will open with the script content
3. Click the "Install" button

**Step 3: Verify Installation**

1. Click the Tampermonkey icon in Chrome's toolbar
2. Go to "Dashboard"
3. Verify "Radiology Assistant Personal Tutor" is listed and enabled

### 🦊 Firefox

**Step 1: Install Tampermonkey**

1. Go to the [Tampermonkey Firefox Add-ons page](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
2. Click "Add to Firefox"
3. Click "Add" when prompted

**Step 2: Install the Script**

1. Click the [install link](https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.js)
2. Tampermonkey will open with the script content
3. Click the "Install" button

**Step 3: Verify Installation**

1. Click the Tampermonkey icon in Firefox's toolbar
2. Go to "Dashboard"
3. Verify "Radiology Assistant Personal Tutor" is listed and enabled

### 🔷 Microsoft Edge

**Step 1: Install Tampermonkey**

1. Go to the [Tampermonkey Edge Add-ons page](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
2. Click "Get"
3. Click "Add Extension" when prompted

**Step 2: Install the Script**

1. Click the [install link](https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.js)
2. Tampermonkey will open with the script content
3. Click the "Install" button

**Step 3: Verify Installation**

1. Click the Tampermonkey icon in Edge's toolbar
2. Go to "Dashboard"
3. Verify "Radiology Assistant Personal Tutor" is listed and enabled

---

## 🔧 Manual Installation

If the automatic installation doesn't work, you can install manually:

### Step 1: Get the Script Code

1. Visit the [userscript.js file](https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.js)
2. Copy all the code (Ctrl+A, then Ctrl+C)

### Step 2: Create New Script in Manager

1. Open your userscript manager dashboard
2. Click "Create a new script" or "+" button
3. Delete any default content
4. Paste the copied code
5. Save the script (usually Ctrl+S)

---

## ✅ Verification & First Use

### Testing the Installation

1. **Navigate to Radiology Assistant**

   - Go to [radiologyassistant.nl](https://radiologyassistant.nl/)
   - Click on any educational content (not the homepage)

2. **Look for the Tutor Panel**

   - You should see an "🧠 AI Tutor" panel on the right side
   - It may be minimized (circular icon) by default

3. **Interact with the Tutor**
   - Click the panel to expand it
   - Try switching between the Progress, Quiz, and Summary tabs
   - Generate a quiz question to test functionality

### Expected Behavior

- ✅ Tutor panel appears on content pages
- ✅ Progress tracking begins automatically
- ✅ Quiz generation works
- ✅ Floating progress indicator shows (if enabled)
- ✅ No errors in browser console

---

## 🐛 Troubleshooting Installation

### Script Not Appearing

**Check Userscript Manager**

- Ensure the extension is enabled in browser settings
- Verify the script is installed and active in the manager dashboard
- Check that you're on a supported page (content pages, not homepage)

**Browser Permissions**

- Some browsers may block userscript managers initially
- Check browser security/privacy settings
- Ensure the userscript manager has permission to run on all websites

### Script Errors

**Clear Browser Cache**

1. Clear your browser cache and cookies
2. Reload the Radiology Assistant page
3. Check if the script appears

**Reinstall the Script**

1. Delete the script from your userscript manager
2. Follow the installation steps again
3. Ensure you're using the latest version

**Check Console Errors**

1. Open browser developer tools (F12)
2. Look for any JavaScript errors in the console
3. Report persistent errors on GitHub Issues

### Permission Issues

**Safari Userscripts**

- Ensure Userscripts has permission for "radiologyassistant.nl"
- Check Safari → Preferences → Privacy → Website Data

**Tampermonkey**

- Go to Tampermonkey Dashboard
- Click on the script name
- Verify the @match and @grant directives are correct

---

## 🔄 Updates & Maintenance

### Automatic Updates

The script includes an auto-update mechanism that:

- Checks for updates from GitHub
- Downloads new versions automatically
- Preserves your settings and data
- Notifies you of successful updates

### Manual Updates

If automatic updates fail:

1. Delete the old script from your manager
2. Install the latest version using the [install link](https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.js)
3. Your progress data will be preserved

### Version History

Check the [GitHub releases page](https://github.com/simonrek/radiology-assistant-personal-tutor/releases) for:

- Latest version information
- Update changelogs
- Bug fixes and new features

---

## 📞 Getting Help

### Support Channels

- **GitHub Issues**: [Report bugs or request features](https://github.com/simonrek/radiology-assistant-personal-tutor/issues)
- **GitHub Discussions**: [Community support and questions](https://github.com/simonrek/radiology-assistant-personal-tutor/discussions)
- **Email Support**: [simon@simonrekanovic.com](mailto:simon@simonrekanovic.com)

### Before Requesting Support

Please include:

- Browser name and version
- Userscript manager name and version
- Error messages (if any)
- Steps to reproduce the issue
- Screenshots (if helpful)

---

## 🎉 You're Ready!

Once installed, the Radiology Assistant Personal Tutor will enhance your learning experience with:

- 📊 **Automatic progress tracking**
- 🧠 **AI-powered knowledge testing**
- 📄 **Smart content summarization**
- 🎯 **Personalized learning insights**

Happy learning! 🚀

---

_Need help? Check our [troubleshooting section](#-troubleshooting-installation) or [contact support](#-getting-help)._
