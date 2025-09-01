/** @format */

// ==UserScript==
// @name         Radiology Assistant Personal Tutor
// @namespace    https://github.com/simonrek/Radiology-assistant-learning-add-on
// @version      0.3.1
// @description  Latest update: 1.9.2025 ABOUT: GDPR-conscious AI-powered personal tutor for enhanced learning on Radiology Assistant - track progress and maximize learning efficiency with Mistral AI.
// @author       Simon Rekanovic
// @homepage     https://github.com/simonrek/Radiology-assistant-learning-add-on
// @supportURL   https://github.com/simonrek/Radiology-assistant-learning-add-on/issues
// @updateURL    https://raw.githubusercontent.com/simonrek/Radiology-assistant-learning-add-on/main/userscript.meta.js
// @downloadURL  https://raw.githubusercontent.com/simonrek/Radiology-assistant-learning-add-on/main/userscript.js
// @match        https://radiologyassistant.nl/*
// @exclude      https://radiologyassistant.nl/
// @exclude      https://radiologyassistant.nl/index*
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.addStyle
// @grant        GM.xmlHttpRequest
// @require      https://cdn.jsdelivr.net/npm/marked/marked.min.js
// @require      https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js
// @connect      api.mistral.ai
// @run-at       document-end
// @license      MIT
// ==/UserScript==

// Libraries are now loaded via @require directives
console.log("✅ Libraries loaded:", {
  marked: typeof marked,
  markedParse: typeof marked?.parse,
  DOMPurify: typeof DOMPurify,
  DOMPurifySanitize: typeof DOMPurify?.sanitize
});

// ========================================
// 🔧 CROSS-PLATFORM USERSCRIPT ENGINE
// ========================================
// Compatible with: Safari Userscripts, Tampermonkey
// Uses modern async GM.* API supported by all platforms
;(function () {
  "use strict"

  // ========================================
  // 🔧 USER CONFIGURABLE SETTINGS - MODIFY THESE AS NEEDED
  // ========================================

  // IMPORTANT: These settings can be safely modified by users
  // No personal data is collected or transmitted outside your browser

  const USER_CONFIG = {
    // ═══════════════════════════════════════
    // AI SETTINGS (Solution was built in Europe - therefore Mistral AI Only)
    // ═══════════════════════════════════════
    AI_MODEL: "mistral-medium-latest", // Mistral model to use

    // ═══════════════════════════════════════
    // PRICING CONFIGURATION (EUR per 1K tokens)
    // ═══════════════════════════════════════
    PRICING: {
      // Mistral pricing as of August 2025 (per 1K tokens in EUR) Can also be modified in UI
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
    DATA_RETENTION_DAYS: 365, // How long to keep local data
  }

  // ========================================
  // 🔒 PRIVACY & GDPR AWARENESS NOTICE
  // ========================================
  // This userscript is designed with data protection in mind and to be GDPR compliant:
  // ✅ NO personal data collection
  // ✅ NO data transmission except to Mistral AI for summary, answer or quiz generation - no personal data included
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
  }

  // ========================================
  // 🎨 STYLING
  // ========================================
  const CSS_STYLES = `
        /* Tutor Panel Styles - Content only, positioning handled by JS */
        #ra-tutor-panel {
            border-left: 0px solid #2c497c00;
        }

        .tutor-header {
            background: linear-gradient(135deg, #7198f8 0%, #5577e6 100%);
            color: white;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            position: sticky;
            top: 0;
            z-index: 1;
        }

        .tutor-content {
            padding: 10px;
            height: calc(100vh - 200px); /* Account for header, settings, and footer */
            overflow-y: auto;
            background: #12326200;
            padding-bottom: 10px; /* Reduced since settings section provides buffer */
        }

        .tutor-tab {
            display: none;
        }

        .tutor-tab.active {
            display: block;
        }

        .tab-buttons {
            display: flex;
            background: #1a3a6b;
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
            border: 1px solid #2c4a7c;
        }

        .tab-button {
            flex: 1;
            padding: 10px;
            background: transparent;
            border: none;
            color: #b0bec5;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .tab-button:hover {
            background: #2c4a7c;
            color: #7198f8;
        }

        .tab-button.active {
            background: #7198f8;
            color: white;
        }

        /* Modern Button Styles for Summary Controls */
        .modern-btn {
            position: relative;
            overflow: hidden;
            text-align: center;
            font-family: inherit;
        }

        .modern-btn:hover {
            transform: translateY(-1px) !important;
        }

        .modern-btn:active {
            transform: translateY(0) !important;
        }

        .modern-btn:disabled {
            opacity: 0.6 !important;
            cursor: not-allowed !important;
            transform: none !important;
        }

        /* Ripple effect for modern buttons */
        .modern-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s;
        }

        .modern-btn:active::before {
            width: 100px;
            height: 100px;
        }

        .progress-item {
            background: #1a3a6b;
            padding: 15px;
            margin: 10px 0;
            border-radius: 10px;
            border-left: 4px solid #7198f8;
            color: #e8eaed;
        }

        .progress-item strong {
            color: #7198f8;
        }
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .tab-button.active {
            background: #7198f8;
            color: white;
        }

        .quiz-question {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
        }

        .quiz-options {
            margin-top: 15px;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 10px;
            margin-bottom: 8px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .quiz-option:hover {
            background: #f0f8ff;
            border-color: #667eea;
        }

        .ai-response {
            background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
            padding: 15px;
            border-radius: 10px;
            margin-top: 15px;
            border-left: 4px solid #03a9f4;
        }

        /* Dark mode styles */
        .dark-mode #ra-tutor-panel {
            background: linear-gradient(145deg, #2d3748, #1a202c);
            border-color: #4a5568;
            color: white;
        }

        .dark-mode .tutor-content {
            color: white;
        }

        .dark-mode .progress-item {
            background: #4a5568;
            color: white;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            #ra-tutor-panel {
                width: 320px;
            }
            
            #ra-tutor-toggle {
                right: 15px;
                width: 45px;
                height: 45px;
                font-size: 18px;
            }
        }

       
        }
    `

  // ========================================
  // 💾 GDPR-conscious DATA MANAGEMENT
  // ========================================
  class DataManager {
    constructor() {
      this.storagePrefix = CONFIG.STORAGE_PREFIX

      console.log(
        "🔒 Initializing internal only data storage (no external transmission)"
      )
    }

    // Save data locally only (no external transmission)
    async saveData(key, data) {
      try {
        //console.log(`🔒 Saving data for key: ${key}`, data)

        if (!CONFIG.SAVE_PROGRESS_LOCALLY) {
          console.log("🔒 Data saving disabled by user configuration")
          return
        }

        let gdprData
        if (Array.isArray(data)) {
          // For arrays, add metadata without converting to object
          gdprData = [...data] // Create a copy of the array
          gdprData._gdpr_stored = Date.now()
          gdprData._gdpr_local_only = true
          gdprData._gdpr_no_personal_data = true
        } else {
          // For objects, spread normally
          gdprData = {
            ...data,
            _gdpr_stored: Date.now(),
            _gdpr_local_only: true,
            _gdpr_no_personal_data: true,
          }
        }

        // Always use GM storage for consistency
        const fullKey = this.storagePrefix + key
        await GM.setValue(fullKey, gdprData)

        //console.log(`🔒 Data saved locally for key: ${key}`)
      } catch (error) {
        console.error("🔒 Error saving local data:", error)
      }
    }

    //Load data from local storage only
    async loadData(key, defaultValue = null) {
      try {
        //console.log(`🔒 Loading data for key: ${key}`)

        // Always use GM storage for consistency
        const fullKey = this.storagePrefix + key
        //console.log(`🔒 Using GM.getValue for key: ${fullKey}`)
        const data = await GM.getValue(fullKey, null)
        //console.log(`🔒 GM.getValue result:`, data)

        //console.log(`🔒 Loaded data for key ${key}:`, data)

        if (data) {
          // Check data retention policy
          if (this.isDataExpired(data)) {
            console.log(`🔒 Data expired for key ${key}, removing`)
            await this.deleteData(key)
            return defaultValue
          }

          // Remove privacy metadata before returning
          if (Array.isArray(data)) {
            // For arrays, remove metadata properties and return the array
            const cleanArray = [...data]
            delete cleanArray._gdpr_stored
            delete cleanArray._gdpr_local_only
            delete cleanArray._gdpr_no_personal_data
            return cleanArray
          } else {
            // For objects, use destructuring
            const {
              _gdpr_stored,
              _gdpr_local_only,
              _gdpr_no_personal_data,
              ...cleanData
            } = data
            return cleanData
          }
        }

        console.log(
          `🔒 No data found for key ${key}, returning default:`,
          defaultValue
        )
        return defaultValue
      } catch (error) {
        console.error("🔒 Error loading local data:", error)
        return defaultValue
      }
    }

    // Delete local data
    async deleteData(key) {
      try {
        console.log(`🔒 Deleting data for key: ${key}`)

        // Always use GM storage for consistency
        const fullKey = this.storagePrefix + key
        await GM.deleteValue(fullKey)

        console.log(`🔒 Local data deleted for key: ${key}`)
      } catch (error) {
        console.error("🔒 Error deleting local data:", error)
      }
    }

    // GDPR: Get all locally stored keys
    async getAllKeys() {
      try {
        //console.log("🔧 getAllKeys: Getting all GM storage keys...")

        const allGMKeys = await GM.listValues()
        // console.log("🔧 getAllKeys: All GM keys found:", allGMKeys)

        const filteredKeys = allGMKeys.filter(key =>
          key.startsWith(this.storagePrefix)
        )
        //console.log("🔧 getAllKeys: Filtered keys with prefix:", filteredKeys)

        return filteredKeys
      } catch (error) {
        console.error("🔒 Error getting local keys:", error)
        return []
      }
    }

    // Clear all user data (right to erasure)
    async clearAllUserData() {
      try {
        console.log("🔒 GDPR: Clearing all user data...")

        const keys = await this.getAllKeys()
        console.log("🔒 GDPR: Found keys to delete:", keys)

        for (const fullKey of keys) {
          await GM.deleteValue(fullKey)
          console.log(`🔒 GDPR: Deleted key: ${fullKey}`)
        }

        console.log(
          "🔒 GDPR: All user data cleared (right to erasure exercised)"
        )
      } catch (error) {
        console.error("🔒 GDPR: Error clearing user data:", error)
      }
    }

    isDataExpired(data) {
      if (!data._gdpr_stored || !CONFIG.DATA_RETENTION_DAYS) {
        return false
      }

      const expiryTime =
        data._gdpr_stored + CONFIG.DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000
      return Date.now() > expiryTime
    }
  }

  // ========================================
  // 🤖 MISTRAL AI TUTOR ENGINE - its where the magic happens 🦄
  // ========================================
  class AITutor {
    constructor() {
      this.apiKey = null
      this.model = CONFIG.MISTRAL_DEFAULT_MODEL
      this.baseURL = CONFIG.MISTRAL_BASE_URL
      this.currentContext = ""

      // No personal data stored, only anonymous content analysis
      console.log("🔒 AI Tutor initialized with local-only data processing")
    }

    async initialize() {
      try {
        // console.log("🔑 AITutor.initialize() starting...")
        // Get API key from user configuration or local storage
        this.apiKey = await GM.getValue("mistral_api_key", null)
        //console.log("🔑 API key sources checked:",
        // {fromStorage: Boolean(await GM.getValue("mistral_api_key", null)),
        // finalKey: Boolean(this.apiKey)})

        // console.log(
        //  "🔒 AI Tutor API key loaded:",
        //  this.hasApiKey() ? "✅ Available" : "❌ Not configured"
        //)
      } catch (error) {
        console.warn("🔒 Error loading API key:", error)
        this.apiKey = null
      }
    }

    hasApiKey() {
      const hasKey = Boolean(this.apiKey && this.apiKey.trim())
      //console.log("🔑 hasApiKey() check:", {
      // apiKeyExists: Boolean(this.apiKey),
      // apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      // apiKeyTrimmed: this.apiKey ? this.apiKey.trim().length : 0,
      // result: hasKey,
      //})
      return hasKey
    }

    extractPageContent() {
      // Clean, fast: clone the whole document, strip all non-content elements, return only main text
      const clone = document.cloneNode(true);
      clone.querySelectorAll(
        'script, style, noscript, iframe, header, nav, footer, aside, .sidebar, #sidebar, #ra-tutor-panel, .cookie, .cookie-banner, .cookie-consent, .cc-window, .eu-cookie-compliance, #cookie, #cookie-banner, #cookie-consent, #cookie-policy'
      ).forEach(el => el.remove());
      let text = clone.body ? clone.body.textContent : clone.textContent;
      return text.replace(/\s+/g, ' ').trim();
    }

    async generateSummary(content, options = {}, forceBypassCache = false) {
      // Create page-specific unified response key
      const pageUrl = window.location.pathname

      // Resolve default values once at the start
      const defaultLength = await this.getDefaultLengthPreference()
      const focus = options.focus || "key_learning_points"
      const length = options.length || defaultLength
      const languageInstruction = options.languageInstruction || ""

      const requestHash = this.getContentHash(
        JSON.stringify({ content: content.substring(0, 1000), options })
      )

      // Check unified storage first (unless bypassing cache)
      if (!forceBypassCache) {
        const existingResponses = await this.getPageAIResponses(
          pageUrl,
          "summary"
        )

        // Find cached summary with matching options (focus type, length, language)
        const matchingCached = existingResponses.find(response => {
          const reqOptions = response.request.options || {}
          return (
            (reqOptions.focus || "key_learning_points") === focus &&
            (reqOptions.length || defaultLength) === length &&
            (response.request.languageInstruction || "") === languageInstruction
          )
        })

        if (matchingCached) {
          console.log("✅ Using cached unified summary with matching type", {
            pageUrl,
            focus,
            length,
            age: this.formatTimeAgo(matchingCached.timestamp),
          })

          // Return the cached response in the expected format
          // Use unified formatting - always format raw markdown content
          const parsedContent = this.formatMarkdownToHTML(matchingCached.response.raw)

          const summaryWithMetadata = {
            raw: matchingCached.response.raw,
            parsed: parsedContent,
            metadata: {
              length: matchingCached.request.options?.length || length,
              focus: matchingCached.request.options?.focus || focus,
              timestamp: matchingCached.timestamp,
              cached: true,
            },
          }

          return summaryWithMetadata
        }
      } else {
        console.log("🔄 Bypassing cache for fresh AI summary")
      }

      if (!this.apiKey) {
        throw new Error(
          "API key required for summary generation. Please configure your Mistral API key in the settings."
        )
      }

      try {
        let prompt = this.buildSummaryPrompt(
          content,
          length,
          focus,
          languageInstruction
        )

        const response = await this.callMistralAPI(prompt, null, {
          type: "summary",
          pageUrl,
          focus,
          length,
        })

        if (response && response.content) {
          const summary = this.parseSummaryResponse(response.content)

          // Add metadata for UI display
          summary.metadata = {
            length,
            focus,
            timestamp: Date.now(),
            cached: false,
          }

          // 🔄 UNIFIED STORAGE ONLY: Store as AI response with metadata
          const responseKey = await this.storeAIResponse(
            pageUrl,
            "summary",
            {
              content: content.substring(0, 1000),
              options: { ...options, length, focus }, // Store resolved values
              languageInstruction,
            },
            { raw: response.content, parsed: summary },
            { model: this.model, contentLength: content.length }
          )

          console.log("✅ Summary generated and stored in unified system", {
            pageUrl,
            contentLength: summary.raw?.length || 0,
            isMarkdown: summary.isMarkdown || false,
            responseKey: responseKey?.substring(0, 50) + "...",
          })

          return summary
        } else {
          throw new Error("Invalid response from Mistral AI")
        }
      } catch (error) {
        console.error("❌ Error generating AI summary:", error)

        // If it's an API error with detailed info, preserve that
        if (error.apiErrorDetails) {
          throw error
        }

        // Otherwise create a generic error
        const genericError = new Error("Failed to generate summary")
        genericError.apiErrorDetails = {
          type: "generic",
          title: "❌ Summary Generation Failed",
          message: "Unable to generate AI summary for this content.",
          suggestion: "Please try again or check your API key",
          technical: error.message || "Unknown error",
        }
        throw genericError
      }
    }

    buildSummaryPrompt(content, length, focus, languageInstruction = "") {
      const lengthInstructions = {
        short: "Return only the most essential, high-yield points in 3-4 concise bullet points. Avoid extra detail.",
        medium: "Return a brief, high-yield summary in 5-6 bullet points. Focus on essentials, avoid lengthy explanations.",
        long: "Return a compact, high-yield overview in 7-8 bullet points. Only include what is most important for quick review.",
      }

      const focusInstructions = {
        key_learning_points:
          "Focus only on the most important learning points and key concepts. Omit less relevant details.",
        clinical_overview:
          "Give a practical, high-yield clinical recap. Only include actionable diagnostic and management points.",
        imaging_pearls:
          "List the most important imaging findings and diagnostic pearls. Omit technical or background details.",
        imaging_differential:
          "List only the most important imaging-based differential diagnoses and distinguishing features. Be concise.",
      }

      // Create dynamic instructions based on focus type
      let specificInstructions = ""

      switch (focus) {
        case "imaging_pearls":
          specificInstructions = `\n- Only include the most critical imaging findings and pearls. No background or technical details.`
          break
        case "imaging_differential":
          specificInstructions = `\n- Only include the most important differentials and distinguishing features. No algorithms or long explanations.`
          break
        case "clinical_overview":
          specificInstructions = `\n- Only include actionable, high-yield clinical points. No background or comprehensive review.`
          break
        default:
          specificInstructions = `\n- Only include the most important facts and learning points. Omit all but the essentials.`
      }

      return `You are a senior radiology educator creating a high-yield, concise ${focus.replace(
        /_/g,
        " "
      )} summary for radiology residents.

CONTENT: "${content.substring(0)}"

INSTRUCTIONS:
- ${lengthInstructions[length]}
- ${focusInstructions[focus] || focusInstructions.key_learning_points}
- Use clear, supportive, and concise educational language. ${specificInstructions}
- Structure with clear hierarchy: section headers (##), main topics (**bold**), and bullet points (-).
- Use only markdown formatting (##, **, -). Do NOT use HTML or CSS.
- Do not include any explanations about formatting or markdown itself.
- Focus on practical learning points residents need to know.${languageInstruction}

SUMMARY:`
    }

    parseSummaryResponse(content) {
      // Since we now get markdown text instead of JSON, process it like Q&A responses
      console.log(
        "🤖 Summary Response (markdown format):",
        content.substring(0, 200) + "..."
      )

      // Clean up the response - remove any artifacts
      let cleanContent = content.trim()

      // Remove any potential "SUMMARY:" prefix if the AI included it
      cleanContent = cleanContent.replace(/^SUMMARY:\s*/i, "")

      // Process the markdown to HTML just like Q&A responses
      const formattedContent = this.formatMarkdownToHTML(cleanContent)

      // Return same structure as Q&A for consistency
      return {
        raw: cleanContent, // Original markdown text
        parsed: formattedContent, // Processed HTML (same as Q&A)
        isMarkdown: true, // Flag to indicate this is markdown format
      }
    }

    // 🔄 UNIFIED AI RESPONSE STORAGE
    async storeAIResponse(pageUrl, type, request, response, metadata) {
      try {
        const pageHash = this.getContentHash(pageUrl)
        const requestHash = this.getContentHash(JSON.stringify(request))
        const responseKey = `ai_response_${pageHash}_${type}_${requestHash}`

        const responseData = {
          type, // 'summary', 'qa', 'quiz'
          timestamp: Date.now(),
          pageUrl,
          pageTitle: document.title || "Unknown Page",
          request,
          response,
          metadata,
        }

        await GM.setValue(responseKey, JSON.stringify(responseData))
        //console.log(`🔄 Unified AI response stored: ${type} for ${pageUrl}`)

        return responseKey
      } catch (error) {
        console.error("Error storing AI response:", error)
      }
    }

    // 🔄 UNIFIED AI RESPONSE RETRIEVAL
    async getPageAIResponses(pageUrl, type = null) {
      try {
        const pageHash = this.getContentHash(pageUrl)
        const allKeys = await GM.listValues()
        const pageKeys = allKeys.filter(
          key =>
            key.startsWith(`ai_response_${pageHash}`) &&
            (type ? key.includes(`_${type}_`) : true)
        )

        const responses = []
        for (const key of pageKeys) {
          const data = await GM.getValue(key)
          if (data) {
            responses.push(JSON.parse(data))
          }
        }

        // Sort by timestamp, most recent first
        return responses.sort((a, b) => b.timestamp - a.timestamp)
      } catch (error) {
        console.error("Error retrieving page AI responses:", error)
        return []
      }
    }

    // 💰 SIMPLIFIED TOKEN LOGGING (No Daily/Total Aggregation)
    async logTokenUsage(type, pageUrl, model, tokens, cost, requestId = null) {
      try {
        const timestamp = Date.now()
        const logKey = `token_log_${timestamp}`

        const logEntry = {
          timestamp,
          model,
          type, // 'summary', 'qa', 'quiz'
          pageUrl,
          tokens,
          cost,
          requestId, // Optional link to AI response
        }

        await GM.setValue(logKey, JSON.stringify(logEntry))
        //console.log(
        //  `💰 Token usage logged: ${tokens.total} tokens, $${cost.toFixed(6)}`)

        return logKey
      } catch (error) {
        console.error("Error logging token usage:", error)
      }
    }

    // 💰 GET TOKEN USAGE LOGS (Raw data for UI formatting)
    async getTokenUsageLogs(startDate = null, endDate = null) {
      try {
        const allKeys = await GM.listValues()
        const logKeys = allKeys.filter(key => key.startsWith("token_log_"))

        const logs = []
        for (const key of logKeys) {
          const data = await GM.getValue(key)
          if (data) {
            const log = JSON.parse(data)

            // Filter by date range if provided
            if (startDate && log.timestamp < startDate) continue
            if (endDate && log.timestamp > endDate) continue

            logs.push(log)
          }
        }

        // Sort by timestamp, most recent first
        return logs.sort((a, b) => b.timestamp - a.timestamp)
      } catch (error) {
        console.error("Error getting token usage logs:", error)
        return []
      }
    }

    getContentHash(content) {
      // Simple hash function for content
      let hash = 0
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36)
    }

    // ========================================
    // MARKDOWN PROCESSING
    // ========================================

    /**
     * Parse and sanitize Markdown content using marked + DOMPurify
     * @param {string} content - Raw Markdown content
     * @returns {string} Sanitized HTML with explicit styling
     */
    formatMarkdownToHTML(content) {
      if (!content || typeof content !== 'string') {
        return content || '';
      }

      console.log("🔍 formatMarkdownToHTML called with:", {
        contentPreview: content.substring(0, 100) + "...",
        markedAvailable: typeof marked,
        DOMPurifyAvailable: typeof DOMPurify
      });

      try {
        // Check if required libraries are available
        if (typeof marked === 'undefined') {
          console.warn('🔄 marked library not available, using basic formatting');
          return this.basicMarkdownFormat(content);
        }

        if (typeof DOMPurify === 'undefined') {
          console.warn('🔄 DOMPurify library not available, skipping sanitization');
          const html = marked.parse(content);
          console.log("✅ Marked parsed HTML (no DOMPurify):", html.substring(0, 200) + "...");
          return this.addExplicitStyling(html);
        }

        // Parse Markdown to HTML using marked library
        const html = marked.parse(content);
        console.log("✅ Marked parsed HTML:", html.substring(0, 200) + "...");

        // Sanitize HTML using DOMPurify
        const sanitized = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'p',
            'br',
            'strong',
            'em',
            'u',
            'ol',
            'ul',
            'li',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'blockquote',
            'code',
            'pre',
            'a', // Allow links
            'hr', // Allow horizontal rules
            'table',
            'thead',
            'tbody',
            'tr',
            'th',
            'td'
          ],
          ALLOWED_ATTR: [
            'href', // Allow href attributes for links
            'target', // Allow target attributes for links
            'rel', // Allow rel attributes for links
            'style', // Allow style attributes for explicit styling
            'class' // Allow class attributes
          ],
        });
        
        console.log("✅ DOMPurify sanitized HTML:", sanitized.substring(0, 200) + "...");
        return this.addExplicitStyling(sanitized);
      } catch (error) {
        console.error('🔄 Markdown parsing failed:', error);
        return this.basicMarkdownFormat(content); // Return safely formatted content if parsing fails
      }
    }

    /**
     * Add explicit CSS styling to HTML elements to override any CSS resets
     * @param {string} html - HTML content
     * @returns {string} HTML with explicit styling
     */
    addExplicitStyling(html) {
      return html
        // Headers with explicit styling
        .replace(/<h1>/g, '<h1 style="font-size: 18px; font-weight: bold; margin: 16px 0 12px 0; color: #e8eaed; line-height: 1.3;">')
        .replace(/<h2>/g, '<h2 style="font-size: 16px; font-weight: bold; margin: 14px 0 10px 0; color: #e8eaed; line-height: 1.3;">')
        .replace(/<h3>/g, '<h3 style="font-size: 14px; font-weight: bold; margin: 12px 0 8px 0; color: #e8eaed; line-height: 1.3;">')
        .replace(/<h4>/g, '<h4 style="font-size: 13px; font-weight: bold; margin: 10px 0 6px 0; color: #e8eaed; line-height: 1.3;">')
        .replace(/<h5>/g, '<h5 style="font-size: 12px; font-weight: bold; margin: 8px 0 4px 0; color: #e8eaed; line-height: 1.3;">')
        .replace(/<h6>/g, '<h6 style="font-size: 11px; font-weight: bold; margin: 6px 0 4px 0; color: #e8eaed; line-height: 1.3;">')
        // Paragraphs
        .replace(/<p>/g, '<p style="margin: 8px 0; line-height: 1.5; color: #e8eaed;">')
        // Strong/Bold
        .replace(/<strong>/g, '<strong style="font-weight: bold; color: #ffffff;">')
        // Emphasis
        .replace(/<em>/g, '<em style="font-style: italic; color: #e8eaed;">')
        // Lists with proper indentation and spacing
        .replace(/<ul>/g, '<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc; color: #e8eaed;">')
        .replace(/<ol>/g, '<ol style="margin: 8px 0; padding-left: 20px; list-style-type: decimal; color: #e8eaed;">')
        .replace(/<li>/g, '<li style="margin: 4px 0; line-height: 1.4; color: #e8eaed;">')
        // Blockquotes
        .replace(/<blockquote>/g, '<blockquote style="margin: 12px 0; padding-left: 16px; border-left: 3px solid #7198f8; color: #b0bec5; font-style: italic;">')
        // Code
        .replace(/<code>/g, '<code style="background: rgba(113, 152, 248, 0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace; color: #7198f8;">')
        .replace(/<pre>/g, '<pre style="background: rgba(113, 152, 248, 0.1); padding: 12px; border-radius: 6px; margin: 12px 0; overflow-x: auto; color: #e8eaed;">')
        // Horizontal rules
        .replace(/<hr>/g, '<hr style="border: none; border-top: 1px solid #2c4a7c; margin: 16px 0;">')
        // Links
        .replace(/<a /g, '<a style="color: #7198f8; text-decoration: underline;" ');
    }

    /**
     * Escape HTML characters for safe display
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Basic markdown formatting fallback
    basicMarkdownFormat(text) {
      if (!text) return "";
      
      // Split into lines for better processing
      const lines = text.split('\n');
      const result = [];
      let inList = false;
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        if (!line) {
          // Empty line - close any open list and add spacing
          if (inList) {
            result.push('</ul>');
            inList = false;
          }
          result.push('<br>');
          continue;
        }
        
        // Headers
        if (line.startsWith('### ')) {
          if (inList) { result.push('</ul>'); inList = false; }
          line = line.replace(/^### (.*)/, '<h3>$1</h3>');
        } else if (line.startsWith('## ')) {
          if (inList) { result.push('</ul>'); inList = false; }
          line = line.replace(/^## (.*)/, '<h2>$1</h2>');
        } else if (line.startsWith('# ')) {
          if (inList) { result.push('</ul>'); inList = false; }
          line = line.replace(/^# (.*)/, '<h1>$1</h1>');
        }
        // Lists
        else if (line.startsWith('- ')) {
          if (!inList) {
            result.push('<ul>');
            inList = true;
          }
          line = line.replace(/^- (.*)/, '<li>$1</li>');
        }
        // Regular paragraph
        else {
          if (inList) { result.push('</ul>'); inList = false; }
          line = `<p>${line}</p>`;
        }
        
        // Apply bold formatting
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        result.push(line);
      }
      
      // Close any remaining list
      if (inList) {
        result.push('</ul>');
      }
      
      return result.join('');
    }

    // Format timestamp to human-readable "time ago" format
    formatTimeAgo(timestamp) {
      const now = Date.now()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (days > 0) {
        return `${days} day${days > 1 ? "s" : ""} ago`
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`
      } else if (minutes > 0) {
        return `${minutes} min${minutes > 1 ? "s" : ""} ago`
      } else {
        return "Just now"
      }
    }

    // View cached content in a beautiful modal
    async viewCacheContent(cacheKey, type) {
      try {
        // The cacheKey comes from the display, which has already removed ai_cache_ prefix
        // So we need to add it back when looking up in GM storage
        const fullCacheKey = cacheKey.startsWith("ai_cache_")
          ? cacheKey
          : `ai_cache_${cacheKey}`

        //console.log("🔍 ViewCacheContent: Looking for cache key:", fullCacheKey)

        const cached = await GM.getValue(fullCacheKey, null)
        if (!cached) {
          alert("Cache content not found!")
          return
        }

        const parsedCache = JSON.parse(cached)
        const content = parsedCache.content
        const timestamp = new Date(parsedCache.timestamp)
          .toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .replace(",", "")

        let formattedContent = ""

        if (type === "Summary") {
          // Use unified storage format - content.raw contains the markdown
          formattedContent = `
            <div style="margin-bottom: 15px; padding: 10px; background: #0a1f3d; border-radius: 6px;">
              <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">📄 Summary Content</div>
              <div style="color: #e8eaed; line-height: 1.5;">${this.formatMarkdownToHTML(content.raw)}</div>
            </div>
          `
        } else if (type === "Q&A") {
          // Q&A cache uses unified format - content.raw contains the markdown answer
          formattedContent = `
            <div style="margin-bottom: 15px; padding: 10px; background: #0f2142; border-radius: 6px;">
              <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">💡 Answer</div>
              <div style="color: #e8eaed; line-height: 1.5;">${this.formatMarkdownToHTML(content.raw)}</div>
            </div>
          `
        }

        window.raTutor.uiManager.showDataModal(
          `🤖 ${type} Cache Content`,
          `
          <div style="margin-bottom: 15px; padding: 8px; background: #2c4a7c; border-radius: 4px; text-align: center;">
            <div style="color: #7f8c8d; font-size: 11px;">Generated: ${timestamp}</div>
            <div style="color: #7f8c8d; font-size: 11px;">Age: ${this.formatTimeAgo(
              parsedCache.timestamp
            )}</div>
          </div>
          ${formattedContent}
        `
        )
      } catch (error) {
        console.error("Error viewing cache content:", error)
        alert(`Error loading cache content: ${error.message}`)
      }
    }

    async answerQuestion(question, content, languageInstruction = "") {
      // Check unified storage first
      const pageUrl = window.location.pathname
      const existingResponses = await this.getPageAIResponses(pageUrl, "qa")

      // Look for existing answer to same question
      const cached = existingResponses.find(
        r =>
          r.request.question === question &&
          r.request.languageInstruction === languageInstruction
      )

      if (cached) {
        console.log("✅ Using cached unified Q&A (no API call needed)", {
          pageUrl,
          age: this.formatTimeAgo(cached.timestamp),
        })
        return this.formatMarkdownToHTML(cached.response.raw)
      }

      if (!this.apiKey) {
        return "❌ AI-powered Q&A requires an API key. Please configure your Mistral API key in the settings."
      }

      try {
        const prompt = `You are a radiology education expert. Answer the following question based on the provided content.

        CONTENT: "${content.substring(0)}"

        QUESTION: "${question}"

        INSTRUCTIONS:
        - Provide a clear, educational answer based on the content
        - If the question cannot be answered from the content, say so
        - Use medical terminology appropriately for learning
        - Keep the answer concise but informative
        - Focus on radiology and medical education aspects${languageInstruction}

        ANSWER:`

        const response = await this.callMistralAPI(prompt, null, {
          type: "qa",
          pageUrl,
          question: question.substring(0),
        })

        if (response && response.content) {
          const rawAnswer = response.content.trim()
          console.log("🤖 AI Answer:", rawAnswer) //underDEV DELETE LATER
          const formattedAnswer = this.formatMarkdownToHTML(rawAnswer)

          // UNIFIED STORAGE ONLY: Store as AI response
          const responseKey = await this.storeAIResponse(
            pageUrl,
            "qa",
            {
              question,
              content: content.substring(0),
              languageInstruction,
            },
            { raw: rawAnswer, parsed: formattedAnswer },
            { model: this.model, questionLength: question.length }
          )

          //console.log("✅ Q&A generated and stored in unified system", {
          //  pageUrl,
          //  responseKey: responseKey?.substring(0, 50) + "...",
          //})

          return formattedAnswer
        } else {
          throw new Error("Invalid response from Mistral AI")
        }
      } catch (error) {
        console.error("❌ Error generating AI answer:", error)
        // Re-throw the error with API details intact so UI can handle it properly
        throw error
      }
    }

    // Track API call using GM storage only
    async trackApiCallGM() {
      try {
        const dataManager = window.raTutor ? window.raTutor.dataManager : null
        if (!dataManager) return

        const statsKey = `api_stats_${this.getContentHash(
          window.location.pathname
        )}`
        let stats = await dataManager.loadData(statsKey, {
          apiCallsTotal: 0,
          lastApiCall: null,
        })

        stats.apiCallsTotal = (stats.apiCallsTotal || 0) + 1
        stats.lastApiCall = Date.now()
        await dataManager.saveData(statsKey, stats)
        //console.log(
        //  `API call tracked (GM storage). Total: ${stats.apiCallsTotal}`
        //)
      } catch (error) {
        console.error("Error tracking API call (GM storage):", error)
      }
    }

    // Sanitize content to remove any potential personal information
    sanitizeContent(content) {
      // Remove email addresses, phone numbers, and other PII patterns
      return content
        .replace(
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
          "[EMAIL]"
        )
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]")
        .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[CARD]")
        .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[NAME]") // Simple name pattern
    }

    // Validate quiz data contains no personal information
    validateQuizData(quizData) {
      const sensitivePatterns = [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // emails
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // phone numbers
        /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // card numbers
      ]

      const checkText = JSON.stringify(quizData)
      for (const pattern of sensitivePatterns) {
        if (pattern.test(checkText)) {
          console.warn("🔒 GDPR: Personal data detected in quiz content")
          throw new Error(
            "Generated content contains sensitive data. Please try again."
          )
        }
      }

      return quizData
    }

    // Helper function to format API errors with user-friendly messages
    formatApiError(error, context = {}) {
      // Check if it's an HTTP response error
      if (error.responseText) {
        const status = error.status

        try {
          const errorData = JSON.parse(error.responseText)

          switch (status) {
            case 401:
              return {
                type: "auth",
                title: "🔑 API Key Issue",
                message:
                  "Your API key is invalid or has expired. Please check your key or generate a new one.",
                suggestion:
                  "Go to Settings → Manage Key to update your API key",
                technical: errorData.message || "Authentication failed",
              }
            case 403:
              return {
                type: "permission",
                title: "🚫 Access Denied",
                message:
                  "Your API key doesn't have permission to access this service.",
                suggestion:
                  "Check your Mistral AI account permissions and billing status",
                technical: errorData.message || "Forbidden access",
              }
            case 429:
              return {
                type: "rate_limit",
                title: "⏱️ Rate Limit Exceeded",
                message:
                  "Too many requests. Please wait a moment before trying again.",
                suggestion:
                  "Try again in a few minutes or upgrade your API plan",
                technical: errorData.message || "Rate limit exceeded",
              }
            case 400:
              return {
                type: "bad_request",
                title: "⚠️ Request Error",
                message: "There was an issue with the request format.",
                suggestion:
                  "This is likely a temporary issue. Please try again.",
                technical: errorData.message || "Bad request format",
              }
            case 500:
            case 502:
            case 503:
              return {
                type: "server_error",
                title: "🔧 Server Issue",
                message: "Mistral AI service is temporarily unavailable.",
                suggestion: "Please try again in a few minutes",
                technical: errorData.message || `Server error (${status})`,
              }
            default:
              return {
                type: "unknown_http",
                title: "❌ Connection Error",
                message: `Unexpected server response (${status}).`,
                suggestion: "Check your internet connection and try again",
                technical: errorData.message || `HTTP ${status} error`,
              }
          }
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError)
          return {
            type: "parse_error",
            title: "❌ Communication Error",
            message: `Unable to communicate with Mistral AI (${status}).`,
            suggestion: "Check your internet connection and API key",
            technical: error.responseText || "Failed to parse error response",
          }
        }
      }

      // Network or other errors
      if (error.message) {
        if (error.message.includes("API key required")) {
          return {
            type: "no_key",
            title: "🔑 API Key Required",
            message:
              "No API key configured. You need a Mistral AI API key to use AI features.",
            suggestion:
              'Click the "Setup API Key" button to configure your key',
            technical: "API key not found in storage",
          }
        }

        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          return {
            type: "network",
            title: "🌐 Network Error",
            message: "Cannot connect to Mistral AI servers.",
            suggestion: "Check your internet connection and try again",
            technical: error.message,
          }
        }
      }

      // Generic fallback
      return {
        type: "generic",
        title: "❌ Unexpected Error",
        message: "Something went wrong while processing your request.",
        suggestion: "Please try again or check your API key in settings",
        technical: error.message || "Unknown error occurred",
      }
    }

    // Unified API call method with tracking
    async callMistralAPI(prompt, model = null, context = {}) {
      console.log("🤖 AI API call initiated")

      if (!this.apiKey) {
        const noKeyError = new Error("API key required for Mistral AI calls")
        noKeyError.apiErrorDetails = {
          type: "no_key",
          title: "🔑 API Key Required",
          message:
            "No API key configured. You need a Mistral AI API key to use AI features.",
          suggestion:
            'Click "Setup API Key" or go to Settings → Manage Key to configure your key',
          technical: "API key not found in storage",
        }
        throw noKeyError
      }

      try {
        const response = await GM.xmlHttpRequest({
          method: "POST",
          url: `${this.baseURL}/chat/completions`,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            model: model || this.model,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            // No max_tokens limit - let the model complete naturally
            // With our comprehensive caching system, we want complete responses
            //temperature: 0.7,
          }),
        })

        // Track API call for transparency (GM storage only)
        await this.trackApiCallGM()

        const data = JSON.parse(response.responseText)

        // 🔍 DETAILED API RESPONSE LOGGING FOR ANALYSIS
        //console.log("🚀 === COMPLETE MISTRAL API RESPONSE ANALYSIS ===")
        //console.log("📊 Full Response Status:", response.status)
        //console.log("📊 Response Headers:", response.responseHeaders)
        //console.log(
        //  "📊 Raw Response Text Length:",
        //  response.responseText.length
        //)
        //console.log(
        //  "📊 Raw Response Text (first 2000 chars):",
        //  response.responseText.substring(0, 2000)
        //)
        //console.log(
        //  "📊 Raw Response Text (last 1000 chars):",
        //  response.responseText.substring(response.responseText.length - 1000)
        //)

        //console.log("🔍 === PARSED JSON DATA STRUCTURE ===")
        //console.log("📊 Complete Data Object:", data)
        //console.log("📊 Data Keys:", Object.keys(data))

        if (data.choices && data.choices.length > 0) {
          //console.log("📊 Choices Array Length:", data.choices.length)
          //console.log("📊 First Choice Object:", data.choices[0])
          //console.log("📊 First Choice Keys:", Object.keys(data.choices[0]))

          if (data.choices[0].message) {
            //console.log("📊 Message Object:", data.choices[0].message)
            //console.log(
            //  "📊 Message Keys:",
            //  Object.keys(data.choices[0].message)
            //)
            console.log(
              "📊 Message Content Length:",
              data.choices[0].message.content?.length
            )
            //console.log(
            //  "📊 Message Content (first 1500 chars):",
            //  data.choices[0].message.content?.substring(0, 1500)
            // )
          }
        }

        //if (data.usage) {
        //console.log("📊 API Usage Stats:", data.usage)
        //}

        //console.log("🔍 === END API RESPONSE ANALYSIS ===")

        // Check for valid response structure
        if (
          !data.choices ||
          !data.choices.length ||
          !data.choices[0]?.message?.content
        ) {
          const invalidResponseError = new Error(
            "Invalid or empty response from Mistral AI"
          )
          invalidResponseError.apiErrorDetails = {
            type: "invalid_response",
            title: "⚠️ Invalid Response",
            message: "The AI service returned an unexpected response format.",
            suggestion: "This might be a temporary issue. Please try again.",
            technical: `Response structure: ${JSON.stringify(
              Object.keys(data)
            )}`,
          }
          throw invalidResponseError
        }

        // 💰 DYNAMIC TOKEN COST CALCULATION
        if (data.usage) {
          const cost = await this.calculateCost(
            model || this.model,
            data.usage.prompt_tokens || 0,
            data.usage.completion_tokens || 0
          )

          await this.logTokenUsage(
            context.type || "unknown",
            context.pageUrl || window.location.pathname,
            model || this.model,
            {
              prompt: data.usage.prompt_tokens || 0,
              completion: data.usage.completion_tokens || 0,
              total: data.usage.total_tokens || 0,
            },
            cost,
            context.requestId || null
          )
        }

        return {
          content: data.choices[0].message.content,
        }
      } catch (error) {
        // Create a more detailed error object for better handling
        const formattedError = this.formatApiError(error, context)
        const enhancedError = new Error(formattedError.message)
        enhancedError.apiErrorDetails = formattedError
        enhancedError.originalError = error

        throw enhancedError
      }
    }

    // 💰 GET TOKEN USAGE STATISTICS (now from simplified logs)
    async getTokenUsageStats() {
      try {
        const logs = await this.getTokenUsageLogs()
        if (!logs.length) return null

        // UI can format these logs as needed - daily summaries, totals, etc.
        const totalTokens = logs.reduce((sum, log) => sum + log.tokens.total, 0)
        const totalCost = logs.reduce((sum, log) => sum + log.cost, 0)
        const totalCalls = logs.length

        return {
          totalTokens,
          totalCost,
          totalApiCalls: totalCalls,
          firstCall: logs[logs.length - 1]?.timestamp,
          lastCall: logs[0]?.timestamp,
          rawLogs: logs, // Raw data for detailed analysis
        }
      } catch (error) {
        console.error("Error getting token usage stats:", error)
        return null
      }
    }

    // 🏷️ HELPER METHODS FOR DYNAMIC CONTENT PARSING
    formatFieldNameAsTitle(fieldName) {
      // Convert camelCase or snake_case field names to readable titles
      return fieldName
        .replace(/([A-Z])/g, " $1") // Add space before capitals
        .replace(/_/g, " ") // Replace underscores with spaces
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
        .trim()
    }

    getEmojiForField(fieldName) {
      // Map field names to appropriate emojis for better UX
      const emojiMap = {
        keyPoints: "🎯",
        clinicalPearls: "💎",
        differentials: "🔍",
        imagingPearls: "📸",
        technicalTips: "⚙️",
        clinicalPoints: "🏥",
        diagnosticApproach: "🩺",
        keyTakeaways: "📝",
        imagingApproach: "📋",
        keyDistinguishers: "🔬",
        focusAreas: "🎓",
        treatmentApproach: "💊",
        pathologyFindings: "🔬",
      }

      return emojiMap[fieldName] || "📌" // Default emoji if not found
    }

    // Get Q&A history for a specific page from unified storage
    async getQAHistory(pageUrl) {
      try {
        const responses = await this.getPageAIResponses(pageUrl, "qa")

        // Convert to the expected format for backward compatibility
        return responses
          .map(response => ({
            question: response.request.question,
            answer: this.formatMarkdownToHTML(response.response.raw),
            timestamp: response.timestamp,
          }))
          .reverse() // Most recent first
      } catch (error) {
        console.error("Error getting Q&A history:", error)
        return []
      }
    }

    // ========================================
    // 💰 PRICING MANAGEMENT METHODS
    // ========================================

    // Get current pricing for a model (from storage or config)
    async getCurrentPricing(model = null) {
      try {
        // Use provided model or fallback to current model
        const targetModel = model || this.model

        // Try to get user-updated pricing from storage first
        const customPricing = await GM.getValue("mistral_pricing", null)
        if (customPricing) {
          const pricing = JSON.parse(customPricing)
          if (pricing[targetModel]) {
            return pricing[targetModel]
          }
          if (pricing["default"]) {
            return pricing["default"]
          }
        }

        // Fallback to CONFIG pricing
        if (CONFIG.PRICING && CONFIG.PRICING[targetModel]) {
          return CONFIG.PRICING[targetModel]
        }

        // Final fallback to default config pricing
        return CONFIG.PRICING["default"] || { input: 0.003, output: 0.009 }
      } catch (error) {
        console.error("Error getting pricing:", error)
        // Return safe default
        return { input: 0.003, output: 0.009 }
      }
    }

    // Update pricing for a specific model
    async updateModelPricing(model, inputCost, outputCost) {
      try {
        // Get existing custom pricing or start fresh
        let customPricing = {}
        const existing = await GM.getValue("mistral_pricing", null)
        if (existing) {
          customPricing = JSON.parse(existing)
        }

        // Update the specific model pricing
        customPricing[model] = {
          input: parseFloat(inputCost),
          output: parseFloat(outputCost),
          lastUpdated: Date.now(),
        }

        // Save back to storage
        await GM.setValue("mistral_pricing", JSON.stringify(customPricing))
        console.log(
          `💰 Updated pricing for ${model}: input=$${inputCost}, output=$${outputCost}`
        )

        return true
      } catch (error) {
        console.error("Error updating pricing:", error)
        return false
      }
    }

    // Calculate cost for a specific API call
    async calculateCost(model, promptTokens, completionTokens) {
      try {
        const pricing = await this.getCurrentPricing(model)

        // Convert per-1K-token pricing to per-token
        const inputCostPerToken = pricing.input / 1000
        const outputCostPerToken = pricing.output / 1000

        const totalCost =
          promptTokens * inputCostPerToken +
          completionTokens * outputCostPerToken

        return totalCost
      } catch (error) {
        console.error("Error calculating cost:", error)
        // Fallback to old hardcoded calculation
        return promptTokens * 0.000003 + completionTokens * 0.000009
      }
    }

    // Get all available pricing information
    async getAllPricing() {
      try {
        // Get custom pricing from storage
        const customPricing = await GM.getValue("mistral_pricing", null)
        let custom = {}
        if (customPricing) {
          custom = JSON.parse(customPricing)
        }

        return {
          default: CONFIG.PRICING || {},
          custom: custom,
          effective: { ...CONFIG.PRICING, ...custom }, // Custom overrides default
        }
      } catch (error) {
        console.error("Error getting all pricing:", error)
        return {
          default: CONFIG.PRICING || {},
          custom: {},
          effective: CONFIG.PRICING || {},
        }
      }
    }

    // Get user's default length preference
    async getDefaultLengthPreference() {
      try {
        return await GM.getValue("ra_tutor_length", "medium")
      } catch (error) {
        console.error("Error loading length preference:", error)
        return "medium" // Default fallback
      }
    }
  }

  // ========================================
  // 🎨 UI MANAGER
  // ========================================
  class UIManager {
    constructor(aiTutor, dataManager) {
      this.aiTutor = aiTutor
      this.dataManager = dataManager
      this.isMinimized = CONFIG.TUTOR_PANEL_OPEN_BY_DEFAULT ? false : true
      this.currentTab = "summary" // Start with summary tab
      this.currentQuiz = null
      this.currentSummaryType = null // Track current summary type for regeneration
    }

    init() {
      this.injectStyles()
      this.createTutorPanel()
      this.createScrollProgressBar()

      // Set initial toggle button state
      const toggleButton = document.getElementById("ra-tutor-toggle")
      if (toggleButton) {
        toggleButton.style.display = this.isMinimized ? "block" : "none"
      }

      // Initialize summary content after a brief delay to ensure DOM is ready
      setTimeout(async () => {
        await this.updateSummaryTab()
      }, 200)
    }

    injectStyles() {
      GM.addStyle(CSS_STYLES)
    }

    createScrollProgressBar() {
      // Remove existing scroll bar if it exists
      const existingScrollBar = document.getElementById("ra-scroll-progress")
      if (existingScrollBar) {
        existingScrollBar.remove()
      }

      // Get page content to calculate word count (now always uses clean extractor)
      const pageContent = this.aiTutor.extractPageContent();
      const wordCount = pageContent ? pageContent.trim().split(/\s+/).length : 0;
      const readingTime = Math.ceil(wordCount / 80); // 80 words per minute for learning, rough estimate
      // ...existing code...

      // Create scroll progress container
      const scrollContainer = document.createElement("div")
      scrollContainer.id = "ra-scroll-progress"

      Object.assign(scrollContainer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        height: "25px",
        background: "linear-gradient(135deg, #123262, #1a3a6b)",
        border: "none",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
        zIndex: "99997",
        display: "flex",
        alignItems: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "11px",
        color: "#e8eaed",
      })

      // Create word count and reading time info (left side)
      const infoDiv = document.createElement("div")
      infoDiv.style.cssText = `
        padding: 0 12px;
        background: rgba(113, 152, 248, 0.1);
        border-radius: 0 15px 15px 0;
        font-weight: bold;
        min-width: 140px;
        text-align: center;
        border-right: 1px solid #7198f8;
      `

      // Set initial content
      infoDiv.innerHTML = `${wordCount.toLocaleString()} words • ${readingTime} min read • 0%`

      // Create progress bar container (center/right)
      const progressContainer = document.createElement("div")
      progressContainer.style.cssText = `
        flex: 1;
        margin: 0 12px;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
      `

      // Create progress bar fill
      const progressFill = document.createElement("div")
      progressFill.id = "ra-scroll-fill"
      progressFill.style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, #7198f8, #28a745);
        border-radius: 4px;
        width: 0%;
        transition: width 0.1s ease-out;
      `

      progressContainer.appendChild(progressFill)
      scrollContainer.appendChild(infoDiv)
      scrollContainer.appendChild(progressContainer)

      // Add to page
      document.body.appendChild(scrollContainer)

      // Add scroll listener to update progress
      let scrollPercent = 0
      const updateScrollProgress = () => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight
        scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

        progressFill.style.width = `${Math.min(
          100,
          Math.max(0, scrollPercent)
        )}%`

        const newContent = `${wordCount.toLocaleString()} words • ${readingTime} min read • ${Math.round(
          scrollPercent
        )}%`

        infoDiv.innerHTML = newContent
      }

      // Initial update and add listener
      updateScrollProgress()
      window.addEventListener("scroll", updateScrollProgress, { passive: true })

      // Adjust page content to account for the scroll bar - target specific page header
      const adjustPageContent = () => {
        // Add margin to body
        document.body.style.marginTop = "25px"

        // Target the specific navbar with the exact selector path
        const specificNavbar = document.querySelector(
          "body > nav.flex-wrap.px-4.fixed.w-full.z-20.top-0.bg-back, nav.flex-wrap.px-4.md\\:px-6.pt-2.fixed.w-full.z-20.top-0.bg-back"
        )
        if (specificNavbar) {
          // Move it down by our scroll bar height
          specificNavbar.style.top = "25px"
        }

        // Fallback more general selector in case the above doesn't work
        const fallbackNavbar = document.querySelector(
          'nav[class*="flex-wrap"][class*="fixed"][class*="top-0"]'
        )
        if (fallbackNavbar && fallbackNavbar !== specificNavbar) {
          fallbackNavbar.style.top = "25px"
          console.log("📍 Adjusted navbar via fallback selector")
        }

        // Adjust common content containers that might be positioned at top
        const selectors = [
          "#content",
          ".content",
          "main",
          ".main",
          "#main",
          "article",
          ".article",
        ]
        selectors.forEach(selector => {
          const element = document.querySelector(selector)
          if (element && !element.style.marginTop) {
            element.style.marginTop = "25px"
          }
        })

        // General fallback for any other fixed headers
        const headers = document.querySelectorAll("header, .header, #header")
        headers.forEach(header => {
          if (
            header.style.position === "fixed" ||
            getComputedStyle(header).position === "fixed"
          ) {
            header.style.top = "25px"
          }
        })
      }

      // Apply immediately and after a short delay to catch dynamic content
      adjustPageContent()
      setTimeout(adjustPageContent, 500)
    }

    createTutorPanel() {
      const panel = document.createElement("div")
      panel.id = "ra-tutor-panel"

      // Use direct style assignment
      Object.assign(panel.style, {
        position: "fixed",
        top: "25px", // Add top padding to accommodate scroll bar
        right: "0",
        width: "365px",
        height: "calc(100vh - 25px)", // Adjust height to account for top offset
        background: "linear-gradient(145deg, #123262, #387593ff)",
        boxShadow: "-5px 0 20px rgba(0, 0, 0, 0.3)",
        zIndex: "99999",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        overflowY: "auto",
        color: "#e8eaed",
        display: "flex",
        flexDirection: "column",
        transform: this.isMinimized
          ? "translateX(calc(100% - 10px))"
          : "translateX(0)",
      })

      panel.innerHTML = `
                <div class="tutor-content" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                    <!-- Tab buttons temporarily disabled during development 
                    <div class="tab-buttons" style="flex-shrink: 0;">
                        <button class="tab-button active" data-action="tab" data-tab="summary">Summary</button>
                        <button class="tab-button" data-action="tab" data-tab="quiz">Quiz</button>
                    </div>
                    -->

                    <div id="summary-tab" class="tutor-tab active" style="flex: 1; overflow-y: auto; min-height: 0; padding: 5px;">
                        <div id="summary-content" style="width: 100%; min-height: 200px;">
                            <div style="text-align: center;">
                                <div style="color: #7198f8; font-size: 14px; font-weight: bold;">Loading AI summary...</div>
                                <div style="color: #95a5a6; font-size: 11px; margin-top: 5px;">Analyzing page content</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quiz tab temporarily disabled during development
                    <div id="quiz-tab" class="tutor-tab">
                        <div id="quiz-content">
                            <button data-action="generate-quiz" style="width: 100%; padding: 5px; background: linear-gradient(135deg, #7198f8 0%, #42a0d6ff 100%); color: white; border: none; border-radius: 8px; cursor: pointer;">
                                🧠 Test My Knowledge
                            </button>
                        </div>
                    </div>
                    -->
                </div>

                <!-- Clean Settings Section - Integrated Design -->
                <div class="tutor-settings" style="flex-shrink: 0; padding: 8px; background: rgba(18, 50, 98, 0.3); font-size: 11px; border-top: 1px solid #2c4a7c; position: relative;">
                    <div style="display: flex; justify-content: flex-start; align-items: center;">
                        <!-- Data Review Button - Main Feature -->
                        <button id="data-review-btn" style="padding: 6px 8px; background: rgba(23, 162, 184, 0.2); color: #17a2b8; border: 1px solid #17a2b8; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight: bold; transition: all 0.2s ease;" title="Review your learning data and usage statistics">
                            📊 Data
                        </button>
                    </div>
                    
                    <!-- Integrated Settings Icon - Top Right Corner -->
                    <button id="open-settings-modal" style="position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; background: rgba(113, 152, 248, 0.1); color: #7198f8; border: 1px solid rgba(113, 152, 248, 0.3); border-radius: 50%; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; z-index: 1;" title="Open settings">
                        ⚙️
                    </button>
                </div>
                
                <!-- Attribution Footer - Fixed to bottom -->
                <div class="tutor-footer" style="flex-shrink: 0; padding: 9px 9px; border-top: 1px solid #2c4a7c; background: #0f2142; font-size: 10px; color: #95a5a6; text-align: center; line-height: 1.4;">
                    Made with ❤️ by 
                    <a href="https://www.simonrekanovic.com" target="_blank" style="color: #7198f8; text-decoration: none;">simonrekanovic.com</a> • find me on 
                    <a href="https://www.linkedin.com/in/simonrekanovic" target="_blank" style="color: #7198f8; text-decoration: none;">LinkedIn</a><br>
                    <span style="font-size: 10px; color: #7f8c8d;">The radiology assistant tutor v${
                      GM.info ? GM.info.script.version : ""
                    }
                    <br><strong>CAUTION: AI may generate incorrect or misleading information. Always verify with reliable sources.</strong> </span>
                </div>
            `

      document.body.appendChild(panel)

      // Add event listeners to avoid timing issues with window.raTutor
      this.addPanelEventListeners(panel)

      // Create floating toggle button for when sidebar is hidden
      const toggleButton = document.createElement("button")
      toggleButton.id = "ra-tutor-toggle"
      toggleButton.innerHTML = "🧠"

      // Use direct style assignment for the toggle button
      Object.assign(toggleButton.style, {
        position: "fixed",
        right: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "#7198f8",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        zIndex: "99998",
        display: this.isMinimized ? "block" : "none",
        transition: "all 0.3s ease",
      })

      toggleButton.onclick = () => {
        if (window.raTutor && window.raTutor.ui) {
          window.raTutor.ui.togglePanel()
        } else {
          console.warn("🔒 GDPR: Tutor not fully initialized yet")
        }
      }

      // Add hover effects via event listeners
      toggleButton.addEventListener("mouseenter", () => {
        toggleButton.style.transform = "translateY(-50%) scale(1.1)"
        toggleButton.style.boxShadow = "0 6px 20px rgba(18, 50, 98, 0.6)"
      })

      toggleButton.addEventListener("mouseleave", () => {
        toggleButton.style.transform = "translateY(-50%)"
        toggleButton.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)"
      })

      toggleButton.title = "Open AI Tutor"
      document.body.appendChild(toggleButton)
    }

    addPanelEventListeners(panel) {
      // Tab buttons
      const tabButtons = panel.querySelectorAll('[data-action="tab"]')
      tabButtons.forEach(button => {
        button.addEventListener("click", () => {
          const tab = button.getAttribute("data-tab")
          this.switchTab(tab)
        })
      })

      // Generate quiz button
      // const generateQuizBtn = panel.querySelector(
      //   '[data-action="generate-quiz"]'
      // )
      // if (generateQuizBtn) {
      //   generateQuizBtn.addEventListener("click", () => this.generateQuiz())
      // }

      // Event delegation for dynamically created buttons
      panel.addEventListener("click", e => {
        if (e.target.dataset.action === "setup-api") {
          this.showApiKeySetup()
        } else if (e.target.dataset.action === "clear-data") {
          this.clearAllData()
        } else if (e.target.dataset.action === "manage-api-key") {
          this.showApiKeySetup()
        } else if (e.target.dataset.action === "test-api-key") {
          this.testApiKey()
        } else if (e.target.dataset.action === "view-pricing") {
          this.showPricingOverview()
        } else if (e.target.dataset.action === "update-pricing") {
          this.showPricingEditor()
        } else if (e.target.dataset.action === "view-data-overview") {
          this.showDataOverview()
        } else if (e.target.dataset.action === "export-data") {
          this.exportAllData()
        } else if (e.target.dataset.action === "purge-data-keep-key") {
          console.log("🗑️ Purge data (keep key) clicked")
          this.purgeDataKeepKey()
        } else if (e.target.dataset.action === "purge-all-data") {
          console.log("💥 Purge all data clicked")
          this.purgeAllData()
        }
      })

      // Settings and Data Review buttons
      const settingsHeader = panel.querySelector(".tutor-settings")
      if (settingsHeader) {
        // Settings modal button - integrated design
        const openSettingsModal = settingsHeader.querySelector(
          "#open-settings-modal"
        )
        if (openSettingsModal) {
          openSettingsModal.addEventListener("click", () =>
            this.showSettingsModal()
          )

          // Add hover effects for small integrated button
          openSettingsModal.addEventListener("mouseenter", () => {
            openSettingsModal.style.background = "rgba(113, 152, 248, 0.8)"
            openSettingsModal.style.color = "white"
            openSettingsModal.style.transform = "scale(1.1)"
          })
          openSettingsModal.addEventListener("mouseleave", () => {
            openSettingsModal.style.background = "rgba(113, 152, 248, 0.1)"
            openSettingsModal.style.color = "#7198f8"
            openSettingsModal.style.transform = "scale(1)"
          })
        }

        // Data review button
        const dataReviewBtn = settingsHeader.querySelector("#data-review-btn")
        if (dataReviewBtn) {
          dataReviewBtn.addEventListener("click", () => this.showDataOverview())

          // Add hover effects
          dataReviewBtn.addEventListener("mouseenter", () => {
            dataReviewBtn.style.background = "#17a2b8"
            dataReviewBtn.style.color = "white"
          })
          dataReviewBtn.addEventListener("mouseleave", () => {
            dataReviewBtn.style.background = "rgba(23, 162, 184, 0.2)"
            dataReviewBtn.style.color = "#17a2b8"
          })
        }
      }

      // Language selection handler (now in modal)
      // Length preference now handled by modal, no dropdown to listen to

      // Initialize settings content (for modal)
      this.updateSettingsContent()
    }

    async updateSummaryTab() {
      const content = document.getElementById("summary-content")
      if (!content) {
        console.log("📋 No summary-content element found")
        return
      }

      // Check if AI features are available
      const hasKey = this.aiTutor.hasApiKey()
      //console.log("📋 API key available:", hasKey)

      if (!hasKey) {
        console.log("📋 No API key - showing setup UI")
        content.innerHTML = `
          <div style="text-align: center; padding: 30px;">
            <div style="font-size: 48px; margin-bottom: 20px;">🧠</div>
            <h3 style="color: #7198f8; margin-bottom: 15px;">AI-Powered Learning Assistant</h3>
            <p style="color: #b0bec5; line-height: 1.6; margin-bottom: 25px;">
              Get intelligent summaries, ask questions, and enhance your radiology learning with AI.
            </p>
            <button data-action="setup-api" style="padding: 12px 24px; background: linear-gradient(135deg, #7198f8, #28a745); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 4px 12px rgba(113, 152, 248, 0.3);">
              🔧 Setup API Key to Begin
            </button>
            <div style="margin-top: 20px; padding: 15px; background: rgba(113, 152, 248, 0.1); border-radius: 8px; border-left: 4px solid #7198f8;">
              <div style="font-size: 12px; color: #95a5a6; line-height: 1.5;">
                <strong>📊 Page Stats:</strong> Word count and reading progress are shown in the progress bar above.
              </div>
            </div>
          </div>
        `

        // Note: Event listener for setup-api button is handled by event delegation above
        // No need for direct event listener to avoid double-triggering
        return
      }

      //console.log("📋 API key available - showing summary interface")
      content.innerHTML = "🔄 Analyzing page content..."

      try {
        const pageContent = this.aiTutor.extractPageContent()

        // Check for last summary and show it immediately
        const lastSummary = await this.getLastSummary(window.location.href)

        // Always show the same layout with options at top
        let summaryContentHTML = ""
        let summaryNotice = ""

        if (lastSummary) {
          //console.log("📋 Found last summary, displaying immediately")
          summaryNotice = `
            <div class="last-summary-notice" style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px; padding: 8px 12px; background: rgba(113, 152, 248, 0.1); border-radius: 6px; font-size: 12px; color: #7198f8;">
              <span style="font-size: 14px;">📋</span>
              <span>Last summary</span>
              <span style="margin-left: auto; color: #95a5a6;">${this.getTimeAgo(
                lastSummary.timestamp
              )}</span>
            </div>
          `
          // Use the displaySummary method to get consistent formatting with Q&A section
          summaryContentHTML = `<div id="temp-summary-container"></div>`
        } else {
          summaryContentHTML = `
            <div style="padding: 20px; text-align: center; color: #95a5a6;">
              Select a summary type to generate AI-powered insights
            </div>
          `
        }

        // Always show consistent layout
        content.innerHTML = `
          ${summaryNotice}
       
          <div id="summary-content" style="width: 100%; box-sizing: border-box;">
            ${summaryContentHTML}
          </div>
        `

        const summaryContent = document.getElementById("summary-content")

        // If we have a last summary, display it properly with Q&A section
        if (lastSummary) {
          const tempContainer = content.querySelector("#temp-summary-container")
          if (tempContainer) {
            // Fix: Create proper summary object structure that displaySummary expects
            // Check if content is already HTML or needs formatting
            const isHTML =
              lastSummary.content && lastSummary.content.includes("<")

            const formattedContent = isHTML
              ? lastSummary.content
              : this.aiTutor.formatMarkdownToHTML(lastSummary.content || "")

            const properSummaryObject = {
              raw: lastSummary.content, // Original content (could be markdown or HTML)
              parsed: formattedContent, // Properly formatted HTML content
              metadata: {
                focus: lastSummary.focus || "general",
                timestamp: lastSummary.timestamp,
                cached: true,
              },
            }

            this.displaySummary(properSummaryObject, tempContainer)
          }
        } else {
          // No last summary found, generate a default "Main Points" summary
          // console.log(
          //  "🎯 No last summary found, generating an overview summary"
          //)

          // Set current summary type for default generation using user preferences
          const defaultLength = await this.getLengthPreference()
          this.currentSummaryType = {
            length: defaultLength,
            focus: "key_learning_points",
          }

          summaryContent.innerHTML = "🔄 Generating AI summary..."
          try {
            const pageContent = this.aiTutor.extractPageContent()
            const languageInstruction = await this.getLanguageInstruction()
            const summary = await this.aiTutor.generateSummary(
              pageContent,
              {
                length: this.currentSummaryType.length,
                focus: this.currentSummaryType.focus,
                languageInstruction,
              },
              false // don't bypass cache for new summaries
            )
            this.displaySummary(summary, summaryContent)
          } catch (error) {
            const errorMessage = this.createErrorMessage(error, {
              type: "summary",
            })
            summaryContent.innerHTML = errorMessage.html
            errorMessage.setupEventListeners()
          }
        }
      } catch (error) {
        const errorMessage = this.createErrorMessage(error, { type: "summary" })
        content.innerHTML = errorMessage.html
        errorMessage.setupEventListeners()
        console.error("Summary error:", error)
      }
    }

    // Helper method to format timestamp as "X ago"
    getTimeAgo(timestamp) {
      const now = Date.now()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutes < 1) return "just now"
      if (minutes < 60) return `${minutes}m ago`
      if (hours < 24) return `${hours}h ago`
      if (days < 7) return `${days}d ago`
      return new Date(timestamp).toLocaleDateString()
    }

    displaySummary(summary, container) {
      // Show when this summary was generated using relative time
      const summaryTimestamp = summary.timestamp || Date.now()
      const timeAgo = this.getTimeAgo(summaryTimestamp)

      // Extract length from summary metadata if available - with debugging
      let lengthIndicator = ""

      if (summary.metadata && summary.metadata.length) {
        const lengthMap = {
          short: "📄 Short",
          medium: "📋 Medium",
          long: "📚 Long",
        }
        lengthIndicator =
          lengthMap[summary.metadata.length] || summary.metadata.length
      } else if (this.currentSummaryType && this.currentSummaryType.length) {
        // Fallback to current summary type if metadata is missing
        const lengthMap = {
          short: "📄 Short",
          medium: "📋 Medium",
          long: "📚 Long",
        }
        lengthIndicator =
          lengthMap[this.currentSummaryType.length] ||
          this.currentSummaryType.length
        console.log(
          "🔧 Using fallback length from currentSummaryType:",
          lengthIndicator
        )
      }

      // Use same styling as Q&A answers for consistency but with better spacing
      let html = `
        <div style="margin-top: 8px; padding: 8px; background: #0f2142; border-radius: 4px; color: #e8eaed; line-height: 1.3;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding: 3px 6px; background: #0a1f3d; border-radius: 4px; font-size: 9px; color: #7f8c8d;">
            <span>AI Summary: ${timeAgo}</span>
            ${
              lengthIndicator
                ? `<span style="background: rgba(113, 152, 248, 0.2); padding: 2px 6px; border-radius: 3px; color: #7198f8; font-weight: bold;">${lengthIndicator}</span>`
                : ""
            }
          </div>`

      // Check if this is the new unified format (has raw content)
      if (summary.raw || typeof summary === "string") {
        // Add placeholder div for summary content (will be set via innerHTML after container creation)
        html += `
          <div class="summary-content-area" style="margin-bottom: 6px; font-size: 12px;">
            <!-- Content will be set via innerHTML -->
          </div>
        `
      } else if (
        summary._dynamicSections &&
        summary._dynamicSections.length > 0
      ) {
        // Legacy JSON format support
        summary._dynamicSections.forEach(section => {
          html += `
            <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #2c4a7c;">
              <strong style="color: #7198f8;">${section.emoji} ${
            section.title
          }:</strong><br>
              <div style="margin-top: 6px;">
                ${section.content.map(item => `• ${item}`).join("<br>")}
              </div>
            </div>
          `
        })
      } else {
        // Fallback for any other format
        console.log(
          "Using fallback display for summary without recognized format"
        )
        html += `
          <div style="margin-bottom: 12px; padding: 12px; background: #1a3a6b; border-radius: 6px; text-align: center; color: #95a5a6;">
            <div style="font-size: 14px; margin-bottom: 8px;">🤖 AI Response Processed</div>
            <div style="font-size: 11px;">Content available in exports</div>
          </div>
        `
      }

      // Add modern summary type selection interface
      html += `
        <div style="margin-bottom: 16px; padding: 12px; background: linear-gradient(135deg, #1a3a6b, #123262); border-radius: 8px; border: 1px solid #2c4a7c;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <strong style="color: #7198f8; font-size: 13px;">🎯 Summary Focus</strong>
            <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 10px; color: #95a5a6;">Length:</span>
              <button id="length-preference-btn" style="padding: 4px 8px; background: rgba(113, 152, 248, 0.2); color: #7198f8; border: 1px solid #7198f8; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight: bold; transition: all 0.2s ease;" title="Click to change summary length preference">
                📏 <span id="length-display">Medium</span>
              </button>
            </div>
          </div>
          
          <!-- Equal-level focus options in a 3x1 grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px;">
            <button class="summary-switch modern-btn" data-focus="key_learning_points" style="padding: 8px 6px; background: linear-gradient(135deg, #7198f8, #5a84f0); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 500; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(113, 152, 248, 0.3); text-align: center;">
              <div style="font-size: 14px; margin-bottom: 2px;">📝</div>
              <div>Key Learning</div>
            </button>
            <button class="summary-switch modern-btn" data-focus="imaging_pearls" style="padding: 8px 6px; background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 500; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3); text-align: center;">
              <div style="font-size: 14px; margin-bottom: 2px;">💎</div>
              <div>Imaging Pearls</div>
            </button>
            <button class="summary-switch modern-btn" data-focus="imaging_differential" style="padding: 8px 6px; background: linear-gradient(135deg, #17a2b8, #20c997); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 500; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(23, 162, 184, 0.3); text-align: center;">
              <div style="font-size: 14px; margin-bottom: 2px;">🔍</div>
              <div>Differential</div>
            </button>
          </div>
          
          <!-- Regenerate button with better styling -->
          <button id="regenerate-current-summary" style="width: 100%; padding: 10px 12px; background: linear-gradient(135deg, #fd7e14, #e74c3c); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(253, 126, 20, 0.3);">
            <span style="margin-right: 6px;">🔄</span>
            <span>Regenerate Current Summary</span>
          </button>
        </div>
      `
      // Add Q&A section with history
      html += `
        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #2c4a7c;">
          <strong style="color: #7198f8;">❓ Looking for explanation ❓</strong><br>
          <div style="margin: 8px 0;">
            <input type="text" id="question-input" placeholder="Ask a question about this content..." 
                   style="width: 100%; padding: 8px; border: 1px solid #2c4a7c; border-radius: 4px; background: #1a3a6b; color: white; font-size: 12px;">
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <button id="ask-question" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
              🤔 Get Answer
            </button>
            <button id="show-qa-history" style="padding: 6px 12px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
              📜 Q&A History
            </button>

          </div>
          <div id="qa-history-content" style="margin-top: 10px; display: none;"></div>
          <div id="summary-history-content" style="margin-top: 10px; display: none;"></div>
          <div id="answer-content" style="margin-top: 10px; padding: 10px; background: #0f2142; border-radius: 4px; display: none;"></div>
        </div>
      </div>
      `

      container.innerHTML = html

      // Now set the summary content directly (like your working example)
      if (summary.raw) {
        const formattedContent = this.aiTutor.formatMarkdownToHTML(summary.raw);
        const summaryContentDiv = container.querySelector('.summary-content-area');
        if (summaryContentDiv) {
          summaryContentDiv.innerHTML = formattedContent;
          console.log("✅ Set summary content directly via innerHTML");
        }
      } else if (typeof summary === "string") {
        const formattedString = this.aiTutor.formatMarkdownToHTML(summary);
        const summaryContentDiv = container.querySelector('.summary-content-area');
        if (summaryContentDiv) {
          summaryContentDiv.innerHTML = formattedString;
          console.log("✅ Set string summary content directly via innerHTML");
        }
      }

      // Update the length display with current preference
      this.updateLengthDisplay(container)

      // Add event listeners for summary type switching (uses user's length preference)
      const switchButtons = container.querySelectorAll(".summary-switch")
      switchButtons.forEach(button => {
        // Add hover effects for modern buttons
        button.addEventListener("mouseenter", () => {
          button.style.transform = "translateY(-1px)"
          button.style.boxShadow = button.style.boxShadow.replace(
            "0 2px 6px",
            "0 4px 12px"
          )
        })

        button.addEventListener("mouseleave", () => {
          button.style.transform = "translateY(0)"
          button.style.boxShadow = button.style.boxShadow.replace(
            "0 4px 12px",
            "0 2px 6px"
          )
        })

        button.addEventListener("click", async () => {
          const focus = button.getAttribute("data-focus")

          // Get the user's preferred length instead of using hardcoded value
          const userLength = await this.getLengthPreference()

          // Store current summary type for regeneration
          this.currentSummaryType = { length: userLength, focus }

          // Visual feedback
          const originalContent = button.innerHTML
          button.innerHTML = "🔄<div>Loading...</div>"
          button.disabled = true

          // Show loading in the container
          container.innerHTML = "🔄 Loading summary..."

          try {
            const pageContent = this.aiTutor.extractPageContent()
            const languageInstruction = await this.getLanguageInstruction()

            // First try to get from cache (bypassCache: false)
            const summary = await this.aiTutor.generateSummary(
              pageContent,
              {
                length: userLength, // Use user's preference, not button data
                focus: focus,
                languageInstruction,
              },
              false // Check cache first, generate only if missing
            )

            this.displaySummary(summary, container)
          } catch (error) {
            const errorMessage = this.createErrorMessage(error, {
              type: "summary",
            })
            container.innerHTML = errorMessage.html
            errorMessage.setupEventListeners()
            console.error("Summary switching error:", error)
          }
        })
      })

      // Add event listener for length preference button
      const lengthPrefBtn = container.querySelector("#length-preference-btn")
      if (lengthPrefBtn) {
        lengthPrefBtn.addEventListener("click", () => {
          this.showLengthPreferenceModal()
        })
      }

      // Add event listener for regenerating current summary (force bypass cache)
      const regenerateButton = container.querySelector(
        "#regenerate-current-summary"
      )
      if (regenerateButton) {
        // Add hover effects for the regenerate button
        regenerateButton.addEventListener("mouseenter", () => {
          regenerateButton.style.transform = "translateY(-1px)"
          regenerateButton.style.boxShadow =
            "0 4px 12px rgba(253, 126, 20, 0.4)"
        })

        regenerateButton.addEventListener("mouseleave", () => {
          regenerateButton.style.transform = "translateY(0)"
          regenerateButton.style.boxShadow = "0 2px 6px rgba(253, 126, 20, 0.3)"
        })

        regenerateButton.addEventListener("click", async () => {
          // Always use current user preferences for regeneration, not original summary settings
          const currentUserLength = await this.getLengthPreference()
          const currentUserFocus =
            this.currentSummaryType?.focus || "key_learning_points"

          console.log("🔄 REGENERATE: Using current user preferences:", {
            userLength: currentUserLength,
            focus: currentUserFocus,
            originalSummaryLength: this.currentSummaryType?.length || "none",
          })

          // Enhanced visual feedback
          const originalContent = regenerateButton.innerHTML
          regenerateButton.innerHTML = `
            <span style="margin-right: 6px;">🔄</span>
            <span>Regenerating...</span>
          `
          regenerateButton.disabled = true
          regenerateButton.style.opacity = "0.7"

          // Show loading in the container
          container.innerHTML = "🔄 Generating fresh summary..."

          try {
            const pageContent = this.aiTutor.extractPageContent()
            const languageInstruction = await this.getLanguageInstruction()

            // Force regeneration with CURRENT user preferences, not original summary settings
            const summary = await this.aiTutor.generateSummary(
              pageContent,
              {
                length: currentUserLength, // Use current user preference
                focus: currentUserFocus, // Keep same focus as displayed summary
                languageInstruction,
              },
              true // Force bypass cache for fresh content
            )

            // Update currentSummaryType to reflect the new settings
            this.currentSummaryType = {
              length: currentUserLength,
              focus: currentUserFocus,
            }

            this.displaySummary(summary, container)
          } catch (error) {
            const errorMessage = this.createErrorMessage(error, {
              type: "summary",
            })
            container.innerHTML = errorMessage.html
            errorMessage.setupEventListeners()
            console.error("Summary regeneration error:", error)
          }
        })
      }

      // Add Q&A functionality
      const askButton = container.querySelector("#ask-question")
      const questionInput = container.querySelector("#question-input")
      const answerContent = container.querySelector("#answer-content")
      const showHistoryButton = container.querySelector("#show-qa-history")
      const historyContent = container.querySelector("#qa-history-content")

      if (askButton && questionInput) {
        const handleQuestion = async () => {
          const question = questionInput.value.trim()
          if (!question) return

          askButton.textContent = "🔄 Thinking..."
          askButton.disabled = true
          answerContent.style.display = "block"
          answerContent.innerHTML = "🤔 Analyzing your question..."

          try {
            const pageContent = this.aiTutor.extractPageContent()
            const languageInstruction = await this.getLanguageInstruction()

            const answer = await this.aiTutor.answerQuestion(
              question,
              pageContent,
              languageInstruction
            )

            // Check if the answer is an error message (contains error styling)
            if (answer.includes('style="padding: 15px; background: #2c1810')) {
              // It's a formatted error message
              answerContent.innerHTML = answer
            } else {
              // It's a regular answer - format markdown content
              answerContent.innerHTML = `<strong>💡 Answer:</strong><br>${this.aiTutor.formatMarkdownToHTML(answer)}`
              questionInput.value = "" // Clear input after successful answer

              // Refresh history button to show new entry exists
              if (showHistoryButton) {
                showHistoryButton.style.background = "#ffc107"
                showHistoryButton.textContent = "📜 New History!"

                // If history content is currently visible and showing "no questions" message, refresh it
                if (historyContent.style.display === "block") {
                  const pageUrl = window.location.pathname
                  const updatedHistory = await this.aiTutor.getQAHistory(
                    pageUrl
                  )
                  if (updatedHistory.length > 0) {
                    // Auto-refresh the history display to show the new Q&A
                    showHistoryButton.click() // This will hide current content
                    setTimeout(() => showHistoryButton.click(), 100) // Then show updated content
                  }
                }

                setTimeout(() => {
                  showHistoryButton.style.background = "#17a2b8"
                  showHistoryButton.textContent = "📜 View History"
                }, 3000)
              }
            }
          } catch (error) {
            // Format error using the UI createErrorMessage method for consistency
            const errorMessage = this.createErrorMessage(error, { type: "qa" })
            answerContent.innerHTML = errorMessage.html
            errorMessage.setupEventListeners()
          } finally {
            askButton.textContent = "🤔 Get Answer"
            askButton.disabled = false
          }
        }

        askButton.addEventListener("click", handleQuestion)
        questionInput.addEventListener("keypress", e => {
          if (e.key === "Enter") {
            handleQuestion()
          }
        })
      }

      // Add history functionality
      if (showHistoryButton && historyContent) {
        showHistoryButton.addEventListener("click", async () => {
          const pageUrl = window.location.pathname
          const history = await this.aiTutor.getQAHistory(pageUrl)

          if (history.length === 0) {
            historyContent.innerHTML = `
              <div style="padding: 10px; background: #1a3a6b; border-radius: 4px; color: #b0bec5; text-align: center;">
                📜 No questions asked on this page yet.<br>
                <span style="font-size: 10px;">Ask your first question above!</span>
              </div>
            `
          } else {
            let historyHTML = `
              <div style="max-height: 300px; overflow-y: auto; border: 1px solid #2c4a7c; border-radius: 4px;">
                <div style="padding: 8px; background: #1a3a6b; font-weight: bold; border-bottom: 1px solid #2c4a7c;">
                  📜 Q&A History for this page (${history.length} entries)
                </div>
            `

            history.forEach((entry, index) => {
              // Format timestamp properly to EU format (DD.MM.YYYY HH:MM)
              const entryTime = entry.timestamp
                ? new Date(entry.timestamp)
                    .toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    .replace(",", "")
                : "Unknown time"

              historyHTML += `
                <div style="padding: 10px; border-bottom: 1px solid #2c4a7c; background: ${
                  index % 2 === 0 ? "#0f2142" : "#123262"
                };">
                  <div style="font-weight: bold; color: #7198f8; margin-bottom: 5px;">
                    ❓ ${entry.question}
                  </div>
                  <div style="margin-bottom: 5px; font-size: 11px; color: #95a5a6;">
                    🕐 ${entryTime}
                  </div>
                  <div style="color: #e8eaed; font-size: 12px; line-height: 1.4;">
                    ${this.aiTutor.formatMarkdownToHTML(entry.answer)}
                  </div>
                </div>
              `
            })

            historyHTML += `</div>`
            historyContent.innerHTML = historyHTML
          }

          // Toggle visibility
          if (historyContent.style.display === "none") {
            historyContent.style.display = "block"
            showHistoryButton.textContent = "🔼 Hide Q&A History"
          } else {
            historyContent.style.display = "none"
            showHistoryButton.textContent = "📜 Q&A History"
          }
        })
      }

      // Add summary history functionality TODO: cleanup
      const showSummaryHistoryButton = container.querySelector(
        "#show-summary-history"
      )
      const summaryHistoryContent = container.querySelector(
        "#summary-history-content"
      )

      if (showSummaryHistoryButton && summaryHistoryContent) {
        showSummaryHistoryButton.addEventListener("click", async () => {
          const pageUrl = window.location.pathname
          const summaries = await this.getSummaryHistory(pageUrl)

          if (summaries.length === 0) {
            summaryHistoryContent.innerHTML = `
              <div style="padding: 10px; background: #1a3a6b; border-radius: 4px; color: #b0bec5; text-align: center;">
                📄 No summaries generated for this page yet.<br>
                <span style="font-size: 10px;">Generate your first summary above!</span>
              </div>
            `
          } else {
            let summaryHTML = `
              <div style="max-height: 300px; overflow-y: auto; border: 1px solid #2c4a7c; border-radius: 4px;">
                <div style="padding: 8px; background: #1a3a6b; font-weight: bold; border-bottom: 1px solid #2c4a7c;">
                  📄 Summary History for this page (${summaries.length} entries)
                </div>
            `

            summaries.forEach((entry, index) => {
              // Format timestamp properly to EU format (DD.MM.YYYY HH:MM)
              const entryTime = entry.timestamp
                ? new Date(entry.timestamp)
                    .toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    .replace(",", "")
                : "Unknown time"

              summaryHTML += `
                <div style="padding: 10px; border-bottom: 1px solid #2c4a7c; background: ${
                  index % 2 === 0 ? "#0f2142" : "#123262"
                };">
                  <div style="font-weight: bold; color: #ffc107; margin-bottom: 5px;">
                    📄 Summary ${index + 1}
                  </div>
                  <div style="margin-bottom: 5px; font-size: 11px; color: #95a5a6;">
                    🕐 ${entryTime}
                  </div>
                  <div style="color: #e8eaed; font-size: 12px; line-height: 1.4;">
                    ${this.aiTutor.formatMarkdownToHTML(entry.content)}
                  </div>
                </div>
              `
            })

            summaryHTML += `</div>`
            summaryHistoryContent.innerHTML = summaryHTML
          }

          // Toggle visibility
          if (summaryHistoryContent.style.display === "none") {
            summaryHistoryContent.style.display = "block"
            showSummaryHistoryButton.textContent = "🔼 Hide Summary History"
          } else {
            summaryHistoryContent.style.display = "none"
            showSummaryHistoryButton.textContent = "📄 Summary History"
          }
        })
      }
    }

    async generateQuiz() {
      const content = document.getElementById("quiz-content")

      // Check if AI features are available
      if (!this.aiTutor.hasApiKey()) {
        content.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h3>🔑 AI Features Require API Key</h3>
            <p>To use AI-powered quizzes and summaries, please configure your Mistral API key.</p>
            <button data-action="setup-api" style="padding: 12px 20px; background: #7198f8; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 10px;">
              🔧 Setup API Key
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 15px;">
              Your API key is stored securely in your browser and never transmitted to external servers except Mistral AI.
            </p>
          </div>
        `

        // Add event listener for setup button
        const setupBtn = content.querySelector('[data-action="setup-api"]')
        if (setupBtn) {
          setupBtn.addEventListener("click", () => this.showApiKeySetup())
        }
        return
      }

      content.innerHTML = "Generating quiz question..."

      try {
        const pageContent = this.aiTutor.extractPageContent()
        this.currentQuiz = await this.aiTutor.generateQuizQuestion(pageContent)

        content.innerHTML = `
                    <div class="quiz-question">
                        <strong>❓ ${this.currentQuiz.question}</strong>
                        <div class="quiz-options">
                            ${this.currentQuiz.options
                              .map(
                                (option, index) =>
                                  `<button class="quiz-option" onclick="window.raTutor.ui.answerQuiz(${index})">${option}</button>`
                              )
                              .join("")}
                        </div>
                    </div>
                `
      } catch (error) {
        const errorMessage = this.createErrorMessage(error, { type: "quiz" })
        content.innerHTML = errorMessage.html
        errorMessage.setupEventListeners()
        console.error("Quiz error:", error)
      }
    }

    answerQuiz(selectedIndex) {
      if (!this.currentQuiz) return

      const isCorrect = selectedIndex === this.currentQuiz.correct
      const content = document.getElementById("quiz-content")

      // Show feedback
      content.innerHTML = `
                <div class="quiz-question">
                    <strong>❓ ${this.currentQuiz.question}</strong>
                    <div style="margin-top: 15px;">
                        <div style="padding: 15px; border-radius: 8px; background: ${
                          isCorrect ? "#d4edda" : "#f8d7da"
                        }; color: ${isCorrect ? "#155724" : "#721c24"};">
                            ${isCorrect ? "✅ Correct!" : "❌ Incorrect"}
                        </div>
                        <div class="ai-response">
                            <strong>💡 Explanation:</strong><br>
                            ${this.currentQuiz.explanation}
                        </div>
                        <button onclick="window.raTutor.ui.generateQuiz()" style="width: 100%; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #7198f8 0%, #5577e6 100%); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            🔄 Next Question
                        </button>
                    </div>
                </div>
            `
    }

    switchTab(tabName) {
      // Remove active class from all tabs and buttons
      document
        .querySelectorAll(".tutor-tab")
        .forEach(tab => tab.classList.remove("active"))
      document
        .querySelectorAll(".tab-button")
        .forEach(btn => btn.classList.remove("active"))

      // Add active class to selected tab and button
      document.getElementById(`${tabName}-tab`).classList.add("active")
      document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

      this.currentTab = tabName

      // Update content based on tab
      if (tabName === "summary") {
        this.updateSummaryTab()
      }
      // Progress tab removed - stats now in dedicated section
    }

    togglePanel() {
      this.isMinimized = !this.isMinimized
      const panel = document.getElementById("ra-tutor-panel")
      const toggleButton = document.getElementById("ra-tutor-toggle")

      // Use direct style manipulation like the working example
      if (this.isMinimized) {
        panel.style.transform = "translateX(calc(100% - 50px))"
        if (toggleButton) toggleButton.style.display = "block"
      } else {
        panel.style.transform = "translateX(0)"
        if (toggleButton) toggleButton.style.display = "none"
        this.switchTab(this.currentTab) // Refresh current tab
      }
    }

    // Helper function to create nice error UI messages
    createErrorMessage(error, context = {}) {
      const details = error.apiErrorDetails || {
        type: "generic",
        title: "❌ Error",
        message: error.message || "Something went wrong",
        suggestion: "Please try again",
        technical: "Unknown error",
      }

      const errorId = `error-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`

      const contextActions = {
        summary: `
          <button class="error-btn-api-key" data-error-id="${errorId}" style="padding: 8px 12px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; font-size: 12px;">
            🔑 Manage API Key
          </button>
          <button class="error-btn-retry" data-error-id="${errorId}" style="padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            🔄 Try Again
          </button>
        `,
        qa: `
          <button class="error-btn-api-key" data-error-id="${errorId}" style="padding: 6px 10px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 6px; font-size: 11px;">
            🔑 Check API Key
          </button>
        `,
        quiz: `
          <button class="error-btn-api-key" data-error-id="${errorId}" style="padding: 6px 10px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 6px; font-size: 11px;">
            🔑 Check API Key
          </button>
          <button class="error-btn-retry-quiz" data-error-id="${errorId}" style="padding: 6px 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
            🔄 Try Again
          </button>
        `,
      }

      const html = `
        <div id="${errorId}" style="padding: 15px; background: #2c1810; border: 1px solid #8b4513; border-radius: 8px; margin: 10px 0;">
          <div style="color: #ff6b6b; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center;">
            ${details.title}
          </div>
          <div style="color: #e8eaed; margin-bottom: 8px; line-height: 1.4;">
            ${details.message}
          </div>
          <div style="color: #ffc107; font-size: 12px; margin-bottom: 12px; line-height: 1.3;">
            <strong>💡 Suggestion:</strong> ${details.suggestion}
          </div>
          ${contextActions[context.type] || ""}
          <details style="margin-top: 8px;">
            <summary style="color: #7f8c8d; font-size: 10px; cursor: pointer;">🔍 Technical Details</summary>
            <div style="color: #7f8c8d; font-size: 10px; margin-top: 4px; padding: 8px; background: #1a1a1a; border-radius: 4px;">
              ${details.technical}
            </div>
          </details>
        </div>
      `

      // Return an object with HTML and setup function
      return {
        html,
        setupEventListeners: () => {
          // Add event listeners after DOM insertion
          setTimeout(() => {
            const errorContainer = document.getElementById(errorId)
            if (!errorContainer) return

            // API Key button
            const apiKeyBtns =
              errorContainer.querySelectorAll(".error-btn-api-key")
            apiKeyBtns.forEach(btn => {
              btn.addEventListener("click", e => {
                e.preventDefault()
                this.showApiKeySetup()
              })
            })

            // Retry button (for summary context)
            const retryBtns =
              errorContainer.querySelectorAll(".error-btn-retry")
            retryBtns.forEach(btn => {
              btn.addEventListener("click", e => {
                e.preventDefault()
                if (context.type === "summary") {
                  this.updateSummaryTab()
                }
              })
            })
          }, 10)
        },
      }
    }

    formatTime(milliseconds) {
      const minutes = Math.floor(milliseconds / 60000)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`
      }
      return `${minutes}m`
    }

    showApiKeySetup() {
      // Create secure API key setup modal
      const overlay = document.createElement("div")
      overlay.className = "overlay"
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      const modal = document.createElement("div")
      modal.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      `

      modal.innerHTML = `
        <h3 style="margin-top: 0; color: #333;">🔑 Mistral AI API Key Setup</h3>
        <p style="color: #666; line-height: 1.5;">
          To use AI-powered features, you'll need a Mistral AI API key. Your key is stored securely in your browser only.
        </p>
        <div style="margin: 20px 0;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">API Key:</label>
          <input type="password" id="mistral-api-key" placeholder="Enter your Mistral API key" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
        </div>
        <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 13px; color: #666;">
          <strong>🔒 Privacy & Security:</strong><br>
          • Your API key is stored only in your browser<br>
          • Never transmitted except directly to Mistral AI<br>
          • Can be deleted anytime from the settings<br>
          • No personal data collected or transmitted, even to Mistral AI
        </div>
        <div style="display: flex; gap: 10px; margin-top: 25px;">
          <button id="save-api-key" style="flex: 1; padding: 12px; background: #7198f8; color: white; border: none; border-radius: 8px; cursor: pointer;">
            💾 Save Key
          </button>
          <button id="cancel-api-setup" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 15px; text-align: center;">
          Get your API key at: <a href="https://console.mistral.ai/" target="_blank" style="color: #7198f8;">console.mistral.ai</a>
        </p>
      `

      overlay.appendChild(modal)
      document.body.appendChild(overlay)

      // Event listeners
      document
        .getElementById("save-api-key")
        .addEventListener("click", async () => {
          const apiKey = document.getElementById("mistral-api-key").value.trim()
          if (apiKey) {
            try {
              console.log("🔑 Saving API key...")
              // Store securely - use native GM.setValue
              await GM.setValue("mistral_api_key", apiKey)
              // Update AITutor instance
              this.aiTutor.apiKey = apiKey
              console.log("🔑 API key updated in AITutor instance")

              // Close modal first
              overlay.remove()

              console.log("🔑 API key saved securely in local storage")
              alert("✅ API key saved successfully!")

              // Reload the page to ensure all UI elements are properly initialized with the new API key
              window.location.reload()
            } catch (error) {
              console.error("🔑 Error saving API key:", error)
              alert("❌ Error saving API key. Please try again.")
            }
          } else {
            alert("Please enter a valid API key")
          }
        })

      document
        .getElementById("cancel-api-setup")
        .addEventListener("click", () => {
          overlay.remove()
        })

      // Close on overlay click
      overlay.addEventListener("click", e => {
        if (e.target === overlay) {
          overlay.remove()
        }
      })
    }

    async clearAllData() {
      if (
        confirm(
          "⚠️ This will delete all your Q&A history, summaries, and API key. This cannot be undone. Continue?"
        )
      ) {
        try {
          // Clear API key
          GM.deleteValue("mistral_api_key")
          this.aiTutor.apiKey = null

          // Clear language preference
          GM.deleteValue("ra_tutor_language")

          // Clear Q&A and summary data
          const allKeys = await GM.listValues()
          for (const key of allKeys) {
            if (
              key.startsWith("ra_tutor_gdpr_") ||
              key.startsWith("ai_cache_")
            ) {
              await GM.deleteValue(key)
            }
          }

          console.log("‼️ All user data cleared successfully ‼️")
          alert("✅ All data cleared successfully.")
          // Refresh the current tab
          this.switchTab(this.currentTab)
        } catch (error) {
          console.error("Error clearing data:", error)
          alert("❌ Error clearing data. Please try again.")
        }
      }
    }

    // ========================================
    // ⚙️ SETTINGS MODAL SYSTEM
    // ========================================

    showSettingsModal() {
      // Remove any existing settings modal
      const existing = document.getElementById("settings-modal-overlay")
      if (existing) {
        document.body.removeChild(existing)
      }

      // Create modal overlay
      const overlay = document.createElement("div")
      overlay.id = "settings-modal-overlay"
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 100001;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
      `

      // Create modal container
      const modal = document.createElement("div")
      modal.id = "settings-modal-content"
      modal.style.cssText = `
        background: linear-gradient(145deg, #123262, #1a3a6b);
        border-radius: 12px;
        padding: 0;
        max-width: 600px;
        width: 90%;
        max-height: 85vh;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        color: #e8eaed;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
      `

      // Initialize with main settings view
      this.renderSettingsView(modal, "main")

      overlay.appendChild(modal)
      document.body.appendChild(overlay)

      // Close on outside click
      overlay.addEventListener("click", e => {
        if (e.target === overlay) {
          document.body.removeChild(overlay)
        }
      })
    }

    renderSettingsView(modal, view, data = {}) {
      const views = {
        main: this.getMainSettingsView(),
        "api-key-setup": this.getApiKeySetupView(),
        "pricing-management": this.getPricingManagementView(),
        "pricing-details": this.getPricingDetailsView(data),
        "data-export": this.getDataExportView(),
      }

      modal.innerHTML = views[view] || views.main

      // Add event listeners based on current view
      this.addSettingsViewListeners(modal, view)

      // Load dynamic content for main view
      if (view === "main") {
        this.loadSettingsInModal()
      }
    }

    getMainSettingsView() {
      return `
        <!-- Header -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #2c4a7c; display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: #7198f8; font-size: 18px;">⚙️ Settings</h2>
          <button id="close-settings-modal" style="background: none; border: none; color: #95a5a6; cursor: pointer; font-size: 24px; padding: 4px; border-radius: 4px; transition: all 0.2s ease;" title="Close settings">×</button>
        </div>

        <!-- Content -->
        <div style="flex: 1; overflow-y: auto; padding: 20px 24px;">
          <!-- 1. Language Selection - TOP PRIORITY -->
          <div style="margin-bottom: 24px; padding: 16px; background: #0f2142; border-radius: 8px; border: 1px solid #2c4a7c;">
            <div style="color: #7198f8; margin-bottom: 8px; font-size: 14px; font-weight: bold;">🌐 AI Response Language</div>
            <select id="ai-language-select-modal" style="width: 100%; padding: 8px; background: #1a3a6b; color: white; border: 1px solid #2c4a7c; border-radius: 6px; font-size: 12px;">
              <option value="english">🇬🇧 English (Default)</option>
              <option value="slovenian">🇸🇮 Slovensko</option>
              <option value="croatian">🇭🇷 Hrvatski</option>
              <option value="serbian">🇷🇸 Srpski</option>
            </select>
            <div style="font-size: 10px; color: #7f8c8d; margin-top: 6px;">AI will respond in the selected language regardless of question language</div>
          </div>

          <!-- 2. API Key Management -->
          <div style="margin-bottom: 24px; padding: 16px; background: #0f2142; border-radius: 8px; border: 1px solid #2c4a7c;">
            <div style="color: #7198f8; margin-bottom: 8px; font-size: 14px; font-weight: bold;">🔑 API Key Management</div>
            <div id="api-key-status-modal" style="color: #95a5a6; font-size: 11px; margin-bottom: 8px;">Loading...</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button data-nav="api-key-setup" style="padding: 8px 12px; background: #7198f8; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease;">
                🔑 Manage API Key
              </button>
              <button data-action="test-api-key" style="padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease;">
                ✅ Test Key
              </button>
            </div>
          </div>

          <!-- 3. Data Management -->
          <div style="margin-bottom: 24px; padding: 16px; background: #0f2142; border-radius: 8px; border: 1px solid #2c4a7c;">
            <div style="color: #7198f8; margin-bottom: 8px; font-size: 14px; font-weight: bold;">💾 Data Management</div>
            
            <!-- Export Section -->
            <div style="margin-bottom: 12px;">
              <button data-nav="data-export" style="padding: 8px 12px; background: #6f42c1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease;">
                📤 Export Data
              </button>
            </div>
            
            <!-- Danger Zone -->
            <div style="padding: 12px; background: #2c1810; border-radius: 6px; border: 1px solid #8b4513;">
              <div style="color: #ff6b6b; font-size: 12px; margin-bottom: 8px; font-weight: bold;">⚠️ Danger Zone</div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button data-action="purge-data-keep-key" style="padding: 6px 12px; background: #fd7e14; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease;">
                  🗑️ Purge Data (Keep API Key)
                </button>
                <button data-action="purge-all-data" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease;">
                  💥 Purge Everything
                </button>
              </div>
            </div>
          </div>

          <!-- 4. API Pricing Management - BOTTOM -->
          <div style="margin-bottom: 0; padding: 16px; background: #0f2142; border-radius: 8px; border: 1px solid #2c4a7c;">
            <div style="color: #7198f8; margin-bottom: 8px; font-size: 14px; font-weight: bold;">💰 API Pricing Management</div>
            <div id="pricing-status-modal" style="color: #95a5a6; font-size: 11px; margin-bottom: 8px;">Loading...</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button data-nav="pricing-details" style="padding: 8px 12px; background: #17a2b8; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease;">
                📋 View Pricing
              </button>
              <button data-nav="pricing-management" style="padding: 8px 12px; background: #ffc107; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; transition: all 0.2s ease;">
                ✏️ Update Costs
              </button>
            </div>
            <div style="font-size: 10px; color: #7f8c8d; margin-top: 6px;">Keep pricing current for accurate cost tracking</div>
          </div>
        </div>
      `
    }

    getApiKeySetupView() {
      return `
        <!-- Header with Back Button -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #2c4a7c; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button data-nav="main" style="background: rgba(113, 152, 248, 0.2); border: 1px solid #7198f8; color: #7198f8; cursor: pointer; font-size: 16px; padding: 6px 8px; border-radius: 4px; transition: all 0.2s ease;" title="Back to settings">←</button>
            <h2 style="margin: 0; color: #7198f8; font-size: 18px;">🔑 API Key Management</h2>
          </div>
          <button id="close-settings-modal" style="background: none; border: none; color: #95a5a6; cursor: pointer; font-size: 24px; padding: 4px; border-radius: 4px; transition: all 0.2s ease;" title="Close settings">×</button>
        </div>

        <!-- Content -->
        <div style="flex: 1; overflow-y: auto; padding: 20px 24px;">
          <div style="margin-bottom: 20px;">
            <p style="color: #b0bec5; line-height: 1.6; margin-bottom: 20px;">
              To use AI-powered features, you'll need a Mistral AI API key. Your key is stored securely in your browser only.
            </p>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #7198f8;">API Key:</label>
              <input type="password" id="mistral-api-key-input" placeholder="Enter your Mistral API key" style="width: 100%; padding: 12px; border: 2px solid #2c4a7c; border-radius: 8px; font-size: 14px; background: #1a3a6b; color: white;">
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(113, 152, 248, 0.1); border-radius: 8px; border: 1px solid #7198f8;">
              <div style="font-size: 13px; color: #e8eaed; line-height: 1.5;">
                <strong>🔒 Privacy & Security:</strong><br>
                • Your API key is stored only in your browser<br>
                • Never transmitted except directly to Mistral AI<br>
                • Can be deleted anytime from these settings<br>
                • No personal data collected or transmitted
              </div>
            </div>
            
            <div style="display: flex; gap: 12px; margin-bottom: 20px;">
              <button id="save-api-key-btn" style="flex: 1; padding: 12px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                💾 Save Key
              </button>
              <button id="test-current-key-btn" style="flex: 1; padding: 12px; background: #17a2b8; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                🧪 Test Current Key
              </button>
            </div>
            
            <!-- Current Key Status -->
            <div style="padding: 12px; background: #0f2142; border-radius: 6px; border: 1px solid #2c4a7c;">
              <div style="color: #7198f8; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Current Status:</div>
              <div id="current-key-status" style="color: #95a5a6; font-size: 11px;">Loading...</div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 12px; color: #7f8c8d;">
                Get your API key at: <a href="https://console.mistral.ai/" target="_blank" style="color: #7198f8; text-decoration: none;">console.mistral.ai</a>
              </p>
            </div>
          </div>
        </div>
      `
    }

    getPricingManagementView() {
      return `
        <!-- Header with Back Button -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #2c4a7c; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button data-nav="main" style="background: rgba(113, 152, 248, 0.2); border: 1px solid #7198f8; color: #7198f8; cursor: pointer; font-size: 16px; padding: 6px 8px; border-radius: 4px; transition: all 0.2s ease;" title="Back to settings">←</button>
            <h2 style="margin: 0; color: #7198f8; font-size: 18px;">💰 Update Pricing</h2>
          </div>
          <button id="close-settings-modal" style="background: none; border: none; color: #95a5a6; cursor: pointer; font-size: 24px; padding: 4px; border-radius: 4px; transition: all 0.2s ease;" title="Close settings">×</button>
        </div>

        <!-- Content -->
        <div style="flex: 1; overflow-y: auto; padding: 20px 24px;">
          <div id="pricing-update-content">
            <div style="text-align: center; padding: 40px;">
              <div style="color: #7198f8; font-size: 48px; margin-bottom: 16px;">⏳</div>
              <div style="color: #b0bec5;">Loading pricing management interface...</div>
            </div>
          </div>
        </div>
      `
    }

    getPricingDetailsView(data) {
      return `
        <!-- Header with Back Button -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #2c4a7c; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button data-nav="main" style="background: rgba(113, 152, 248, 0.2); border: 1px solid #7198f8; color: #7198f8; cursor: pointer; font-size: 16px; padding: 6px 8px; border-radius: 4px; transition: all 0.2s ease;" title="Back to settings">←</button>
            <h2 style="margin: 0; color: #7198f8; font-size: 18px;">📋 Pricing Details</h2>
          </div>
          <button id="close-settings-modal" style="background: none; border: none; color: #95a5a6; cursor: pointer; font-size: 24px; padding: 4px; border-radius: 4px; transition: all 0.2s ease;" title="Close settings">×</button>
        </div>

        <!-- Content -->
        <div style="flex: 1; overflow-y: auto; padding: 20px 24px;">
          <div id="pricing-details-content">
            <div style="text-align: center; padding: 40px;">
              <div style="color: #7198f8; font-size: 48px; margin-bottom: 16px;">⏳</div>
              <div style="color: #b0bec5;">Loading pricing details...</div>
            </div>
          </div>
        </div>
      `
    }

    getDataExportView() {
      return `
        <!-- Header with Back Button -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #2c4a7c; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button data-nav="main" style="background: rgba(113, 152, 248, 0.2); border: 1px solid #7198f8; color: #7198f8; cursor: pointer; font-size: 16px; padding: 6px 8px; border-radius: 4px; transition: all 0.2s ease;" title="Back to settings">←</button>
            <h2 style="margin: 0; color: #7198f8; font-size: 18px;">📤 Export Data</h2>
          </div>
          <button id="close-settings-modal" style="background: none; border: none; color: #95a5a6; cursor: pointer; font-size: 24px; padding: 4px; border-radius: 4px; transition: all 0.2s ease;" title="Close settings">×</button>
        </div>

        <!-- Content -->
        <div style="flex: 1; overflow-y: auto; padding: 20px 24px;">
          <div style="margin-bottom: 20px;">
            <p style="color: #b0bec5; line-height: 1.6; margin-bottom: 20px;">
              Export your learning data including Q&A history, summaries, and usage statistics.
            </p>
            
            <div style="display: grid; gap: 16px;">
              <button id="export-all-data-btn" style="padding: 16px; background: #6f42c1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; text-align: left;">
                <div style="font-size: 14px; margin-bottom: 4px;">📦 Export Q&A + Summaries</div>
                <div style="font-size: 11px; opacity: 0.8;">Combined Q&A and summaries in one clean CSV file</div>
              </button>
              
              <button id="export-qa-only-btn" style="padding: 16px; background: #17a2b8; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; text-align: left;">
                <div style="font-size: 14px; margin-bottom: 4px;">❓ Export Q&A Only</div>
                <div style="font-size: 11px; opacity: 0.8;">Just your question and answer history</div>
              </button>
              
              <button id="export-summaries-only-btn" style="padding: 16px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; text-align: left;">
                <div style="font-size: 14px; margin-bottom: 4px;">📋 Export Summaries Only</div>
                <div style="font-size: 11px; opacity: 0.8;">Just your AI-generated summaries</div>
              </button>

              <button id="export-metadata-btn" style="padding: 16px; background: #fd7e14; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; text-align: left;">
                <div style="font-size: 14px; margin-bottom: 4px;">📊 Export Usage Overview</div>
                <div style="font-size: 11px; opacity: 0.8;">App statistics, API usage, and metadata summary</div>
              </button>
            </div>
            
            <div style="margin-top: 20px; padding: 12px; background: rgba(113, 152, 248, 0.1); border-radius: 6px; border: 1px solid #7198f8;">
              <div style="font-size: 12px; color: #e8eaed; line-height: 1.5;">
                <strong>📝 Export Format:</strong> Data is exported as CSV files with date-time stamps in filenames for easy organization.
              </div>
            </div>
          </div>
        </div>
      `
    }

    addSettingsViewListeners(modal, view) {
      // Close button
      const closeBtn = modal.querySelector("#close-settings-modal")
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          const overlay = document.getElementById("settings-modal-overlay")
          if (overlay) document.body.removeChild(overlay)
        })
      }

      // Navigation buttons
      modal.addEventListener("click", e => {
        const nav = e.target.dataset.nav
        if (nav) {
          this.renderSettingsView(modal, nav)
          return
        }

        // Handle actions based on current view
        const action = e.target.dataset.action
        if (action) {
          this.handleSettingsAction(action, modal, view)
        }
      })

      // View-specific listeners
      switch (view) {
        case "main":
          // Language selection
          const languageSelect = modal.querySelector(
            "#ai-language-select-modal"
          )
          if (languageSelect) {
            languageSelect.addEventListener("change", e => {
              this.saveLanguagePreference(e.target.value)
            })
          }
          break

        case "api-key-setup":
          // API key save button
          const saveBtn = modal.querySelector("#save-api-key-btn")
          const keyInput = modal.querySelector("#mistral-api-key-input")
          if (saveBtn && keyInput) {
            saveBtn.addEventListener("click", async () => {
              const key = keyInput.value.trim()
              if (key) {
                await this.saveApiKey(key)
                this.showBriefNotification("✅ API key saved successfully!")
                this.renderSettingsView(modal, "main") // Go back to main
              }
            })
          }

          // Test current key button
          const testBtn = modal.querySelector("#test-current-key-btn")
          if (testBtn) {
            testBtn.addEventListener("click", () => {
              this.testApiKey()
            })
          }

          // Load current key status
          this.updateApiKeyStatus("current-key-status")
          break

        case "pricing-management":
          // Load pricing management interface
          setTimeout(() => {
            this.loadPricingManagementInterface(modal)
          }, 100)
          break

        case "pricing-details":
          // Load pricing details
          setTimeout(() => {
            this.loadPricingDetailsInterface(modal)
          }, 100)
          break

        case "data-export":
          // Export buttons
          const exportAllBtn = modal.querySelector("#export-all-data-btn")
          const exportQABtn = modal.querySelector("#export-qa-only-btn")
          const exportSummariesBtn = modal.querySelector(
            "#export-summaries-only-btn"
          )
          const exportMetadataBtn = modal.querySelector("#export-metadata-btn")

          if (exportAllBtn) {
            exportAllBtn.addEventListener("click", () =>
              this.exportCombinedData()
            )
          }
          if (exportQABtn) {
            exportQABtn.addEventListener("click", () => this.exportQAData())
          }
          if (exportSummariesBtn) {
            exportSummariesBtn.addEventListener("click", () =>
              this.exportSummariesData()
            )
          }
          if (exportMetadataBtn) {
            exportMetadataBtn.addEventListener("click", () =>
              this.exportMetadataOverview()
            )
          }
          break
      }
    }

    handleSettingsAction(action, modal, view) {
      switch (action) {
        case "test-api-key":
          this.testApiKey()
          break
        case "purge-data-keep-key":
          this.purgeDataKeepKey()
          break
        case "purge-all-data":
          this.purgeAllData()
          break
        case "back-to-pricing":
          this.renderSettingsView(modal, "pricing-management")
          break
        default:
          console.log("Unhandled settings action:", action)
      }
    }

    async saveApiKey(key) {
      try {
        await GM.setValue("ra_tutor_mistral_api_key", key)
        this.aiTutor.apiKey = key
        this.updateSettingsContent() // Update main settings if visible
      } catch (error) {
        console.error("Error saving API key:", error)
        throw error
      }
    }

    loadPricingManagementInterface(modal) {
      const content = modal.querySelector("#pricing-update-content")
      if (content) {
        // Integrated pricing management interface
        content.innerHTML = `
          <div style="margin-bottom: 20px;">
            <p style="color: #b0bec5; line-height: 1.6; margin-bottom: 20px;">
              Update Mistral AI pricing rates to ensure accurate cost tracking. Custom rates override default pricing.
            </p>
            
            <div style="display: grid; gap: 16px;">
              <div style="padding: 16px; background: #0f2142; border-radius: 8px; border: 1px solid #2c4a7c;">
                <div style="color: #7198f8; font-size: 14px; font-weight: bold; margin-bottom: 8px;">� Current Pricing Status</div>
                <div id="pricing-management-status" style="color: #95a5a6; font-size: 11px;">Loading...</div>
              </div>
              
              <div style="padding: 16px; background: #0f2142; border-radius: 8px; border: 1px solid #2c4a7c;">
                <div style="color: #7198f8; font-size: 14px; font-weight: bold; margin-bottom: 12px;">⚙️ Quick Actions</div>
                <div style="display: grid; gap: 8px;">
                  <button id="reset-to-defaults-btn" style="padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s ease;">
                    🔄 Reset to Default Pricing
                  </button>
                  <button id="update-from-mistral-btn" style="padding: 10px; background: #17a2b8; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s ease;">
                    🌐 Fetch Latest from Mistral
                  </button>
                  <button id="manual-pricing-btn" style="padding: 10px; background: #ffc107; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s ease;">
                    ✏️ Manual Price Editor
                  </button>
                </div>
              </div>
              
              <div style="padding: 12px; background: rgba(113, 152, 248, 0.1); border-radius: 6px; border: 1px solid #7198f8;">
                <div style="font-size: 12px; color: #e8eaed; line-height: 1.5;">
                  <strong>📝 Note:</strong> Pricing updates affect cost calculations for new AI requests. Historical data remains unchanged.
                </div>
              </div>
            </div>
          </div>
        `

        // Add event listeners for the integrated buttons
        setTimeout(() => {
          this.addPricingManagementListeners(modal)
          this.updatePricingManagementStatus()
        }, 100)
      }
    }

    loadPricingDetailsInterface(modal) {
      const content = modal.querySelector("#pricing-details-content")
      if (content) {
        // Integrated pricing details interface
        content.innerHTML = `
          <div style="margin-bottom: 20px;">
            <p style="color: #b0bec5; line-height: 1.6; margin-bottom: 20px;">
              Current Mistral AI pricing rates and cost information for all available models.
            </p>
            
            <div id="pricing-details-list" style="display: grid; gap: 12px;">
              <div style="text-align: center; padding: 40px;">
                <div style="color: #7198f8; font-size: 24px; margin-bottom: 12px;">⏳</div>
                <div style="color: #b0bec5;">Loading pricing details...</div>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 12px; background: rgba(113, 152, 248, 0.1); border-radius: 6px; border: 1px solid #7198f8;">
              <div style="font-size: 12px; color: #e8eaed; line-height: 1.5;">
                <strong>💡 Tip:</strong> Prices shown include both input and output token costs. Custom pricing overrides are highlighted.
              </div>
            </div>
          </div>
        `

        // Load actual pricing details
        setTimeout(() => {
          this.loadActualPricingDetails()
        }, 100)
      }
    }

    addPricingManagementListeners(modal) {
      // Reset to defaults button
      const resetBtn = modal.querySelector("#pricing-reset-defaults")
      if (resetBtn) {
        resetBtn.addEventListener("click", async () => {
          if (
            confirm(
              "Reset all pricing to Mistral AI defaults? This cannot be undone."
            )
          ) {
            await this.resetPricingToDefaults()
            this.showBriefNotification("✅ Pricing reset to defaults")
            this.updatePricingManagementStatus()
          }
        })
      }

      // Fetch from Mistral button
      const fetchBtn = modal.querySelector("#pricing-fetch-mistral")
      if (fetchBtn) {
        fetchBtn.addEventListener("click", async () => {
          const button = fetchBtn
          const originalText = button.textContent
          button.textContent = "Fetching..."
          button.disabled = true

          try {
            await this.fetchLatestPricingFromMistral()
            this.showBriefNotification("✅ Latest pricing fetched successfully")
            this.updatePricingManagementStatus()
          } catch (error) {
            this.showBriefNotification(
              "❌ Failed to fetch pricing: " + error.message
            )
          } finally {
            button.textContent = originalText
            button.disabled = false
          }
        })
      }

      // Manual editor button
      const editorBtn = modal.querySelector("#pricing-manual-editor")
      if (editorBtn) {
        editorBtn.addEventListener("click", () => {
          this.openPricingManualEditor(modal)
        })
      }
    }

    addPricingDetailsListeners(modal) {
      // Refresh button
      const refreshBtn = modal.querySelector("#refresh-pricing-details")
      if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
          this.loadActualPricingDetails()
        })
      }
    }

    updatePricingManagementStatus() {
      const statusElement = document.getElementById("pricing-management-status")
      if (statusElement) {
        // Get current pricing status and display
        const currentConfig = this.getPricingConfiguration()
        const lastUpdate = this.getLastPricingUpdate()

        let statusText = "✅ Default pricing active"
        if (currentConfig && currentConfig.customPricing) {
          statusText = "⚙️ Custom pricing configured"
        }

        statusElement.innerHTML = `
          <div style="color: #4caf50; font-size: 12px; margin-bottom: 4px;">${statusText}</div>
          <div style="color: #b0bec5; font-size: 11px;">
            Last updated: ${lastUpdate || "Never"}
          </div>
        `
      }
    }

    async loadSettingsInModal() {
      // Load language preference
      try {
        const language = await this.getLanguagePreference()
        const languageSelect = document.getElementById(
          "ai-language-select-modal"
        )
        if (languageSelect) {
          languageSelect.value = language
        }
      } catch (error) {
        console.error("Error loading language preference:", error)
      }

      // Load API key status
      this.updateApiKeyStatus("api-key-status-modal")

      // Load pricing status
      this.updatePricingStatus("pricing-status-modal")
    }

    exportQAData() {
      this.exportDataType("qa", "Q&A Data")
    }

    exportSummariesData() {
      this.exportDataType("summaries", "AI Summaries")
    }

    exportMetadataOverview() {
      this.exportAppMetadata()
    }

    async exportAppMetadata() {
      try {
        const allKeys = await GM.listValues()
        const responseKeys = allKeys.filter(key =>
          key.startsWith("ai_response_")
        )
        const tokenLogKeys = allKeys.filter(key => key.startsWith("token_log_"))

        // Collect metadata summary
        const metadata = []
        let qaCount = 0
        let summaryCount = 0
        let totalTokens = 0
        let totalCost = 0
        const modelUsage = {}
        const pageActivity = {}
        let firstActivity = null
        let lastActivity = null

        // Process responses for metadata
        for (const key of responseKeys) {
          const data = await GM.getValue(key, null)
          if (data) {
            const response = JSON.parse(data)
            const timestamp = new Date(response.timestamp)

            if (!firstActivity || timestamp < firstActivity)
              firstActivity = timestamp
            if (!lastActivity || timestamp > lastActivity)
              lastActivity = timestamp

            if (response.type === "qa") {
              qaCount++
            } else if (response.type === "summary") {
              summaryCount++
            }

            // Track model usage
            const model = response.metadata?.model || "unknown"
            modelUsage[model] = (modelUsage[model] || 0) + 1

            // Track page activity
            const pageUrl = response.pageUrl || "unknown"
            pageActivity[pageUrl] = (pageActivity[pageUrl] || 0) + 1
          }
        }

        // Process token logs for metadata
        for (const key of tokenLogKeys) {
          const data = await GM.getValue(key, null)
          if (data) {
            const log = JSON.parse(data)
            totalTokens += log.tokens?.total || 0
            totalCost += log.cost || 0
          }
        }

        // Create metadata summary
        metadata.push({
          metric: "Total Q&A Interactions",
          value: qaCount,
          category: "Usage Stats",
        })
        metadata.push({
          metric: "Total AI Summaries Generated",
          value: summaryCount,
          category: "Usage Stats",
        })
        metadata.push({
          metric: "Total Pages Analyzed",
          value: Object.keys(pageActivity).length,
          category: "Usage Stats",
        })
        metadata.push({
          metric: "First Activity",
          value: firstActivity
            ? firstActivity.toISOString().split("T")[0]
            : "N/A",
          category: "Timeline",
        })
        metadata.push({
          metric: "Last Activity",
          value: lastActivity
            ? lastActivity.toISOString().split("T")[0]
            : "N/A",
          category: "Timeline",
        })
        metadata.push({
          metric: "Total API Tokens Used",
          value: totalTokens,
          category: "API Usage",
        })
        metadata.push({
          metric: "Total API Cost (USD)",
          value: totalCost.toFixed(4),
          category: "API Usage",
        })
        metadata.push({
          metric: "API Key Configured",
          value: this.aiTutor.hasApiKey() ? "Yes" : "No",
          category: "Configuration",
        })
        metadata.push({
          metric: "Language Setting",
          value: await GM.getValue("ra_tutor_language", "english"),
          category: "Configuration",
        })

        // Add top models
        Object.entries(modelUsage)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .forEach(([model, count], index) => {
            metadata.push({
              metric: `Top Model ${index + 1}`,
              value: `${model} (${count} uses)`,
              category: "Model Usage",
            })
          })

        // Add top pages
        Object.entries(pageActivity)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .forEach(([page, count], index) => {
            metadata.push({
              metric: `Top Page ${index + 1}`,
              value: `${page.split("/").pop() || page} (${count} interactions)`,
              category: "Page Activity",
            })
          })

        const headers = ["metric", "value", "category"]
        const csvContent = this.generateCSV(
          metadata,
          headers,
          "App Metadata Overview"
        )

        // Create filename with date and time
        const now = new Date()
        const dateStr = now.toISOString().split("T")[0]
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-")
        const filename = `radiology-tutor-metadata-overview-${dateStr}-${timeStr}.csv`

        this.downloadCSV(csvContent, filename)

        this.showBriefNotification(
          `✅ Metadata overview exported successfully!`
        )
      } catch (error) {
        console.error("📤 Error in exportAppMetadata:", error)
        this.showBriefNotification(
          `❌ Error exporting metadata: ${error.message}`
        )
      }
    }

    async exportDataType(dataType, displayName) {
      try {
        const allKeys = await GM.listValues()
        const responseKeys = allKeys.filter(key =>
          key.startsWith("ai_response_")
        )

        let dataArray = []
        let headers = []
        let filename = ""

        if (dataType === "qa") {
          // Process Q&A data
          headers = [
            "date",
            "time",
            "page_title",
            "page_url",
            "question",
            "answer",
            "answer_length",
            "model_used",
            "length_setting",
            "language",
          ]
          filename = `radiology-tutor-qa-export-${
            new Date().toISOString().split("T")[0]
          }-${new Date().toTimeString().slice(0, 8).replace(/:/g, "-")}.csv`

          for (const key of responseKeys) {
            const data = await GM.getValue(key, null)
            if (data) {
              const response = JSON.parse(data)
              if (response.type === "qa") {
                const answerText = response.response.raw || ""
                dataArray.push({
                  date: new Date(response.timestamp)
                    .toISOString()
                    .split("T")[0],
                  time: new Date(response.timestamp)
                    .toISOString()
                    .split("T")[1]
                    .split(".")[0],
                  page_title: response.pageTitle || "Unknown",
                  page_url: response.pageUrl || "Unknown",
                  question: response.request.question || "",
                  answer: answerText,
                  answer_length: answerText.length,
                  model_used: response.metadata?.model || "unknown",
                  length_setting: "N/A", // Q&A doesn't have length setting
                  language: response.request.languageInstruction
                    ? "non-english"
                    : "english",
                })
              }
            }
          }
        } else if (dataType === "summaries") {
          // Process Summaries data - match Q&A format structure
          headers = [
            "date",
            "time",
            "page_title",
            "page_url",
            "summary_focus",
            "summary_content",
            "summary_length",
            "model_used",
            "length_setting",
            "language",
          ]
          filename = `radiology-tutor-summaries-export-${
            new Date().toISOString().split("T")[0]
          }-${new Date().toTimeString().slice(0, 8).replace(/:/g, "-")}.csv`

          for (const key of responseKeys) {
            const data = await GM.getValue(key, null)
            if (data) {
              const response = JSON.parse(data)
              if (response.type === "summary") {
                // Handle both new markdown format and legacy JSON format
                let summaryContent = ""
                if (response.response && response.response.raw) {
                  // New markdown format - use full raw content (same as Q&A)
                  summaryContent = response.response.raw
                } else {
                  // Fallback for other formats
                  summaryContent = JSON.stringify(response.response || {})
                }

                dataArray.push({
                  date: new Date(response.timestamp)
                    .toISOString()
                    .split("T")[0],
                  time: new Date(response.timestamp)
                    .toISOString()
                    .split("T")[1]
                    .split(".")[0],
                  page_title: response.pageTitle || "Unknown",
                  page_url: response.pageUrl || "Unknown",
                  summary_focus:
                    response.request.options?.focus ||
                    response.request.focus ||
                    "general",
                  summary_content: summaryContent, // Full content, not preview
                  summary_length: summaryContent.length, // Character count of content
                  model_used: response.metadata?.model || "unknown",
                  length_setting:
                    response.request.options?.length ||
                    response.request.length ||
                    "medium",
                  language: response.request.languageInstruction
                    ? "non-english"
                    : "english",
                })
              }
            }
          }
        }

        // Sort by date (most recent first)
        dataArray.sort(
          (a, b) =>
            new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time)
        )

        if (dataArray.length === 0) {
          this.showBriefNotification(
            `📭 No ${displayName.toLowerCase()} found to export`
          )
          return
        }

        // Generate CSV content
        const csvContent = this.generateCSV(dataArray, headers, displayName)

        // Download the file
        this.downloadCSV(csvContent, filename)

        this.showBriefNotification(
          `✅ ${displayName} exported successfully! (${dataArray.length} items)`
        )
      } catch (error) {
        console.error(`📤 Error in export${dataType}:`, error)
        this.showBriefNotification(
          `❌ Error exporting ${displayName.toLowerCase()}: ${error.message}`
        )
      }
    }

    generateCSV(dataArray, headers, sectionName) {
      const csvRows = [
        // Only the actual CSV headers - no metadata mixed in
        headers.join(","), // Header row
        ...dataArray.map(row =>
          headers.map(header => this.escapeCSV(row[header])).join(",")
        ),
      ]

      return csvRows.join("\n")
    }

    downloadCSV(csvContent, filename) {
      const dataBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    async saveLanguagePreference(language) {
      try {
        await GM.setValue("ra_tutor_language", language)
        //console.log(`🌐 Language preference saved: ${language}`)

        // Show brief confirmation with language name
        const languageNames = {
          english: "English",
          slovenian: "Slovenian",
          croatian: "Croatian",
          serbian: "Serbian",
        }

        const languageSelect = document.getElementById("ai-language-select")
        if (languageSelect) {
          const originalStyle = languageSelect.style.background
          languageSelect.style.background = "#28a745"

          // Also show a brief tooltip or alert
          setTimeout(() => {
            languageSelect.style.background = originalStyle
          }, 1500)

          //console.log(`🌐 AI will now respond in: ${languageNames[language]}`)
        }
      } catch (error) {
        console.error("Error saving language preference:", error)
      }
    }
    async getLanguagePreference() {
      try {
        const language = await GM.getValue("ra_tutor_language", "english")
        return language
      } catch (error) {
        console.error("Error loading language preference:", error)
        return "english" // Default fallback
      }
    }

    async saveLengthPreference(length) {
      try {
        await GM.setValue("ra_tutor_length", length)
        //console.log(`📏 Length preference saved: ${length}`)

        // Show brief confirmation with length name
        const lengthNames = {
          short: "Short",
          medium: "Medium",
          long: "Long",
        }

        const lengthSelect = document.getElementById("ai-length-select")
        if (lengthSelect) {
          const originalStyle = lengthSelect.style.background
          lengthSelect.style.background = "#28a745"

          setTimeout(() => {
            lengthSelect.style.background = originalStyle
          }, 1500)

          //console.log(`📏 Default summary length set to: ${lengthNames[length]}`)
        }
      } catch (error) {
        console.error("Error saving length preference:", error)
      }
    }

    async getLengthPreference() {
      try {
        const length = await GM.getValue("ra_tutor_length", "medium")
        return length
      } catch (error) {
        console.error("Error loading length preference:", error)
        return "medium" // Default fallback
      }
    }

    async getLanguageInstruction() {
      const language = await this.getLanguagePreference()
      //console.log(`🌐 Current language preference: ${language}`)
      const instructions = {
        english: "", // No additional instruction needed for English
        slovenian:
          "\n\nIMPORTANT: You must respond entirely in Slovenian language (slovenščina). Do not use English except for medical terms that don't have direct Slovenian translations.",
        croatian:
          "\n\nIMPORTANT: You must respond entirely in Croatian language (hrvatski). Do not use English except for medical terms that don't have direct Croatian translations.",
        serbian:
          "\n\nIMPORTANT: You must respond entirely in Serbian language (srpski). Do not use English except for medical terms that don't have direct Serbian translations.",
      }
      const instruction = instructions[language] || ""

      return instruction
    }

    async showDataOverview() {
      try {
        // Get all unified AI responses for overview stats
        const allGMKeys = await GM.listValues()
        const responseKeys = allGMKeys.filter(key =>
          key.startsWith("ai_response_")
        )

        // Calculate totals from unified storage
        let totalQAEntries = 0
        let totalSummaries = 0
        let daysWithActivity = new Set()
        let uniquePagesWithSummaries = new Set()
        let uniquePagesWithQA = new Set()

        // Process all unified AI responses
        for (const key of responseKeys) {
          try {
            const data = await GM.getValue(key, null)
            if (data) {
              const response = JSON.parse(data)

              // Count by type
              if (response.type === "qa") {
                totalQAEntries++
                uniquePagesWithQA.add(response.pageUrl)
              } else if (response.type === "summary") {
                totalSummaries++
                uniquePagesWithSummaries.add(response.pageUrl)
              }

              // Add dates from timestamps
              if (response.timestamp) {
                const date = new Date(response.timestamp)
                  .toISOString()
                  .split("T")[0]
                daysWithActivity.add(date)
              }
            }
          } catch (error) {
            console.warn("Error parsing AI response:", error)
          }
        }

        // Get API usage statistics
        const tokenUsageLogs = await this.aiTutor.getTokenUsageLogs()
        let totalApiCalls = 0
        let totalTokens = 0
        let totalCost = 0
        let modelUsage = {}
        let costByType = {}
        let recentUsage = { last7Days: 0, last30Days: 0 }

        const now = Date.now()
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

        tokenUsageLogs.forEach(log => {
          totalApiCalls++
          totalTokens += log.tokens.total || 0
          totalCost += log.cost || 0

          // Track model usage
          const model = log.model || "unknown"
          if (!modelUsage[model]) {
            modelUsage[model] = { calls: 0, tokens: 0, cost: 0 }
          }
          modelUsage[model].calls++
          modelUsage[model].tokens += log.tokens.total || 0
          modelUsage[model].cost += log.cost || 0

          // Track cost by operation type
          const type = log.type || "unknown"
          if (!costByType[type]) {
            costByType[type] = { calls: 0, cost: 0, tokens: 0 }
          }
          costByType[type].calls++
          costByType[type].cost += log.cost || 0
          costByType[type].tokens += log.tokens.total || 0

          // Track recent usage
          if (log.timestamp >= sevenDaysAgo) {
            recentUsage.last7Days++
          }
          if (log.timestamp >= thirtyDaysAgo) {
            recentUsage.last30Days++
          }
        })

        // Create day-by-day activity data
        const activityByDate = await this.getActivityByDate()

        this.showDataModal(
          "📊 Learning Activity Overview",
          `
          <div style="background: #1a3a6b; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <strong>📈 Your Learning Journey:</strong><br>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
              <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; color: #7198f8; font-weight: bold;">${
                  daysWithActivity.size
                }</div>
                <div style="font-size: 11px; color: #b0bec5;">Active Days</div>
              </div>
              <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; color: #7198f8; font-weight: bold;">${Math.max(
                  uniquePagesWithSummaries.size,
                  uniquePagesWithQA.size
                )}</div>
                <div style="font-size: 11px; color: #b0bec5;">Pages Analyzed</div>
              </div>
              <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; color: #7198f8; font-weight: bold;">${totalQAEntries}</div>
                <div style="font-size: 11px; color: #b0bec5;">Questions Asked</div>
              </div>
              <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; color: #7198f8; font-weight: bold;">${totalSummaries}</div>
                <div style="font-size: 11px; color: #b0bec5;">AI Summaries</div>
              </div>
            </div>
          </div>

          <div style="background: #1a3a6b; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <strong>🤖 AI API Usage Statistics:</strong>
            ${
              totalApiCalls === 0
                ? `
              <div style="margin-top: 10px; padding: 12px; background: #123262; border-radius: 6px; text-align: center; color: #7f8c8d;">
                <div style="font-size: 14px; margin-bottom: 6px;">📊 No API usage yet</div>
                <div style="font-size: 11px;">Generate summaries or ask questions to see statistics here</div>
              </div>
            `
                : `
              <br>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 18px; color: #28a745; font-weight: bold;">${totalApiCalls}</div>
                  <div style="font-size: 11px; color: #b0bec5;">Total API Calls</div>
                </div>
                <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 18px; color: #28a745; font-weight: bold;">${totalTokens.toLocaleString()}</div>
                  <div style="font-size: 11px; color: #b0bec5;">Total Tokens</div>
                </div>
                <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 18px; color: #28a745; font-weight: bold;">€${totalCost.toFixed(
                    4
                  )}</div>
                  <div style="font-size: 11px; color: #b0bec5;">Total Cost</div>
                </div>
                <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 18px; color: #28a745; font-weight: bold;">${
                    totalApiCalls > 0
                      ? (totalTokens / totalApiCalls).toFixed(0)
                      : "0"
                  }</div>
                  <div style="font-size: 11px; color: #b0bec5;">Avg Tokens/Call</div>
                </div>
              </div>
              
              ${
                totalApiCalls > 0
                  ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                  <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 16px; color: #ffc107; font-weight: bold;">${recentUsage.last7Days}</div>
                    <div style="font-size: 11px; color: #b0bec5;">Last 7 Days</div>
                  </div>
                  <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 16px; color: #ffc107; font-weight: bold;">${recentUsage.last30Days}</div>
                    <div style="font-size: 11px; color: #b0bec5;">Last 30 Days</div>
                  </div>
                </div>
              `
                  : ""
              }

              ${
                Object.keys(modelUsage).length > 0
                  ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2c4a7c;">
                  <strong style="color: #7198f8; font-size: 12px;">🔧 Model Usage Breakdown:</strong>
                  <div style="margin-top: 8px;">
                    ${Object.entries(modelUsage)
                      .map(
                        ([model, stats]) => `
                      <div style="margin-bottom: 6px; padding: 6px; background: #0f2142; border-radius: 4px; font-size: 11px;">
                        <strong style="color: #7198f8;">${model}:</strong> 
                        ${
                          stats.calls
                        } calls • ${stats.tokens.toLocaleString()} tokens • €${stats.cost.toFixed(
                          4
                        )}
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              `
                  : ""
              }

              ${
                Object.keys(costByType).length > 0
                  ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2c4a7c;">
                  <strong style="color: #7198f8; font-size: 12px;">📊 Usage by Operation Type:</strong>
                  <div style="margin-top: 8px;">
                    ${Object.entries(costByType)
                      .map(
                        ([type, stats]) => `
                      <div style="margin-bottom: 6px; padding: 6px; background: #0f2142; border-radius: 4px; font-size: 11px;">
                        <strong style="color: #7198f8;">${
                          type.charAt(0).toUpperCase() + type.slice(1)
                        }:</strong> 
                        ${
                          stats.calls
                        } calls • ${stats.tokens.toLocaleString()} tokens • €${stats.cost.toFixed(
                          4
                        )}
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              `
                  : ""
              }

              <div style="margin-top: 12px; padding: 10px; background: rgba(113, 152, 248, 0.1); border-radius: 6px; border-left: 4px solid #7198f8;">
                <div style="font-size: 11px; color: #b0bec5; line-height: 1.4;">
                  <strong style="color: #7198f8;">💡 About API Usage:</strong><br>
                  • Token usage varies based on content length and complexity<br>
                  • Costs are calculated using Mistral AI's current pricing<br>
                  • Export your data to analyze usage patterns in detail
                </div>
              </div>
            `
            }
          </div>
          
          <div style="margin: 15px 0;">
            <strong style="color: #7198f8;">📅 Recent Activity:</strong>
            <div style="max-height: 400px; overflow-y: auto; margin-top: 10px;">
              ${activityByDate}
            </div>
          </div>
        `
        )
      } catch (error) {
        console.error("📊 Error in showDataOverview:", error)
        alert(`❌ Error viewing data overview: ${error.message}`)
      }
    }

    async getActivityByDate() {
      try {
        const allQAEntries = []
        const allSummaries = []

        // Get all unified AI responses
        const allGMKeys = await GM.listValues()
        const responseKeys = allGMKeys.filter(key =>
          key.startsWith("ai_response_")
        )

        for (const key of responseKeys) {
          try {
            const data = await GM.getValue(key, null)
            if (data) {
              const response = JSON.parse(data)

              if (
                response.type === "qa" &&
                response.request.question &&
                response.response.raw
              ) {
                allQAEntries.push({
                  question: response.request.question,
                  answer: response.response.raw,
                  page: response.pageTitle || "Unknown Page",
                  timestamp: response.timestamp,
                })
              } else if (
                response.type === "summary" &&
                response.response.raw
              ) {
                allSummaries.push({
                  content: response.response.raw,
                  page: response.pageTitle || "Unknown Page",
                  timestamp: response.timestamp,
                  focus: response.request.focus || "general",
                })
              }
            }
          } catch (error) {
            console.warn("Error loading AI response:", error)
          }
        }

        // Sort both by timestamp (newest first)
        allQAEntries.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )
        allSummaries.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )

        allSummaries.length > 0
          ? `<div style="margin-bottom: 12px; padding: 8px; background: #1a3a6b; border-radius: 6px; text-align: center;">
               <strong style="color: #ffc107;">📄 AI Summaries (${
                 allSummaries.length
               })</strong>
             </div>
             <div style="max-height: 600px; overflow-y: auto; padding-right: 5px;">
               ${allSummaries
                 .map((summary, index) => {
                   const summaryId = `summary-simple-${index}`

                   return `<div style="margin-bottom: 10px; padding: 8px; background: #123262; border-radius: 6px; border-left: 4px solid #ffc107;">
                   <div style="font-weight: bold; color: #ffc107; margin-bottom: 4px; font-size: 12px; cursor: pointer;" onclick="
                     const content = document.getElementById('${summaryId}-content');
                     const arrow = document.getElementById('${summaryId}-arrow');
                     if (content.style.display === 'none') {
                       content.style.display = 'block';
                       arrow.textContent = '�';
                     } else {
                       content.style.display = 'none';
                       arrow.textContent = '▶️';
                     }
                   ">
                     <span id="${summaryId}-arrow">▶️</span> 📄 ${summary.page}
                   </div>
                   <div id="${summaryId}-content" style="display: none; color: #e8eaed; font-size: 11px; line-height: 1.4;">
                     ${this.formatSummaryContent(summary.content)}
                   </div>
                 </div>`
                 })
                 .join("")}
             </div>`
          : `<div style="padding: 20px; text-align: center; color: #7f8c8d; border: 1px dashed #2c4a7c; border-radius: 6px;">
               <div style="font-size: 12px;">📄 No summaries yet</div>
               <div style="font-size: 10px; margin-top: 4px;">Generate summaries to see them here</div>
             </div>`

        // Expandable Q&A list with clickable entries
        let qaList = ""
        if (allQAEntries.length > 0) {
          qaList = `<h4>❓ Questions & Answers (${allQAEntries.length}):</h4>`
          qaList += `<div style="max-height: 400px; overflow-y: auto; margin: 10px 0;">`

          allQAEntries.forEach((qa, index) => {
            const qaId = `qa-simple-${index}`
            qaList += `
              <div style="margin-bottom: 10px; padding: 8px; background: #123262; border-radius: 6px; border-left: 4px solid #28a745;">
                <div style="font-weight: bold; color: #28a745; margin-bottom: 4px; font-size: 12px; cursor: pointer;" onclick="
                  const content = document.getElementById('${qaId}-content');
                  const arrow = document.getElementById('${qaId}-arrow');
                  if (content.style.display === 'none') {
                    content.style.display = 'block';
                    arrow.textContent = '▼';
                  } else {
                    content.style.display = 'none';
                    arrow.textContent = '▶️';
                  }
                ">
                  <span id="${qaId}-arrow">▶️</span> ❓ ${qa.question}
                </div>
                <div style="color: #b0bec5; font-size: 10px; margin-bottom: 4px;">
                  📄 ${qa.page} • ${new Date(qa.timestamp).toLocaleDateString()}
                </div>
                <div id="${qaId}-content" style="display: none; color: #e8eaed; font-size: 11px; line-height: 1.4; margin-top: 8px; padding: 8px; background: #0f2142; border-radius: 4px;">
                  <strong style="color: #7198f8;">💡 Answer:</strong><br>
                  <div style="margin-top: 4px;">${
                    qa.answer || "Answer not available"
                  }</div>
                </div>
              </div>
            `
          })
          qaList += `</div>`
        } else {
          qaList = `<h4>❓ Questions & Answers:</h4><p style="color: #7f8c8d;">No questions asked yet</p>`
        }

        let summariesList = ""
        if (allSummaries.length > 0) {
          summariesList = `<h4>📄 AI Summaries (${allSummaries.length}):</h4><ul style="margin: 10px 0; padding-left: 20px;">`
          allSummaries.forEach(summary => {
            summariesList += `<li style="margin: 8px 0; font-size: 12px;"><strong>${
              summary.page
            }</strong> (${new Date(
              summary.timestamp
            ).toLocaleDateString()})</li>`
          })
          summariesList += `</ul>`
        } else {
          summariesList = `<h4>📄 AI Summaries:</h4><p style="color: #7f8c8d;">No summaries generated yet</p>`
        }

        return `
          <div style="padding: 15px;">
            ${qaList}
            <hr style="margin: 20px 0; border-color: #2c4a7c;">
            ${summariesList}
          </div>
        `
      } catch (error) {
        console.error("Error generating activity overview:", error)
        return `<div style="color: #dc3545;">Error loading activity data</div>`
      }
    }

    formatSummaryContent(summary) {
      if (!summary) return "No content available"

      let html = ""

      // Reading time
      if (summary.readingTime) {
        html += `
          <div style="margin-bottom: 8px; padding: 6px; background: #0f2142; border-radius: 4px;">
            <strong style="color: #7198f8;">📄 Reading Time:</strong> ${summary.readingTime} min
          </div>
        `
      }

      // Key Points
      if (summary.keyPoints && summary.keyPoints.length > 0) {
        html += `
          <div style="margin-bottom: 8px; padding: 6px; background: #0f2142; border-radius: 4px;">
            <strong style="color: #7198f8;">🎯 Key Learning Points:</strong><br>
            <div style="margin-top: 4px;">
              ${summary.keyPoints.map(point => `• ${point}`).join("<br>")}
            </div>
          </div>
        `
      }

      // Clinical Pearls
      if (summary.clinicalPearls && summary.clinicalPearls.length > 0) {
        html += `
          <div style="margin-bottom: 8px; padding: 6px; background: #0f2142; border-radius: 4px;">
            <strong style="color: #7198f8;">💎 Clinical Pearls:</strong><br>
            <div style="margin-top: 4px;">
              ${summary.clinicalPearls.map(pearl => `• ${pearl}`).join("<br>")}
            </div>
          </div>
        `
      }

      // Differentials
      if (summary.differentials && summary.differentials.length > 0) {
        html += `
          <div style="margin-bottom: 8px; padding: 6px; background: #0f2142; border-radius: 4px;">
            <strong style="color: #7198f8;">🔍 Differential Diagnoses:</strong><br>
            <div style="margin-top: 4px;">
              ${summary.differentials.map(diff => `• ${diff}`).join("<br>")}
            </div>
          </div>
        `
      }

      // Imaging Approach
      if (summary.imagingApproach && summary.imagingApproach.length > 0) {
        html += `
          <div style="margin-bottom: 8px; padding: 6px; background: #0f2142; border-radius: 4px;">
            <strong style="color: #7198f8;">📋 Imaging Approach:</strong><br>
            <div style="margin-top: 4px;">
              ${summary.imagingApproach
                .map((step, index) => `${index + 1}. ${step}`)
                .join("<br>")}
            </div>
          </div>
        `
      }

      // Diagnostic Approach
      if (summary.diagnosticApproach && summary.diagnosticApproach.length > 0) {
        html += `
          <div style="margin-bottom: 8px; padding: 6px; background: #0f2142; border-radius: 4px;">
            <strong style="color: #7198f8;">🩺 Diagnostic Approach:</strong><br>
            <div style="margin-top: 4px;">
              ${summary.diagnosticApproach
                .map((step, index) => `${index + 1}. ${step}`)
                .join("<br>")}
            </div>
          </div>
        `
      }

      return html || "Summary content not available"
    }

    formatSummaryContentSimple(summary) {
      if (!summary) return "No content available"

      let html = ""

      // Convert markdown formatting to HTML and show key points
      if (summary.keyPoints && summary.keyPoints.length > 0) {
        html += `<div style="margin-bottom: 8px;"><strong>🎯 Key Points:</strong><br>`
        summary.keyPoints.slice(0, 3).forEach(point => {
          // Convert markdown **bold** to HTML <strong>
          const formattedPoint = point.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
          )
          html += `<div style="margin: 4px 0; padding-left: 8px;">• ${formattedPoint}</div>`
        })
        if (summary.keyPoints.length > 3) {
          html += `<div style="color: #7f8c8d; font-style: italic; padding-left: 8px;">...and ${
            summary.keyPoints.length - 3
          } more</div>`
        }
        html += `</div>`
      }

      if (summary.clinicalPearls && summary.clinicalPearls.length > 0) {
        html += `<div style="margin-bottom: 8px;"><strong>💎 Clinical Pearls:</strong><br>`
        summary.clinicalPearls.slice(0, 2).forEach(pearl => {
          // Convert markdown **bold** to HTML <strong>
          const formattedPearl = pearl.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
          )
          html += `<div style="margin: 4px 0; padding-left: 8px;">• ${formattedPearl}</div>`
        })
        if (summary.clinicalPearls.length > 2) {
          html += `<div style="color: #7f8c8d; font-style: italic; padding-left: 8px;">...and ${
            summary.clinicalPearls.length - 2
          } more</div>`
        }
        html += `</div>`
      }

      return html || "Summary content available"
    }

    async getSummaryHistory(pageUrl) {
      try {
        // Use the aiTutor's unified storage method
        const responses = await this.aiTutor.getPageAIResponses(
          pageUrl,
          "summary"
        )

        // Convert to expected format for display
        return responses.map(response => ({
          content: response.response.raw,
          timestamp: response.timestamp,
          focus: response.request.focus || "general",
        }))
      } catch (error) {
        console.error("Error getting summary history:", error)
        return []
      }
    }

    // Get the most recent summary for this page (any type) from unified storage
    async getLastSummary(pageUrl) {
      try {
        const responses = await this.aiTutor.getPageAIResponses(
          pageUrl,
          "summary"
        )
        if (responses.length > 0) {
          const latest = responses[0] // Already sorted by timestamp, most recent first
          return {
            content: latest.response.raw,
            timestamp: latest.timestamp,
            focus: latest.request.focus || "general",
          }
        }
        return null
      } catch (error) {
        console.error("Error getting last summary:", error)
        return null
      }
    }

    // Helper method to format camelCase/snake_case field names into readable titles
    formatFieldNameAsTitle(fieldName) {
      return (
        fieldName
          // Handle camelCase: keyDistinguishers -> key Distinguishers
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          // Handle snake_case: imaging_approach -> imaging approach
          .replace(/_/g, " ")
          // Capitalize first letter of each word
          .replace(/\b\w/g, letter => letter.toUpperCase())
      )
    }

    // Helper method to get appropriate emoji for field names
    getEmojiForField(fieldName) {
      const fieldLower = fieldName.toLowerCase()

      if (
        fieldLower.includes("differential") ||
        fieldLower.includes("diagnos")
      ) {
        return "🔍"
      } else if (
        fieldLower.includes("approach") ||
        fieldLower.includes("workflow")
      ) {
        return "📋"
      } else if (
        fieldLower.includes("pearl") ||
        fieldLower.includes("tip") ||
        fieldLower.includes("distinguisher")
      ) {
        return "💎"
      } else if (
        fieldLower.includes("point") ||
        fieldLower.includes("key") ||
        fieldLower.includes("main")
      ) {
        return "🎯"
      } else if (fieldLower.includes("imaging")) {
        return "🔬"
      } else if (fieldLower.includes("clinical")) {
        return "🩺"
      } else {
        return "📝" // Default emoji
      }
    }

    // Check if a specific summary type exists for this page
    async getCachedSummaryByType(pageUrl, length, focus) {
      try {
        const allGMKeys = await GM.listValues()
        const pageContent = this.aiTutor.extractPageContent()
        const contentHash = this.aiTutor.getContentHash(pageContent)

        // Build the expected cache key pattern for this specific type
        const options = { length, focus }
        const expectedCacheKey = `ai_cache_summary_${pageUrl}_${contentHash}_${JSON.stringify(
          options
        )}`

        //console.log("🔍 Looking for cached summary type:", {
        //  length,
        //  focus,
        //  expectedCacheKey: expectedCacheKey.substring(0, 60) + "...",
        //})

        // Check if this exact type exists
        const cached = await GM.getValue(expectedCacheKey, null)
        if (cached) {
          const parsedCache = JSON.parse(cached)
          if (parsedCache.timestamp && parsedCache.content) {
            //console.log("✅ Found cached summary for this type")
            return {
              summary: parsedCache.content,
              timestamp: parsedCache.timestamp,
              cacheKey: expectedCacheKey,
              age: Date.now() - parsedCache.timestamp,
            }
          }
        }

        console.log("❌ No cached summary found for this type")
        return null
      } catch (error) {
        console.error("Error checking cached summary by type:", error)
        return null
      }
    }

    // Helper method to parse and format any response content
    parseAndFormatResponse(content) {
      try {
        // If content is already an object (parsed), format it directly
        if (typeof content === "object" && content !== null) {
          return this.formatSummaryContent(content)
        }

        // If content is a string, try to parse it first
        if (typeof content === "string") {
          // Try to parse as JSON first
          try {
            const parsed = JSON.parse(content)
            return this.formatSummaryContent(parsed)
          } catch (jsonError) {
            // If JSON parsing fails, try using the summary parser
            const parsed = this.aiTutor.parseSummaryResponse(content)
            return this.formatSummaryContent(parsed)
          }
        }

        // Fallback for any other case
        console.warn("Unknown content type:", typeof content)
        return `<div style="color: #95a5a6; padding: 20px; text-align: center;">Content format not recognized</div>`
      } catch (error) {
        console.error("Error parsing and formatting response:", error)
        return `<div style="color: #dc3545; padding: 20px; text-align: center;">Error displaying content: ${error.message}</div>`
      }
    }

    async testApiKey() {
      if (!this.aiTutor.hasApiKey()) {
        alert("❌ No API key configured. Please set up your API key first.")
        return
      }

      const testButton = document.querySelector('[data-action="test-api-key"]')
      const originalText = testButton ? testButton.textContent : null

      if (testButton) {
        testButton.textContent = "🔄 Testing..."
        testButton.disabled = true
      }

      try {
        const testResponse = await this.aiTutor.callMistralAPI(
          'Test message - please respond with "OK"',
          "mistral-small-latest",
          { type: "api_test" }
        )

        if (testResponse && testResponse.content) {
          alert("✅ API key is working correctly!")
        } else {
          alert("⚠️ API key test returned unexpected response.")
        }
      } catch (error) {
        if (error.apiErrorDetails) {
          const details = error.apiErrorDetails
          alert(
            `❌ API Key Test Failed\n\n${details.title}\n${details.message}\n\nSuggestion: ${details.suggestion}`
          )
        } else {
          alert(`❌ API key test failed: ${error.message}`)
        }
      } finally {
        if (testButton) {
          testButton.textContent = originalText || "Test Key"
          testButton.disabled = false
        }
      }
    }

    async showAllDataViewer() {
      //console.log("🔍 showAllDataViewer called")
      try {
        //console.log("🔍 Getting ALL GM keys (including AI cache)...")

        // Get ALL GM keys, not just prefixed ones
        const allGMKeys = await GM.listValues()
        //console.log("🔍 All GM keys found:", allGMKeys)

        // Separate prefixed app data from AI cache
        const appDataKeys = allGMKeys.filter(key =>
          key.startsWith("ra_tutor_gdpr_")
        )
        const aiCacheKeys = allGMKeys.filter(key => key.startsWith("ai_cache_"))
        const apiKeyKeys = allGMKeys.filter(key => key === "mistral_api_key")
        const otherKeys = allGMKeys.filter(
          key =>
            !key.startsWith("ra_tutor_gdpr_") &&
            !key.startsWith("ai_cache_") &&
            key !== "mistral_api_key"
        )

        //console.log("🔍 Categorized keys:", {
        //  appData: appDataKeys.length,
        //  aiCache: aiCacheKeys.length,
        //  apiKey: apiKeyKeys.length,
        //  other: otherKeys.length,
        //})

        // Count Q&A history entries
        const qaHistoryKeys = appDataKeys.filter(key =>
          key.includes("qa_history_")
        )
        //console.log("🔍 Q&A History keys found:", qaHistoryKeys.length)

        if (allGMKeys.length === 0) {
          console.log("� No keys found at all")
          this.showDataModal(
            "📊 All Stored Data",
            `
            <div style="background: #fd7e14; padding: 15px; border-radius: 8px; margin: 10px 0; color: white;">
              <strong>ℹ️ No Data Found</strong><br>
              No data keys found in GM storage.<br>
              This could mean you haven't used the extension yet.
            </div>
          `
          )
          return
        }

        const dataPreview = {}

        // Load app data
        for (const key of appDataKeys) {
          const cleanKey = key.replace("ra_tutor_gdpr_", "")
          //console.log("🔍 Loading app data for key:", cleanKey)
          const data = await this.dataManager.loadData(cleanKey, {})
          dataPreview[`APP_DATA_${cleanKey}`] = data
        }

        // Load AI cache data
        for (const key of aiCacheKeys) {
          //console.log("🔍 Loading AI cache for key:", key)
          try {
            const cached = await GM.getValue(key, null)
            if (cached) {
              const parsedCache = JSON.parse(cached)
              const cleanKey = key.replace("ai_cache_", "")
              dataPreview[`AI_CACHE_${cleanKey}`] = {
                content: parsedCache.content,
                timestamp: parsedCache.timestamp,
                age: this.aiTutor.formatTimeAgo(parsedCache.timestamp),
                size: JSON.stringify(parsedCache.content).length,
                type: cleanKey.startsWith("summary_")
                  ? "Summary"
                  : cleanKey.startsWith("qa_")
                  ? "Q&A"
                  : "Unknown",
              }
            } else {
              dataPreview[`AI_CACHE_${key.replace("ai_cache_", "")}`] = {
                error: "No cached data found",
              }
            }
          } catch (error) {
            console.error("Error loading cache key:", key, error)
            dataPreview[`AI_CACHE_${key.replace("ai_cache_", "")}`] = {
              error: `Error loading cache: ${error.message}`,
            }
          }
        }

        // Load API key info
        if (apiKeyKeys.length > 0) {
          const apiKey = await GM.getValue("mistral_api_key", null)
          dataPreview["API_KEY_INFO"] = {
            configured: !!apiKey,
            preview: apiKey
              ? `${apiKey.substring(0, 8)}...${apiKey.substring(
                  apiKey.length - 4
                )}`
              : "Not set",
          }
        }

        // Load other keys
        for (const key of otherKeys) {
          //console.log("🔍 Loading other data for key:", key)
          try {
            const data = await GM.getValue(key, null)
            dataPreview[`OTHER_${key}`] = data
          } catch (error) {
            dataPreview[`OTHER_${key}`] = "Error loading data"
          }
        }

        // Create formatted data display
        let formattedData = ""

        // Show app data first
        const appDataEntries = Object.entries(dataPreview).filter(([key]) =>
          key.startsWith("APP_DATA_")
        )
        if (appDataEntries.length > 0) {
          formattedData += `<div style="margin: 10px 0; padding: 10px; background: #1a3a6b; border-radius: 6px;">
            <strong>📚 Application Data (${appDataEntries.length} items):</strong><br>`

          appDataEntries.forEach(([key, data]) => {
            const cleanKey = key.replace("APP_DATA_", "")
            if (cleanKey === "reading_progress") {
              const today = new Date().toISOString().split("T")[0]
              const todayPages = data.dailyPagesRead
                ? data.dailyPagesRead[today] || 0
                : 0
              formattedData += `• Reading Progress: ${todayPages} pages today, ${
                data.apiCallsTotal || 0
              } API calls<br>`
            } else if (cleanKey.startsWith("qa_history_")) {
              // Q&A History entry
              const qaCount = Array.isArray(data) ? data.length : 0
              const pageHash = cleanKey.replace("qa_history_", "")
              const latestEntry = qaCount > 0 ? data[0] : null
              const pageTitle = latestEntry
                ? latestEntry.pageTitle
                : "Unknown Page"
              formattedData += `• Q&A History (${pageTitle.substring(
                0,
                30
              )}...): ${qaCount} questions<br>`
            } else {
              formattedData += `• ${cleanKey}: ${
                JSON.stringify(data).length
              } bytes<br>`
            }
          })
          formattedData += `</div>`
        }

        // Show AI cache data
        const aiCacheEntries = Object.entries(dataPreview).filter(([key]) =>
          key.startsWith("AI_CACHE_")
        )
        if (aiCacheEntries.length > 0) {
          formattedData += `<div style="margin: 10px 0; padding: 10px; background: #1a3a6b; border-radius: 6px;">
            <strong>🤖 AI Cache (${aiCacheEntries.length} items):</strong><br>`

          aiCacheEntries.forEach(([key, data]) => {
            const cacheKey = key.replace("AI_CACHE_", "")
            if (data && typeof data === "object" && !data.error) {
              formattedData += `• <button onclick="window.raTutor.ui.aiTutor.viewCacheContent('${cacheKey}', '${data.type}')" style="background: #7198f8; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px; margin-right: 6px;">View</button>${cacheKey}: ${data.type} (${data.age}, ${data.size} bytes)<br>`
            } else if (data && data.error) {
              formattedData += `• ${cacheKey}: ${data.error}<br>`
            } else {
              formattedData += `• ${cacheKey}: Invalid data format<br>`
            }
          })
          formattedData += `</div>`
        }

        // Show API key info
        if (dataPreview.API_KEY_INFO) {
          const apiInfo = dataPreview.API_KEY_INFO
          formattedData += `<div style="margin: 10px 0; padding: 10px; background: #1a3a6b; border-radius: 6px;">
            <strong>🔑 API Key:</strong> ${
              apiInfo.configured ? `✅ ${apiInfo.preview}` : "❌ Not configured"
            }<br>
          </div>`
        }

        // Show other data
        const otherEntries = Object.entries(dataPreview).filter(([key]) =>
          key.startsWith("OTHER_")
        )
        if (otherEntries.length > 0) {
          formattedData += `<div style="margin: 10px 0; padding: 10px; background: #1a3a6b; border-radius: 6px;">
            <strong>📦 Other Data (${otherEntries.length} items):</strong><br>`
          otherEntries.forEach(([key, data]) => {
            formattedData += `• ${key.replace("OTHER_", "")}: ${
              JSON.stringify(data).length
            } bytes<br>`
          })
          formattedData += `</div>`
        }

        const totalSize = JSON.stringify(dataPreview).length
        const dataJson = JSON.stringify(dataPreview, null, 2)

        // Calculate Q&A statistics
        let totalQAEntries = 0
        let totalPages = 0
        let totalSummaries = 0
        let totalQACache = 0

        // Count Q&A history entries
        Object.entries(dataPreview).forEach(([key, data]) => {
          if (key.startsWith("APP_DATA_qa_history_")) {
            totalPages++
            if (Array.isArray(data)) {
              totalQAEntries += data.length
            }
          }
        })

        // Count AI cache entries by type
        Object.entries(dataPreview).forEach(([key, data]) => {
          if (key.startsWith("AI_CACHE_")) {
            if (data && data.type === "Summary") {
              totalSummaries++
            } else if (data && data.type === "Q&A") {
              totalQACache++
            }
          }
        })

        // Create modal to show data
        this.showDataModal(
          "📊 All Stored Data",
          `
          <div style="background: #1a3a6b; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <strong>📊 Storage Summary:</strong><br>
            <strong>🔑 API Key:</strong> ${
              this.aiTutor.hasApiKey() ? "✅ Configured" : "❌ Not set"
            }<br>
            <strong>📦 Total Keys:</strong> ${allGMKeys.length}<br>
            <strong>❓ Q&A Entries:</strong> ${totalQAEntries} questions across ${totalPages} pages<br>
            <strong>🤖 AI Cache:</strong> ${totalSummaries} summaries, ${totalQACache} Q&A responses<br>
            <strong>💾 Estimated Size:</strong> ~${Math.round(
              totalSize / 1024
            )}KB
          </div>
          
          ${formattedData}
          
          <details style="margin-top: 15px;">
            <summary style="cursor: pointer; color: #7198f8; font-weight: bold;">🔧 Show Raw JSON Data</summary>
            <div style="background: #0f2142; padding: 15px; border-radius: 8px; max-height: 300px; overflow-y: auto; margin-top: 10px;">
              <pre style="font-size: 10px; color: #b0bec5; white-space: pre-wrap; word-break: break-all;">${dataJson}</pre>
            </div>
          </details>
        `
        )
      } catch (error) {
        console.error("🔍 Error in showAllDataViewer:", error)
        alert(`❌ Error viewing data: ${error.message}`)
      }
    }

    async exportCombinedData() {
      try {
        const allKeys = await GM.listValues()
        const responseKeys = allKeys.filter(key =>
          key.startsWith("ai_response_")
        )
        const tokenLogKeys = allKeys.filter(key => key.startsWith("token_log_"))

        // Collect all data types
        const qaData = []
        const summariesData = []
        const tokenUsageData = []

        // Process responses
        for (const key of responseKeys) {
          const data = await GM.getValue(key, null)
          if (data) {
            const response = JSON.parse(data)

            if (response.type === "qa") {
              qaData.push({
                date: new Date(response.timestamp).toISOString().split("T")[0],
                time: new Date(response.timestamp)
                  .toISOString()
                  .split("T")[1]
                  .split(".")[0],
                page_title: response.pageTitle || "Unknown",
                page_url: response.pageUrl || "Unknown",
                question: response.request.question || "",
                answer: response.response.raw || "",
                model_used: response.metadata?.model || "unknown",
                question_length: response.metadata?.questionLength || 0,
                language: response.request.languageInstruction
                  ? "non-english"
                  : "english",
              })
            } else if (response.type === "summary") {
              // Handle both new markdown format and legacy JSON format
              let summaryContent = ""
              if (response.response && response.response.raw) {
                // New markdown format or legacy format with raw content
                summaryContent = response.response.raw
              } else {
                // Fallback for other formats
                summaryContent = JSON.stringify(response.response || {})
              }

              summariesData.push({
                date: new Date(response.timestamp).toISOString().split("T")[0],
                time: new Date(response.timestamp)
                  .toISOString()
                  .split("T")[1]
                  .split(".")[0],
                page_title: response.pageTitle || "Unknown",
                page_url: response.pageUrl || "Unknown",
                summary_focus:
                  response.request.options?.focus ||
                  response.request.focus ||
                  "general",
                summary_length:
                  response.request.options?.length ||
                  response.request.length ||
                  "medium",
                summary_content: summaryContent, // Full content for proper CSV export
                model_used: response.metadata?.model || "unknown",
                content_length: summaryContent.length,
                language: response.request.languageInstruction
                  ? "non-english"
                  : "english",
              })
            }
          }
        }

        // Process token usage logs
        for (const key of tokenLogKeys) {
          const data = await GM.getValue(key, null)
          if (data) {
            const log = JSON.parse(data)
            tokenUsageData.push({
              date: new Date(log.timestamp).toISOString().split("T")[0],
              time: new Date(log.timestamp)
                .toISOString()
                .split("T")[1]
                .split(".")[0],
              type: log.type || "unknown",
              model: log.model || "unknown",
              page_url: log.pageUrl || "unknown",
              tokens_prompt: log.tokens?.prompt || 0,
              tokens_completion: log.tokens?.completion || 0,
              tokens_total: log.tokens?.total || 0,
              cost_usd: log.cost || 0,
            })
          }
        }

        // Sort all data by date
        qaData.sort(
          (a, b) =>
            new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time)
        )
        summariesData.sort(
          (a, b) =>
            new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time)
        )
        tokenUsageData.sort(
          (a, b) =>
            new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time)
        )

        // Generate clean combined CSV content without problematic metadata
        // Combine Q&A and Summaries with unified column structure
        const combinedData = []

        // Add all Q&A data with compatible structure
        qaData.forEach(qa => {
          combinedData.push({
            date: qa.date,
            time: qa.time,
            type: "Q&A",
            page_title: qa.page_title,
            page_url: qa.page_url,
            focus_or_question: qa.question,
            content_or_answer: qa.answer,
            content_length: qa.answer ? qa.answer.length : 0,
            model_used: qa.model_used,
            language: qa.language,
          })
        })

        // Add all summary data with compatible structure
        summariesData.forEach(summary => {
          combinedData.push({
            date: summary.date,
            time: summary.time,
            type: "Summary",
            page_title: summary.page_title,
            page_url: summary.page_url,
            focus_or_question: `${summary.summary_focus} (${summary.summary_length})`,
            content_or_answer: summary.summary_content,
            content_length: summary.content_length,
            model_used: summary.model_used,
            language: summary.language,
          })
        })

        // Sort combined data by date (most recent first)
        combinedData.sort(
          (a, b) =>
            new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time)
        )

        if (combinedData.length === 0) {
          this.showBriefNotification(
            "📭 No Q&A or Summary data found to export"
          )
          return
        }

        // Generate clean CSV with unified headers
        const headers = [
          "date",
          "time",
          "type",
          "page_title",
          "page_url",
          "focus_or_question",
          "content_or_answer",
          "content_length",
          "model_used",
          "language",
        ]

        const csvContent = this.generateCSV(
          combinedData,
          headers,
          "Combined Q&A and Summaries"
        )

        // Create filename with date and time
        const now = new Date()
        const dateStr = now.toISOString().split("T")[0]
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-")
        const filename = `radiology-tutor-combined-export-${dateStr}-${timeStr}.csv`

        this.downloadCSV(csvContent, filename)

        this.showBriefNotification(
          `✅ Combined export successful! (${qaData.length} Q&A + ${summariesData.length} summaries)`
        )
      } catch (error) {
        console.error("📤 Error in exportCombinedData:", error)
        alert(`❌ Error exporting data: ${error.message}`)
      }
    }

    arrayToCSV(data, headers) {
      if (data.length === 0) return headers.join(",") + "\n"

      const csvRows = [
        headers.join(","), // Header row
        ...data.map(row =>
          headers.map(header => this.escapeCSV(row[header])).join(",")
        ),
      ]
      return csvRows.join("\n")
    }

    escapeCSV(value) {
      if (value === null || value === undefined) return ""
      const str = String(value)

      // Enhanced escaping for markdown content (especially summaries)
      // Handle quotes, commas, newlines, and markdown-specific characters
      const needsEscaping =
        str.includes('"') ||
        str.includes(",") ||
        str.includes("\n") ||
        str.includes("\r") ||
        str.length > 100

      if (needsEscaping) {
        // Clean up markdown formatting for CSV export
        let cleanedStr = str
          .replace(/\r\n/g, "\n") // Normalize line endings
          .replace(/\r/g, "\n") // Convert remaining \r to \n
          .replace(/"/g, '""') // Escape existing quotes

        // Debug large content being escaped

        // Wrap in quotes to preserve all formatting
        return `"${cleanedStr}"`
      }
      return str
    }

    async exportAllData() {
      // Use the new combined export method
      await this.exportCombinedData()
    }

    async purgeDataKeepKey() {
      console.log("🗑️ purgeDataKeepKey called")
      if (
        confirm(
          "⚠️ This will delete all progress data but keep your API key. Continue?"
        )
      ) {
        try {
          // Get ALL GM storage keys, not just legacy ones
          const allKeys = await GM.listValues()
          console.log("🗑️ All keys found:", allKeys)

          // Clear everything EXCEPT the API key
          let deletedCount = 0
          for (const key of allKeys) {
            if (key !== "mistral_api_key") {
              await GM.deleteValue(key)
              deletedCount++
              console.log(`🗑️ Deleted key: ${key}`)
            } else {
              console.log(`🔒 Preserved API key: ${key}`)
            }
          }

          console.log(
            `🔒 GDPR: ${deletedCount} data keys purged, API key preserved`
          )
          alert(
            `✅ Progress data cleared (${deletedCount} items). API key preserved.`
          )

          // Close modal and allow user to reopen if needed
          const modal = document.querySelector(".settings-modal-overlay")
          if (modal) {
            modal.remove()
          }
        } catch (error) {
          console.error("🗑️ Error in purgeDataKeepKey:", error)
          alert(`❌ Error purging data: ${error.message}`)
        }
      }
    }

    async purgeAllData() {
      console.log("💥 purgeAllData called")

      // First confirmation - make it scary
      if (
        !confirm(
          "🚨 DANGER ZONE 🚨\n\nThis will PERMANENTLY DELETE:\n• All your reading progress\n• All your quiz results\n• Your API key\n• ALL stored data\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?"
        )
      ) {
        return
      }

      // Second confirmation - even scarier
      if (
        !confirm(
          "⚠️ FINAL WARNING ⚠️\n\nYou are about to destroy ALL data.\nThere is NO way to recover this.\n\nType-to-confirm: Are you 100% certain?\n\nClick OK to PERMANENTLY DELETE EVERYTHING\nClick Cancel to abort"
        )
      ) {
        return
      }

      try {
        console.log("💥 Proceeding with nuclear option...")

        // Get ALL GM storage keys and delete everything
        const allKeys = await GM.listValues()
        console.log("💥 All keys found:", allKeys)

        let deletedCount = 0
        for (const key of allKeys) {
          await GM.deleteValue(key)
          deletedCount++
          console.log(`💥 Deleted key: ${key}`)
        }

        console.log(`💥 TOTAL DESTRUCTION: ${deletedCount} keys deleted`)

        // Close modal and show completion message
        const modal = document.querySelector(".settings-modal-overlay")
        if (modal) {
          modal.remove()
        }
        alert(
          `💥 Everything has been permanently deleted (${deletedCount} items).`
        )
      } catch (error) {
        console.error("💥 Error in purgeAllData:", error)
        alert(`❌ Error purging all data: ${error.message}`)
      }
    }

    showDataModal(title, content) {
      // Remove existing modal if any
      const existingModal = document.querySelector(".data-modal-overlay")
      if (existingModal) {
        existingModal.remove()
      }

      const overlay = document.createElement("div")
      overlay.className = "data-modal-overlay"
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 100000;
        display: flex; align-items: center; justify-content: center;
      `

      const modal = document.createElement("div")
      modal.style.cssText = `
        background: #123262; color: white; padding: 20px; border-radius: 12px;
        max-width: 80%; max-height: 80%; overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      `

      modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #7198f8;">${title}</h3>
          <button id="close-modal" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">✕ Close</button>
        </div>
        <div>${content}</div>
      `

      overlay.appendChild(modal)
      document.body.appendChild(overlay)

      // Close modal handlers
      const closeBtn = modal.querySelector("#close-modal")
      closeBtn.addEventListener("click", () => overlay.remove())
      overlay.addEventListener("click", e => {
        if (e.target === overlay) overlay.remove()
      })
    }

    // Helper method to normalize URLs for comparison (extract just the path)
    normalizeUrlForComparison(url) {
      if (!url) return ""

      // If it's already just a path, return it
      if (url.startsWith("/")) {
        return url
      }

      // If it's a full URL, extract the pathname
      try {
        const urlObj = new URL(url)
        return urlObj.pathname
      } catch (error) {
        console.warn("Could not parse URL:", url)
        return url
      }
    }

    // Helper method to get the last summary for a page
    async getLastSummary(pageUrl) {
      try {
        // Use the aiTutor's unified storage method instead of old cache system
        const responses = await this.aiTutor.getPageAIResponses(
          pageUrl,
          "summary"
        )

        if (responses.length > 0) {
          const latest = responses[0] // Already sorted by timestamp, most recent first

          return {
            content: latest.response.raw,
            timestamp: latest.timestamp,
            focus: latest.request.focus || "general",
            pageUrl: pageUrl,
          }
        }

        return null
      } catch (error) {
        console.error("Error getting last summary:", error)
        return null
      }
    }

    // Helper method to get cached summary by specific type (length + focus)
    async getCachedSummaryByType(pageUrl, length, focus) {
      try {
        const allGMKeys = await GM.listValues()
        const aiCacheKeys = allGMKeys.filter(key =>
          key.startsWith("ai_cache_summary_")
        )

        // Normalize the input pageUrl to just the path for comparison
        const normalizedPageUrl = this.normalizeUrlForComparison(pageUrl)

        // console.log("🔍 getCachedSummaryByType:", {
        //   pageUrl,
        //   normalizedPageUrl,
        //   length,
        //   focus,
        // })

        for (const key of aiCacheKeys) {
          try {
            const cached = await GM.getValue(key, null)
            if (cached) {
              const parsedCache = JSON.parse(cached)
              if (
                parsedCache.timestamp &&
                parsedCache.content &&
                parsedCache.options
              ) {
                // Extract page info from cache key
                const keyParts = key.replace("ai_cache_summary_", "").split("_")
                let keyPageUrl = keyParts[0]

                // Reconstruct the full path like we did in getLastSummary
                if (keyParts.length > 2) {
                  const hashIndex = keyParts.findIndex(
                    part => part.length > 20 && /^[a-f0-9]+$/.test(part)
                  )
                  if (hashIndex > 0) {
                    keyPageUrl = keyParts.slice(0, hashIndex).join("_")
                  }
                }

                if (!keyPageUrl.startsWith("/")) {
                  keyPageUrl = "/" + keyPageUrl.replace(/_/g, "/")
                }

                // Check if this matches the page and summary type (use normalized URLs)
                if (
                  keyPageUrl === normalizedPageUrl &&
                  parsedCache.options.length === length &&
                  parsedCache.options.focus === focus
                ) {
                  return {
                    summary: parsedCache.content,
                    timestamp: parsedCache.timestamp,
                    summaryType: `${length}_${focus}`,
                    pageUrl: normalizedPageUrl,
                    age: Date.now() - parsedCache.timestamp,
                    cacheKey: key,
                  }
                }
              }
            }
          } catch (error) {
            console.warn("Error loading summary:", error)
          }
        }

        console.log("❌ No cached summary found for this type")
        return null
      } catch (error) {
        console.error("Error getting cached summary by type:", error)
        return null
      }
    }

    // Helper method to get summary history for a page
    async getSummaryHistory(pageUrl) {
      try {
        // Use the aiTutor's unified storage method
        const responses = await this.aiTutor.getPageAIResponses(
          pageUrl,
          "summary"
        )

        // Convert to expected format for display
        return responses.map(response => ({
          content: response.response.raw,
          timestamp: response.timestamp,
          pageUrl: pageUrl,
          options: response.request.options || {},
          cacheKey: `ai_response_${response.type}_${response.id}`, // For compatibility
        }))
      } catch (error) {
        console.error("Error getting summary history:", error)
        return []
      }
    }

    // Helper method to parse and format response content
    parseAndFormatResponse(content) {
      if (!content) return "No content available"

      try {
        // If it's already an object, use it directly
        if (typeof content === "object") {
          return this.formatSummaryContent(content)
        }

        // Try to parse as JSON first
        const parsed = JSON.parse(content)
        return this.formatSummaryContent(parsed)
      } catch (error) {
        // If JSON parsing fails, try the aiTutor's parser
        try {
          if (this.aiTutor && this.aiTutor.parseSummaryResponse) {
            const parsed = this.aiTutor.parseSummaryResponse(content)
            return this.formatSummaryContent(parsed)
          }
        } catch (parseError) {
          console.warn("Could not parse response:", parseError)
        }

        // Fallback: return content as-is with basic formatting
        return content.replace(/\n/g, "<br>")
      }
    }

    // Helper method to format summary content for display
    formatSummaryContent(summary) {
      if (!summary) return "No summary content available"

      // If it's a string, return it directly
      if (typeof summary === "string") {
        return summary.replace(/\n/g, "<br>")
      }

      let html = ""

      // Format key points
      if (summary.keyPoints && summary.keyPoints.length > 0) {
        html += `<div style="margin-bottom: 12px;">
          <strong style="color: #7198f8;">🎯 Key Points:</strong><br>
          ${summary.keyPoints.map(point => `• ${point}`).join("<br>")}
        </div>`
      }

      // Format clinical pearls
      if (summary.clinicalPearls && summary.clinicalPearls.length > 0) {
        html += `<div style="margin-bottom: 12px;">
          <strong style="color: #7198f8;">💎 Clinical Pearls:</strong><br>
          ${summary.clinicalPearls.map(pearl => `• ${pearl}`).join("<br>")}
        </div>`
      }

      // Format differentials
      if (summary.differentials && summary.differentials.length > 0) {
        html += `<div style="margin-bottom: 12px;">
          <strong style="color: #7198f8;">🔍 Differential Diagnoses:</strong><br>
          ${summary.differentials.map(diff => `• ${diff}`).join("<br>")}
        </div>`
      }

      return html || summary.toString().replace(/\n/g, "<br>")
    }

    // ========================================
    // 💰 PRICING MANAGEMENT UI METHODS
    // ========================================

    async showPricingOverview() {
      try {
        const allPricing = await this.aiTutor.getAllPricing()

        let pricingHTML = `
          <div style="background: #1a3a6b; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <strong>💰 Current Pricing Configuration:</strong><br>
            <div style="margin-top: 10px;">
        `

        // Show effective pricing (default + custom overrides)
        Object.entries(allPricing.effective).forEach(([model, pricing]) => {
          const isCustom = allPricing.custom[model] ? true : false
          pricingHTML += `
            <div style="margin-bottom: 8px; padding: 8px; background: #123262; border-radius: 6px; ${
              isCustom ? "border-left: 4px solid #ffc107;" : ""
            }">
              <div style="font-weight: bold; color: #7198f8; margin-bottom: 4px;">
                ${model} ${isCustom ? "(Custom)" : "(Default)"}
              </div>
              <div style="font-size: 11px; color: #b0bec5;">
                Input: €${pricing.input}/1K tokens • Output: €${
            pricing.output
          }/1K tokens
              </div>
              ${
                isCustom && pricing.lastUpdated
                  ? `
                <div style="font-size: 9px; color: #7f8c8d; margin-top: 2px;">
                  Updated: ${new Date(pricing.lastUpdated).toLocaleString()}
                </div>
              `
                  : ""
              }
            </div>
          `
        })

        pricingHTML += `
            </div>
            <div style="margin-top: 15px; padding: 10px; background: rgba(113, 152, 248, 0.1); border-radius: 6px; border-left: 4px solid #7198f8;">
              <div style="font-size: 11px; color: #b0bec5; line-height: 1.4;">
                <strong style="color: #7198f8;">💡 About Pricing:</strong><br>
                • Default pricing is built into the script<br>
                • Custom pricing overrides defaults for specific models<br>
                • Costs are calculated per 1,000 tokens (input + output)<br>
                • Update pricing when Mistral AI changes their rates
              </div>
            </div>
          </div>
        `

        this.showDataModal("💰 AI Pricing Overview", pricingHTML)
      } catch (error) {
        console.error("Error showing pricing overview:", error)
        alert(`❌ Error loading pricing information: ${error.message}`)
      }
    }

    async showPricingEditor() {
      try {
        const allPricing = await this.aiTutor.getAllPricing()

        // Create pricing editor modal
        const overlay = document.createElement("div")
        overlay.className = "pricing-editor-overlay"
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
        `

        const modal = document.createElement("div")
        modal.style.cssText = `
          background: white;
          padding: 30px;
          border-radius: 15px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `

        let modelsHTML = ""
        Object.entries(allPricing.effective).forEach(([model, pricing]) => {
          const isCustom = allPricing.custom[model] ? true : false
          modelsHTML += `
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; ${
              isCustom ? "border-left: 5px solid #ffc107;" : ""
            }">
              <h4 style="margin: 0 0 10px 0; color: #333;">${model} ${
            isCustom ? "(Custom)" : "(Default)"
          }</h4>
              <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                <div style="flex: 1;">
                  <label style="display: block; margin-bottom: 5px; font-weight: bold;">Input Cost ($/1K tokens):</label>
                  <input type="number" step="0.000001" id="input-${model.replace(
                    /[^a-zA-Z0-9]/g,
                    "_"
                  )}" 
                         value="${
                           pricing.input
                         }" style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 4px;">
                </div>
                <div style="flex: 1;">
                  <label style="display: block; margin-bottom: 5px; font-weight: bold;">Output Cost ($/1K tokens):</label>
                  <input type="number" step="0.000001" id="output-${model.replace(
                    /[^a-zA-Z0-9]/g,
                    "_"
                  )}" 
                         value="${
                           pricing.output
                         }" style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 4px;">
                </div>
              </div>
              <button class="update-model-pricing" data-model="${model}" 
                      style="padding: 6px 12px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ${isCustom ? "Update Custom Pricing" : "Set Custom Pricing"}
              </button>
              ${
                isCustom
                  ? `
                <button class="reset-model-pricing" data-model="${model}" 
                        style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 10px;">
                  Reset to Default
                </button>
              `
                  : ""
              }
            </div>
          `
        })

        modal.innerHTML = `
          <h3 style="margin-top: 0; color: #333;">💰 Update AI Pricing</h3>
          <p style="color: #666; line-height: 1.5;">
            Update pricing to match Mistral AI's current rates. Custom pricing will override default values.
          </p>
          
          <div style="max-height: 400px; overflow-y: auto; margin: 20px 0;">
            ${modelsHTML}
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 8px; font-size: 13px; color: #1976d2;">
            <strong>💡 Tip:</strong> Check <a href="https://mistral.ai/technology/#pricing" target="_blank" style="color: #1976d2;">Mistral AI's pricing page</a> for the latest rates.
          </div>
          
          <div style="display: flex; gap: 10px; margin-top: 25px;">
            <button id="close-pricing-editor" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
              Close
            </button>
          </div>
        `

        overlay.appendChild(modal)
        document.body.appendChild(overlay)

        // Add event listeners
        modal.addEventListener("click", async e => {
          if (e.target.classList.contains("update-model-pricing")) {
            const model = e.target.dataset.model
            const modelKey = model.replace(/[^a-zA-Z0-9]/g, "_")
            const inputCost = document.getElementById(`input-${modelKey}`).value
            const outputCost = document.getElementById(
              `output-${modelKey}`
            ).value

            if (
              await this.aiTutor.updateModelPricing(
                model,
                inputCost,
                outputCost
              )
            ) {
              e.target.textContent = "✅ Updated!"
              e.target.style.background = "#28a745"
              setTimeout(() => {
                e.target.textContent = "Update Custom Pricing"
                e.target.style.background = "#7198f8"
              }, 2000)
            } else {
              alert("❌ Error updating pricing. Please try again.")
            }
          } else if (e.target.classList.contains("reset-model-pricing")) {
            const model = e.target.dataset.model
            // Remove custom pricing for this model
            const customPricing = await GM.getValue("mistral_pricing", "{}")
            const pricing = JSON.parse(customPricing)
            delete pricing[model]
            await GM.setValue("mistral_pricing", JSON.stringify(pricing))

            // Reload the editor
            overlay.remove()
            this.showPricingEditor()
          }
        })

        document
          .getElementById("close-pricing-editor")
          .addEventListener("click", () => {
            overlay.remove()
          })

        // Close on overlay click
        overlay.addEventListener("click", e => {
          if (e.target === overlay) {
            overlay.remove()
          }
        })
      } catch (error) {
        console.error("Error showing pricing editor:", error)
        alert(`❌ Error opening pricing editor: ${error.message}`)
      }
    }

    async updateSettingsContent() {
      // Update API key status only (legacy method for non-modal usage)
      const apiKeyStatus = document.getElementById("api-key-status")
      if (apiKeyStatus) {
        const hasKey = this.aiTutor.hasApiKey()
        apiKeyStatus.innerHTML = hasKey
          ? `✅ Configured: ${this.aiTutor.apiKey.substring(0, 8)}...****`
          : "❌ Not configured"
      }

      // Update pricing status
      const pricingStatus = document.getElementById("pricing-status")
      if (pricingStatus) {
        try {
          const allPricing = await this.aiTutor.getAllPricing()
          const customCount = Object.keys(allPricing.custom).length
          const totalCount = Object.keys(allPricing.effective).length

          pricingStatus.innerHTML =
            customCount > 0
              ? `✅ ${customCount}/${totalCount} models have custom pricing`
              : `📋 Using default pricing for all ${totalCount} models`
        } catch (error) {
          pricingStatus.innerHTML = "❌ Error loading pricing status"
        }
      }

      // Update language selection
      const languageSelect = document.getElementById("ai-language-select")
      if (languageSelect) {
        const savedLanguage = await this.getLanguagePreference()
        languageSelect.value = savedLanguage
      }

      // Length preference is now handled by modal interface, no dropdown to update
    }

    // Helper methods for modal status updates
    updateApiKeyStatus(elementId) {
      const apiKeyStatus = document.getElementById(elementId)
      if (apiKeyStatus) {
        const hasKey = this.aiTutor.hasApiKey()
        apiKeyStatus.innerHTML = hasKey
          ? `✅ Configured: ${this.aiTutor.apiKey.substring(0, 8)}...****`
          : "❌ Not configured"
      }
    }

    async updatePricingStatus(elementId) {
      const pricingStatus = document.getElementById(elementId)
      if (pricingStatus) {
        try {
          const allPricing = await this.aiTutor.getAllPricing()
          const customCount = Object.keys(allPricing.custom).length
          const totalCount = Object.keys(allPricing.effective).length

          pricingStatus.innerHTML =
            customCount > 0
              ? `✅ ${customCount}/${totalCount} models have custom pricing`
              : `📋 Using default pricing for all ${totalCount} models`
        } catch (error) {
          pricingStatus.innerHTML = "❌ Error loading pricing status"
        }
      }
    }

    // Pricing management utility methods
    async resetPricingToDefaults() {
      // Reset all custom pricing to defaults
      try {
        await this.aiTutor.resetAllPricingToDefaults()
        localStorage.setItem(
          "raTutor_lastPricingUpdate",
          new Date().toLocaleString()
        )
      } catch (error) {
        throw new Error("Failed to reset pricing: " + error.message)
      }
    }

    async fetchLatestPricingFromMistral() {
      // Fetch latest pricing from Mistral API
      try {
        await this.aiTutor.fetchLatestPricing()
        localStorage.setItem(
          "raTutor_lastPricingUpdate",
          new Date().toLocaleString()
        )
      } catch (error) {
        throw new Error("Failed to fetch latest pricing: " + error.message)
      }
    }

    getPricingConfiguration() {
      // Get current pricing configuration status
      try {
        const customPricing = localStorage.getItem("raTutor_customPricing")
        return customPricing ? JSON.parse(customPricing) : null
      } catch (error) {
        return null
      }
    }

    getLastPricingUpdate() {
      // Get timestamp of last pricing update
      return localStorage.getItem("raTutor_lastPricingUpdate")
    }

    async loadActualPricingDetails() {
      // Load and display actual pricing details
      const container = document.getElementById("pricing-details-list")
      if (!container) return

      try {
        const allPricing = await this.aiTutor.getAllPricing()
        const models = Object.keys(allPricing.effective)

        container.innerHTML = models
          .map(model => {
            const pricing = allPricing.effective[model]
            const isCustom = allPricing.custom[model] !== undefined

            return `
            <div style="padding: 12px; background: rgba(42, 42, 42, 0.8); border-radius: 6px; border: 1px solid ${
              isCustom ? "#ff9800" : "#424242"
            };">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-weight: 500; color: #e8eaed;">${model}</div>
                ${
                  isCustom
                    ? '<div style="background: #ff9800; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">CUSTOM</div>'
                    : ""
                }
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #b0bec5;">
                <div>Input: $${pricing.input}/1K tokens</div>
                <div>Output: $${pricing.output}/1K tokens</div>
              </div>
            </div>
          `
          })
          .join("")
      } catch (error) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <div style="color: #f44336; font-size: 24px; margin-bottom: 12px;">❌</div>
            <div style="color: #b0bec5;">Failed to load pricing details</div>
            <div style="color: #888; font-size: 12px; margin-top: 8px;">${error.message}</div>
          </div>
        `
      }
    }

    openPricingManualEditor(modal) {
      // Open manual pricing editor interface
      const content = modal.querySelector("#pricing-management-content")
      if (content) {
        content.innerHTML = `
          <div style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <button data-action="back-to-pricing" style="background: none; border: none; color: #7198f8; cursor: pointer; padding: 4px 8px; margin-right: 12px;">
                ← Back
              </button>
              <h3 style="margin: 0; color: #e8eaed;">Manual Pricing Editor</h3>
            </div>
            
            <div style="padding: 12px; background: rgba(255, 152, 0, 0.1); border-radius: 6px; border: 1px solid #ff9800; margin-bottom: 20px;">
              <div style="font-size: 12px; color: #e8eaed; line-height: 1.5;">
                <strong>⚠️ Advanced Feature:</strong> Edit individual model pricing. Use with caution as incorrect values may affect cost calculations.
              </div>
            </div>
            
            <div id="pricing-editor-list" style="display: grid; gap: 12px;">
              <div style="text-align: center; padding: 40px;">
                <div style="color: #7198f8; font-size: 24px; margin-bottom: 12px;">⏳</div>
                <div style="color: #b0bec5;">Loading pricing editor...</div>
              </div>
            </div>
          </div>
        `

        // Load pricing editor interface
        setTimeout(() => {
          this.loadPricingEditor()
        }, 100)
      }
    }

    async loadPricingEditor() {
      // Load and display pricing editor interface
      const container = document.getElementById("pricing-editor-list")
      if (!container) return

      try {
        const allPricing = await this.aiTutor.getAllPricing()
        const models = Object.keys(allPricing.effective)

        container.innerHTML = models
          .map(model => {
            const pricing = allPricing.effective[model]
            const isCustom = allPricing.custom[model] !== undefined

            return `
            <div style="padding: 16px; background: rgba(42, 42, 42, 0.8); border-radius: 6px; border: 1px solid ${
              isCustom ? "#ff9800" : "#424242"
            };">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-weight: 500; color: #e8eaed;">${model}</div>
                ${
                  isCustom
                    ? '<div style="background: #ff9800; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">CUSTOM</div>'
                    : ""
                }
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; align-items: center;">
                <div>
                  <label style="display: block; font-size: 11px; color: #b0bec5; margin-bottom: 4px;">Input ($/1K tokens)</label>
                  <input type="number" 
                         value="${pricing.input}" 
                         step="0.000001" 
                         style="width: 100%; padding: 6px; background: #1a1a1a; border: 1px solid #424242; border-radius: 4px; color: #e8eaed; font-size: 12px;"
                         data-model="${model}" 
                         data-type="input">
                </div>
                <div>
                  <label style="display: block; font-size: 11px; color: #b0bec5; margin-bottom: 4px;">Output ($/1K tokens)</label>
                  <input type="number" 
                         value="${pricing.output}" 
                         step="0.000001" 
                         style="width: 100%; padding: 6px; background: #1a1a1a; border: 1px solid #424242; border-radius: 4px; color: #e8eaed; font-size: 12px;"
                         data-model="${model}" 
                         data-type="output">
                </div>
                <div style="display: flex; gap: 6px;">
                  <button onclick="raTutor.ui.savePricingEdit('${model}')" 
                          style="padding: 6px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; flex: 1;">
                    Save
                  </button>
                  ${
                    isCustom
                      ? `<button onclick="raTutor.ui.resetModelPricing('${model}')" 
                          style="padding: 6px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; flex: 1;">
                    Reset
                  </button>`
                      : ""
                  }
                </div>
              </div>
            </div>
          `
          })
          .join("")
      } catch (error) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <div style="color: #f44336; font-size: 24px; margin-bottom: 12px;">❌</div>
            <div style="color: #b0bec5;">Failed to load pricing editor</div>
            <div style="color: #888; font-size: 12px; margin-top: 8px;">${error.message}</div>
          </div>
        `
      }
    }

    async savePricingEdit(model) {
      // Save individual model pricing edit
      const inputField = document.querySelector(
        `input[data-model="${model}"][data-type="input"]`
      )
      const outputField = document.querySelector(
        `input[data-model="${model}"][data-type="output"]`
      )

      if (inputField && outputField) {
        try {
          const inputPrice = parseFloat(inputField.value)
          const outputPrice = parseFloat(outputField.value)

          if (
            isNaN(inputPrice) ||
            isNaN(outputPrice) ||
            inputPrice < 0 ||
            outputPrice < 0
          ) {
            this.showBriefNotification("❌ Invalid pricing values")
            return
          }

          await this.aiTutor.setCustomPricing(model, {
            input: inputPrice,
            output: outputPrice,
          })
          this.showBriefNotification(`✅ ${model} pricing updated`)

          // Refresh the editor to show updated status
          setTimeout(() => this.loadPricingEditor(), 100)
        } catch (error) {
          this.showBriefNotification(
            "❌ Failed to save pricing: " + error.message
          )
        }
      }
    }

    async resetModelPricing(model) {
      // Reset individual model pricing to default
      if (confirm(`Reset ${model} to default pricing?`)) {
        try {
          await this.aiTutor.resetModelPricing(model)
          this.showBriefNotification(`✅ ${model} reset to defaults`)

          // Refresh the editor to show updated status
          setTimeout(() => this.loadPricingEditor(), 100)
        } catch (error) {
          this.showBriefNotification(
            "❌ Failed to reset pricing: " + error.message
          )
        }
      }
    }

    // Update the length display in the summary interface
    async updateLengthDisplay(container) {
      const lengthDisplay = container.querySelector("#length-display")
      if (lengthDisplay) {
        const currentLength = await this.getLengthPreference()
        const lengthLabels = {
          short: "Short",
          medium: "Medium",
          long: "Long",
        }
        lengthDisplay.textContent = lengthLabels[currentLength] || "Medium"
      }
    }

    // Show modal for changing length preference
    showLengthPreferenceModal() {
      const overlay = document.createElement("div")
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      const modal = document.createElement("div")
      modal.style.cssText = `
        background: linear-gradient(145deg, #123262, #1a3a6b);
        padding: 25px;
        border-radius: 12px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        border: 1px solid #2c4a7c;
        color: #e8eaed;
      `

      modal.innerHTML = `
        <h3 style="margin-top: 0; color: #7198f8; display: flex; align-items: center; gap: 8px;">
          📏 Summary Length Preference
        </h3>
        <p style="color: #b0bec5; line-height: 1.5; margin-bottom: 20px;">
          Choose your preferred summary length. This setting will be used for all new summaries and when regenerating existing ones.
        </p>
        
        <div style="margin: 20px 0;">
          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; padding: 10px; background: #0f2142; border-radius: 6px; cursor: pointer; border: 2px solid transparent;" data-length="short">
              <input type="radio" name="length" value="short" style="margin-right: 10px;">
              <div>
                <div style="font-weight: bold; color: #7198f8;">📝 Short</div>
                <div style="font-size: 12px; color: #95a5a6;">Concise bullet points - Quick overview</div>
              </div>
            </label>
          </div>
          
          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; padding: 10px; background: #0f2142; border-radius: 6px; cursor: pointer; border: 2px solid transparent;" data-length="medium">
              <input type="radio" name="length" value="medium" style="margin-right: 10px;">
              <div>
                <div style="font-weight: bold; color: #7198f8;">📄 Medium</div>
                <div style="font-size: 12px; color: #95a5a6;">Detailed 5-7 points - Balanced learning</div>
              </div>
            </label>
          </div>
          
          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; padding: 10px; background: #0f2142; border-radius: 6px; cursor: pointer; border: 2px solid transparent;" data-length="long">
              <input type="radio" name="length" value="long" style="margin-right: 10px;">
              <div>
                <div style="font-weight: bold; color: #7198f8;">📚 Long</div>
                <div style="font-size: 12px; color: #95a5a6;">Comprehensive explanations - Deep dive</div>
              </div>
            </label>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 25px;">
          <button id="save-length-pref" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #7198f8, #5a84f0); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            💾 Save Preference
          </button>
          <button id="cancel-length-modal" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
        </div>
      `

      // Add the modal to the page
      overlay.appendChild(modal)
      document.body.appendChild(overlay)

      // Load current preference and set radio button
      this.getLengthPreference().then(currentLength => {
        const radio = modal.querySelector(`input[value="${currentLength}"]`)
        if (radio) {
          radio.checked = true
          radio.closest("label").style.border = "2px solid #7198f8"
        }
      })

      // Add event listeners for radio buttons
      const radioLabels = modal.querySelectorAll("label[data-length]")
      radioLabels.forEach(label => {
        label.addEventListener("click", () => {
          // Remove highlight from all labels
          radioLabels.forEach(l => (l.style.border = "2px solid transparent"))
          // Highlight selected label
          label.style.border = "2px solid #7198f8"
        })
      })

      // Save button functionality
      modal
        .querySelector("#save-length-pref")
        .addEventListener("click", async () => {
          const selectedRadio = modal.querySelector(
            'input[name="length"]:checked'
          )
          if (selectedRadio) {
            await this.saveLengthPreference(selectedRadio.value)

            // Update all length displays on the page
            const allLengthDisplays =
              document.querySelectorAll("#length-display")
            const lengthLabels = {
              short: "Short",
              medium: "Medium",
              long: "Long",
            }
            allLengthDisplays.forEach(display => {
              display.textContent =
                lengthLabels[selectedRadio.value] || "Medium"
            })

            // Close modal
            document.body.removeChild(overlay)

            // Show brief success feedback
            this.showBriefNotification(
              `📏 Length preference saved: ${lengthLabels[selectedRadio.value]}`
            )
          }
        })

      // Cancel button functionality
      modal
        .querySelector("#cancel-length-modal")
        .addEventListener("click", () => {
          document.body.removeChild(overlay)
        })

      // Close on overlay click
      overlay.addEventListener("click", e => {
        if (e.target === overlay) {
          document.body.removeChild(overlay)
        }
      })
    }

    // Show brief notification
    showBriefNotification(message) {
      const notification = document.createElement("div")
      notification.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        z-index: 10002;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        font-size: 13px;
        font-weight: bold;
        transition: all 0.3s ease;
        transform: translateX(100%);
      `
      notification.textContent = message
      document.body.appendChild(notification)

      // Animate in
      setTimeout(() => {
        notification.style.transform = "translateX(0)"
      }, 50)

      // Auto remove after 3 seconds
      setTimeout(() => {
        notification.style.transform = "translateX(100%)"
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }, 3000)
    }
  }

  // ========================================
  // 🚀 MAIN APPLICATION
  // ========================================
  class RadiologyAssistantTutor {
    constructor() {
      this.dataManager = new DataManager()
      this.aiTutor = new AITutor()
      this.ui = new UIManager(this.aiTutor, this.dataManager)
    }

    init() {
      console.log("🧠 Radiology Assistant Personal Tutor - Initializing...")
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.start())
      } else {
        this.start()
      }
    }

    async start() {
      try {
        //console.log("🧠 Starting Radiology Assistant Personal Tutor...")
        window.raTutor = this
        //console.log("🔒 Initializing AI Tutor...")
        await this.aiTutor.initialize()
        console.log(
          "🔒 AI Tutor initialization complete, API key status:",
          this.aiTutor.hasApiKey()
        )

        // Initialize UI after AITutor is ready
        this.ui.init()

        console.log("✅ Radiology Assistant Personal Tutor - Ready!")
      } catch (error) {
        console.error("❌ Error initializing tutor:", error)
      }
    }
  }

  // ========================================
  // 🎯 INITIALIZATION
  // ========================================
  const tutor = new RadiologyAssistantTutor()

  tutor.init()
})()
