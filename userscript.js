/** @format */

// ==UserScript==
// @name         Radiology Assistant Personal Tutor
// @namespace    https://github.com/simonrek/radiology-assistant-personal-tutor
// @version      0.0.1
// @description  GDPR-compliant AI-powered personal tutor for enhanced learning on Radiology Assistant - track progress, get tested, and maximize learning efficiency with Mistral AI
// @author       Simon Rekanovic
// @homepage     https://github.com/simonrek/radiology-assistant-personal-tutor
// @supportURL   https://github.com/simonrek/radiology-assistant-personal-tutor/issues
// @updateURL    https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.meta.js
// @downloadURL  https://raw.githubusercontent.com/simonrek/radiology-assistant-personal-tutor/main/userscript.js
// @match        https://radiologyassistant.nl/*
// @exclude      https://radiologyassistant.nl/
// @exclude      https://radiologyassistant.nl/index*
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.addStyle
// @grant        GM.xmlHttpRequest
// @connect      api.mistral.ai
// @run-at       document-end
// @license      MIT
// ==/UserScript==

// ========================================
// 🔧 SAFARI USERSCRIPTS COMPATIBILITY LAYER
// ========================================
// Using native Safari Userscripts GM.* API (async)
console.log("🔧 Using Safari Userscripts GM.* API")
;(function () {
  "use strict"

  // ========================================
  // 🔧 USER CONFIGURABLE SETTINGS - MODIFY THESE AS NEEDED
  // ========================================

  // IMPORTANT: These settings can be safely modified by users
  // No personal data is collected or transmitted outside your browser

  const USER_CONFIG = {
    // ═══════════════════════════════════════
    // AI SETTINGS (GDPR Compliant - Mistral AI Only)
    // ═══════════════════════════════════════
    MISTRAL_API_KEY: "", // Add your Mistral API key here (stored locally only)
    AI_MODEL: "mistral-small-latest", // Mistral model to use

    // ═══════════════════════════════════════
    // USER INTERFACE SETTINGS
    // ═══════════════════════════════════════
    TUTOR_PANEL_OPEN_BY_DEFAULT: false, // Start with panel minimized

    // ═══════════════════════════════════════
    // DATA STORAGE SETTINGS (All Local - GDPR Compliant)
    // ═══════════════════════════════════════
    SAVE_PROGRESS_LOCALLY: true, // Save progress in browser storage
    USE_GM_STORAGE_ONLY: true, // Use only GM storage for consistency
    DATA_RETENTION_DAYS: 365, // How long to keep local data
  }

  // ========================================
  // 🔒 PRIVACY & GDPR COMPLIANCE NOTICE
  // ========================================
  // This userscript is designed to be fully GDPR compliant:
  // ✅ NO personal data collection
  // ✅ NO data transmission except to Mistral AI for quiz generation
  // ✅ ALL data stored locally in your browser only
  // ✅ NO tracking, cookies, or external analytics
  // ✅ You control all data - can be deleted anytime

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

  // ========================================
  // 🎨 STYLING
  // ========================================
  const CSS_STYLES = `
        /* Tutor Panel Styles - Content only, positioning handled by JS */
        #ra-tutor-panel {
            border-left: 1px solid #2c4a7c;
        }

        .tutor-header {
            background: linear-gradient(135deg, #7198f8 0%, #5577e6 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            position: sticky;
            top: 0;
            z-index: 1;
        }

        .tutor-content {
            padding: 20px;
            height: calc(100vh - 200px); /* Account for header, settings, and footer */
            overflow-y: auto;
            background: #123262;
            padding-bottom: 20px; /* Reduced since settings section provides buffer */
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
    `

  // ========================================
  // 💾 DATA MANAGEMENT
  // ========================================
  // ========================================
  // 💾 GDPR-COMPLIANT DATA MANAGEMENT
  // ========================================
  class DataManager {
    constructor() {
      this.storagePrefix = CONFIG.STORAGE_PREFIX

      // Simplified: Use only GM storage for consistency and reliability
      console.log(
        "🔒 GDPR: Initializing GM-only data storage (no external transmission)"
      )
    }

    // GDPR: Save data locally only (no external transmission)
    async saveData(key, data) {
      try {
        console.log(`🔒 GDPR: Saving data for key: ${key}`, data)

        if (!CONFIG.SAVE_PROGRESS_LOCALLY) {
          console.log("🔒 GDPR: Data saving disabled by user configuration")
          return
        }

        // Add privacy metadata - handle arrays properly
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
        console.log(`🔒 GDPR: Using GM.setValue for key: ${fullKey}`)
        await GM.setValue(fullKey, gdprData)

        console.log(`🔒 GDPR: Data saved locally for key: ${key}`)
      } catch (error) {
        console.error("🔒 GDPR: Error saving local data:", error)
      }
    }

    // GDPR: Load data from local storage only
    async loadData(key, defaultValue = null) {
      try {
        console.log(`🔒 GDPR: Loading data for key: ${key}`)

        // Always use GM storage for consistency
        const fullKey = this.storagePrefix + key
        console.log(`🔒 GDPR: Using GM.getValue for key: ${fullKey}`)
        const data = await GM.getValue(fullKey, null)
        console.log(`🔒 GDPR: GM.getValue result:`, data)

        console.log(`🔒 GDPR: Loaded data for key ${key}:`, data)

        if (data) {
          // Check data retention policy
          if (this.isDataExpired(data)) {
            console.log(`🔒 GDPR: Data expired for key ${key}, removing`)
            await this.deleteData(key)
            return defaultValue
          }

          // Remove privacy metadata before returning - handle arrays properly
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

            // Special case: If this looks like corrupted Q&A history (object with numeric keys), convert to array
            if (
              key.startsWith("qa_history_") &&
              typeof cleanData === "object" &&
              !Array.isArray(cleanData)
            ) {
              const numericKeys = Object.keys(cleanData).filter(k =>
                /^\d+$/.test(k)
              )
              if (numericKeys.length > 0) {
                console.log(
                  `🔧 GDPR: Converting corrupted Q&A history from object to array for key: ${key}`
                )
                const arrayData = []
                numericKeys
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .forEach(k => {
                    arrayData.push(cleanData[k])
                  })
                // Save the corrected data back
                setTimeout(() => this.saveData(key, arrayData), 100)
                return arrayData
              }
            }

            return cleanData
          }
        }

        console.log(
          `🔒 GDPR: No data found for key ${key}, returning default:`,
          defaultValue
        )
        return defaultValue
      } catch (error) {
        console.error("🔒 GDPR: Error loading local data:", error)

        // If data is corrupted, clear it and return default
        try {
          console.log(`🔒 GDPR: Clearing corrupted data for key: ${key}`)
          await this.deleteData(key)
        } catch (clearError) {
          console.warn("🔒 GDPR: Could not clear corrupted data:", clearError)
        }

        return defaultValue
      }
    }

    // GDPR: Delete local data
    async deleteData(key) {
      try {
        console.log(`🔒 GDPR: Deleting data for key: ${key}`)

        // Always use GM storage for consistency
        const fullKey = this.storagePrefix + key
        await GM.deleteValue(fullKey)

        console.log(`🔒 GDPR: Local data deleted for key: ${key}`)
      } catch (error) {
        console.error("🔒 GDPR: Error deleting local data:", error)
      }
    }

    // GDPR: Get all locally stored keys
    async getAllKeys() {
      try {
        console.log("🔧 getAllKeys: Getting all GM storage keys...")

        const allGMKeys = await GM.listValues()
        console.log("🔧 getAllKeys: All GM keys found:", allGMKeys)

        const filteredKeys = allGMKeys.filter(key =>
          key.startsWith(this.storagePrefix)
        )
        console.log("🔧 getAllKeys: Filtered keys with prefix:", filteredKeys)

        return filteredKeys
      } catch (error) {
        console.error("🔒 GDPR: Error getting local keys:", error)
        return []
      }
    }

    // GDPR: Clear all user data (right to erasure)
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

    // Debug method to log all current data
    async debugLogAllData() {
      console.log("🔍 === DEBUGGING ALL STORED DATA ===")

      try {
        console.log("🔍 Storage configuration:")
        console.log("  - Using GM storage only for consistency")
        console.log("  - storagePrefix:", this.storagePrefix)

        console.log("🔍 === GM Storage Debug ===")
        const gmKeys = await GM.listValues()
        console.log("🔍 All GM keys:", gmKeys)

        const filteredKeys = gmKeys.filter(key =>
          key.startsWith(this.storagePrefix)
        )
        console.log("🔍 Filtered GM keys (with prefix):", filteredKeys)

        if (filteredKeys.length > 0) {
          for (const key of filteredKeys) {
            try {
              const value = await GM.getValue(key)
              console.log(`🔍 GM data for key '${key}':`, value)
            } catch (error) {
              console.error(`🔍 Error loading GM key '${key}':`, error)
            }
          }
        } else {
          console.log("🔍 No GM keys found with prefix:", this.storagePrefix)
        }

        console.log("🔍 === END DATA DEBUG ===")
      } catch (error) {
        console.error("🔍 Error in debugLogAllData:", error)
      }
    }

    // GDPR: Check if data has expired according to retention policy
    isDataExpired(data) {
      if (!data._gdpr_stored || !CONFIG.DATA_RETENTION_DAYS) {
        return false
      }

      const expiryTime =
        data._gdpr_stored + CONFIG.DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000
      return Date.now() > expiryTime
    }
  }

  // Progress tracking removed. All analytics and logging now use DataManager directly (GM storage only).

  // ========================================
  // 🤖 AI TUTOR ENGINE
  // ========================================
  // ========================================
  // 🤖 MISTRAL AI TUTOR ENGINE (GDPR Compliant)
  // ========================================
  class AITutor {
    constructor() {
      this.apiKey = null
      this.model = CONFIG.MISTRAL_DEFAULT_MODEL
      this.baseURL = CONFIG.MISTRAL_BASE_URL
      this.currentContext = ""

      // GDPR: No personal data stored, only anonymous content analysis
      console.log(
        "🔒 GDPR Notice: AI Tutor initialized with local-only data processing"
      )
    }

    async initialize() {
      try {
        // Get API key from user configuration or local storage (GDPR compliant)
        this.apiKey =
          USER_CONFIG.MISTRAL_API_KEY ||
          (await GM.getValue("mistral_api_key", null))
        console.log(
          "🔒 GDPR: AI Tutor API key loaded:",
          this.hasApiKey() ? "✅ Available" : "❌ Not configured"
        )
      } catch (error) {
        console.warn("🔒 GDPR: Error loading API key:", error)
        this.apiKey = null
      }
    }

    hasApiKey() {
      return Boolean(this.apiKey && this.apiKey.trim())
    }

    extractPageContent() {
      // Extract main content from the page
      const contentSelectors = [
        "article",
        ".content",
        "#content",
        "main",
        ".article-content",
        ".post-content",
      ]

      let content = ""
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          content = element.innerText
          break
        }
      }

      // Fallback to body content if no specific container found
      if (!content) {
        const bodyClone = document.body.cloneNode(true)
        // Remove script and style tags
        bodyClone
          .querySelectorAll("script, style, nav, header, footer")
          .forEach(el => el.remove())
        content = bodyClone.innerText
      }

      // Clean and limit content
      content = content.replace(/\s+/g, " ").trim()
      return content.substring(0, 4000) // Limit for API calls
    }

    async generateQuizQuestion(content) {
      // GDPR: Only anonymous content analysis, no personal data transmitted
      if (!this.apiKey) {
        throw new Error(
          "API key required for quiz generation. Please configure your Mistral API key in the settings."
        )
      }

      try {
        console.log(
          "🔒 GDPR: Generating quiz via Mistral AI (anonymous content only)"
        )

        // Sanitize content to ensure no personal data
        const sanitizedContent = this.sanitizeContent(
          content.substring(0, 2000)
        )

        const prompt = `Based on this radiology educational content, create ONE multiple choice question that tests key understanding. Focus on practical clinical knowledge.

Educational Content: ${sanitizedContent}

Return ONLY a JSON object with this exact structure:
{
    "question": "Your question here",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct": 0,
    "explanation": "Why this is correct"
}`

        const response = await GM.xmlHttpRequest({
          method: "POST",
          url: `${this.baseURL}/chat/completions`,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: "system",
                content:
                  "You are an expert radiology educator. Create educational quiz questions based only on the provided content. Do not include any personal information in your responses.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        })

        // Track API call for transparency (GM storage only)
        await this.trackApiCallGM()

        const data = JSON.parse(response.responseText)
        const quizContent = data.choices[0].message.content

        // Parse and validate the response
        const quizData = JSON.parse(quizContent)

        // Ensure the quiz doesn't contain any personal data
        return this.validateQuizData(quizData)
      } catch (error) {
        console.error("Mistral AI Error:", error)
        throw new Error(
          "Failed to generate quiz. Please check your API key and try again."
        )
      }
    }

    // GDPR: Sanitize content to remove any potential personal information
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

    // GDPR: Validate quiz data contains no personal information
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

    // Unified API call method with tracking
    async callMistralAPI(prompt, model = null) {
      if (!this.apiKey) {
        throw new Error("API key required for Mistral AI calls")
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
            max_tokens: 1000,
            temperature: 0.7,
          }),
        })

        // Track API call for transparency (GM storage only)
        await this.trackApiCallGM()

        const data = JSON.parse(response.responseText)
        return {
          content: data.choices[0].message.content,
        }
      } catch (error) {
        console.error("🔒 GDPR: Mistral API call failed:", error)
        throw error
      }
    }

    async generateSummary(content, options = {}, forceBypassCache = false) {
      // Create page-specific cache key including URL and options
      const pageUrl = window.location.pathname
      const cacheKey = `summary_${pageUrl}_${this.getContentHash(
        content
      )}_${JSON.stringify(options)}`

      // Check cache first to avoid unnecessary API calls (unless bypassing cache)
      if (!forceBypassCache) {
        const cached = await this.getCachedResponse(cacheKey)
        if (cached) {
          console.log("🔒 GDPR: Using cached summary (no API call needed)", {
            pageUrl,
            options,
            cacheKey: cacheKey.substring(0, 50) + "...",
          })
          return cached
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
        console.log(
          "🔒 GDPR: Generating AI summary via Mistral (anonymous content only)",
          {
            pageUrl,
            options,
            contentLength: content.length,
          }
        )

        const length = options.length || "medium"
        const focus = options.focus || "key_learning_points"

        let prompt = this.buildSummaryPrompt(content, length, focus)

        const response = await this.callMistralAPI(prompt)

        if (response && response.content) {
          const summary = this.parseSummaryResponse(response.content)

          // Cache the response with page-specific key
          await this.cacheResponse(cacheKey, summary)

          console.log("🔒 GDPR: Summary generated and cached", {
            pageUrl,
            keyPoints: summary.keyPoints?.length || 0,
            cacheKey: cacheKey.substring(0, 50) + "...",
          })

          return summary
        } else {
          throw new Error("Invalid response from Mistral AI")
        }
      } catch (error) {
        console.error("🔒 GDPR: Error generating AI summary:", error)
        throw error
      }
    }

    buildSummaryPrompt(content, length, focus) {
      const lengthInstructions = {
        short: "Provide a concise 3-4 bullet point summary",
        medium: "Provide a comprehensive 5-7 bullet point summary",
        long: "Provide a detailed 8-10 bullet point summary with explanations",
      }

      const focusInstructions = {
        key_learning_points:
          "Focus on the most important learning points and key concepts that residents should understand",
        clinical_overview:
          "Provide a concise clinical recap focusing on practical diagnostic and management aspects",
        imaging_pearls:
          "Focus specifically on imaging findings, techniques, diagnostic pearls, and what radiologists should look for",
        imaging_differential:
          "Focus on imaging-based differential diagnoses, key distinguishing features, and diagnostic decision-making in radiology",
        clinical_pearls:
          "Focus on clinical pearls, practical tips, and diagnostic insights",
        pathology:
          "Focus on pathological findings, imaging features, and differential diagnoses",
        treatment:
          "Focus on treatment approaches, management strategies, and clinical decisions",
      }

      // Create dynamic prompt based on focus type
      let specificInstructions = ""
      let responseStructure = ""

      switch (focus) {
        case "imaging_pearls":
          specificInstructions = `
- Emphasize imaging modalities, protocols, and technical considerations
- Highlight specific imaging findings and their significance
- Include tips for image interpretation and common pitfalls
- Focus on what makes imaging findings distinctive or pathognomonic`
          responseStructure = `{
  "keyPoints": ["imaging finding 1", "technique 2", "interpretation tip 3", ...],
  "imagingPearls": ["pearl 1", "pearl 2", ...],
  "technicalTips": ["tip 1", "tip 2", ...],
  "readingTime": estimated_minutes,
  "difficulty": "Beginner|Intermediate|Advanced"
}`
          break

        case "imaging_differential":
          specificInstructions = `
- Focus on differential diagnoses based on imaging appearance
- Explain key distinguishing imaging features between conditions
- Include decision trees or diagnostic algorithms when applicable
- Emphasize imaging characteristics that help narrow the differential`
          responseStructure = `{
  "differentials": ["condition 1 with imaging features", "condition 2 with features", ...],
  "keyDistinguishers": ["feature 1", "feature 2", ...],
  "imagingApproach": ["step 1", "step 2", ...],
  "readingTime": estimated_minutes,
  "difficulty": "Beginner|Intermediate|Advanced"
}`
          break

        case "clinical_overview":
          specificInstructions = `
- Provide a practical, resident-focused clinical summary
- Include both diagnostic and management considerations
- Keep it concise but comprehensive for quick review
- Focus on actionable clinical information`
          responseStructure = `{
  "clinicalPoints": ["point 1", "point 2", ...],
  "diagnosticApproach": ["step 1", "step 2", ...],
  "keyTakeaways": ["takeaway 1", "takeaway 2", ...],
  "readingTime": estimated_minutes,
  "difficulty": "Beginner|Intermediate|Advanced"
}`
          break

        default:
          specificInstructions = `
- Include specific imaging findings, anatomical details, and clinical correlations when present
- Highlight differential diagnoses and key distinguishing features
- Balance theoretical knowledge with practical application`
          responseStructure = `{
  "keyPoints": ["point 1", "point 2", ...],
  "clinicalPearls": ["pearl 1", "pearl 2", ...],
  "differentials": ["diff 1", "diff 2", ...],
  "readingTime": estimated_minutes,
  "difficulty": "Beginner|Intermediate|Advanced",
  "focusAreas": ["area1", "area2", ...]
}`
      }

      return `You are a medical education expert specializing in radiology. 

TASK: Create a ${focus.replace(
        /_/g,
        " "
      )} summary of this radiology content for medical students and residents.

CONTENT: "${content.substring(0, 3000)}"

INSTRUCTIONS:
- ${lengthInstructions[length]}
- ${focusInstructions[focus] || focusInstructions.key_learning_points}
- Use clear, educational language appropriate for medical learners${specificInstructions}
- Format as structured bullet points for easy learning
- Vary your approach and content based on the specific focus requested

RESPONSE FORMAT:
Provide your response as a JSON object with this structure:
${responseStructure}`
    }

    parseSummaryResponse(content) {
      try {
        // Clean content: remove markdown code blocks and extra formatting
        let cleanContent = content.trim()

        // Remove markdown code block markers
        cleanContent = cleanContent.replace(/```json\s*/g, "")
        cleanContent = cleanContent.replace(/```\s*/g, "")

        // Remove bullet points that might interfere with JSON
        cleanContent = cleanContent.replace(/^[\s]*[•*-]\s*/gm, "")

        // Try to extract JSON if it's embedded in text
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cleanContent = jsonMatch[0]
        }

        console.log("🔍 Cleaned content for JSON parsing:", cleanContent)

        // Try to parse as JSON
        const parsed = JSON.parse(cleanContent)

        // Create a normalized response structure that handles all focus types
        const result = {
          keyPoints:
            parsed.keyPoints ||
            parsed.clinicalPoints ||
            parsed.imagingPearls ||
            [],
          clinicalPearls:
            parsed.clinicalPearls ||
            parsed.technicalTips ||
            parsed.keyTakeaways ||
            [],
          differentials: parsed.differentials || parsed.keyDistinguishers || [],
          imagingApproach: parsed.imagingApproach || [],
          diagnosticApproach: parsed.diagnosticApproach || [],
          readingTime: parsed.readingTime || Math.ceil(content.length / 200),
          difficulty: parsed.difficulty || "Intermediate",
          focusAreas: parsed.focusAreas || [],
        }

        return result
      } catch (e) {
        console.warn("🔍 JSON parsing failed, using fallback:", e)

        // Enhanced fallback: parse structured text response
        const lines = content.split("\n").filter(line => line.trim())

        const keyPoints = []
        const clinicalPearls = []
        const differentials = []

        let currentSection = "key"

        for (const line of lines) {
          const cleanLine = line
            .replace(/^[-•*]\s*/, "")
            .replace(/^"/, "")
            .replace(/",$/, "")
            .trim()

          if (
            cleanLine.toLowerCase().includes("clinical") ||
            cleanLine.toLowerCase().includes("pearl")
          ) {
            currentSection = "pearls"
            continue
          }
          if (
            cleanLine.toLowerCase().includes("differential") ||
            cleanLine.toLowerCase().includes("diagnos")
          ) {
            currentSection = "diff"
            continue
          }

          if (
            cleanLine &&
            !cleanLine.includes("{") &&
            !cleanLine.includes("}") &&
            cleanLine.length > 10
          ) {
            if (currentSection === "key") {
              keyPoints.push(cleanLine)
            } else if (currentSection === "pearls") {
              clinicalPearls.push(cleanLine)
            } else if (currentSection === "diff") {
              differentials.push(cleanLine)
            }
          }
        }

        return {
          keyPoints: keyPoints.slice(0, 6),
          clinicalPearls: clinicalPearls.slice(0, 4),
          differentials: differentials.slice(0, 4),
          readingTime: Math.ceil(content.length / 200),
          difficulty: this.assessDifficulty(content),
          focusAreas: ["general"],
        }
      }
    }

    async getCachedResponse(key) {
      try {
        const cached = await GM.getValue(`ai_cache_${key}`, null)
        if (cached) {
          const data = JSON.parse(cached)
          // Check if cache is less than 24 hours old
          if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
            return data.content
          }
        }
      } catch (e) {
        console.warn("Cache read error:", e)
      }
      return null
    }

    async cacheResponse(key, content) {
      try {
        const cacheData = {
          content,
          timestamp: Date.now(),
        }
        await GM.setValue(`ai_cache_${key}`, JSON.stringify(cacheData))
      } catch (e) {
        console.warn("Cache write error:", e)
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

    // Format markdown text for HTML display
    formatMarkdownToHTML(text) {
      let formatted = text
        // Convert **bold** to <strong>
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Convert *italic* to <em>
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Convert numbered lists with proper indentation
        .replace(
          /^\d+\.\s+(.*$)/gm,
          '<div style="margin: 6px 0; padding-left: 12px;">• $1</div>'
        )
        // Convert bullet points with proper spacing
        .replace(
          /^[-•*]\s+(.*$)/gm,
          '<div style="margin: 6px 0; padding-left: 12px;">• $1</div>'
        )
        // Convert section headers
        .replace(
          /^\*\*(.*?):\*\*/gm,
          '<div style="margin: 12px 0 6px 0; font-weight: bold; color: #7198f8;">$1:</div>'
        )
        // Convert paragraph breaks
        .replace(/\n\n/g, '<div style="margin: 12px 0;"></div>')
        // Convert single line breaks
        .replace(/\n/g, "<br>")

      return formatted
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

        console.log("🔍 ViewCacheContent: Looking for cache key:", fullCacheKey)

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
          // Format summary content beautifully
          formattedContent = `
            <div style="margin-bottom: 15px; padding: 10px; background: #0a1f3d; border-radius: 6px;">
              <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">📄 Page Analysis</div>
              <div style="color: #b0bec5; font-size: 12px;">
                <strong>Difficulty:</strong> ${content.difficulty || "N/A"}<br>
                <strong>Reading Time:</strong> ${
                  content.readingTime || "N/A"
                } min
              </div>
            </div>
          `

          if (content.keyPoints && content.keyPoints.length > 0) {
            formattedContent += `
              <div style="margin-bottom: 15px; padding: 10px; background: #0a1f3d; border-radius: 6px;">
                <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">🎯 Key Learning Points</div>
                ${content.keyPoints
                  .map(
                    point =>
                      `<div style="margin: 4px 0;">• ${this.formatMarkdownToHTML(
                        point
                      )}</div>`
                  )
                  .join("")}
              </div>
            `
          }

          if (content.clinicalPearls && content.clinicalPearls.length > 0) {
            formattedContent += `
              <div style="margin-bottom: 15px; padding: 10px; background: #0a1f3d; border-radius: 6px;">
                <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">💎 Clinical Pearls</div>
                ${content.clinicalPearls
                  .map(
                    pearl =>
                      `<div style="margin: 4px 0;">• ${this.formatMarkdownToHTML(
                        pearl
                      )}</div>`
                  )
                  .join("")}
              </div>
            `
          }

          if (content.differentials && content.differentials.length > 0) {
            formattedContent += `
              <div style="margin-bottom: 15px; padding: 10px; background: #0a1f3d; border-radius: 6px;">
                <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">🔍 Differentials</div>
                ${content.differentials
                  .map(
                    diff =>
                      `<div style="margin: 4px 0;">• ${this.formatMarkdownToHTML(
                        diff
                      )}</div>`
                  )
                  .join("")}
              </div>
            `
          }
        } else if (type === "Q&A") {
          // Handle both object format (legacy) and string format (new)
          if (typeof content === "string") {
            // String content - it's a formatted answer
            formattedContent = `
              <div style="margin-bottom: 15px; padding: 10px; background: #0f2142; border-radius: 6px;">
                <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">💡 Answer</div>
                <div style="color: #e8eaed; line-height: 1.5;">${content}</div>
              </div>
            `
          } else if (content && typeof content === "object") {
            // Object format with question and answer
            formattedContent = `
              <div style="margin-bottom: 15px; padding: 10px; background: #0a1f3d; border-radius: 6px;">
                <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">❓ Question</div>
                <div style="color: #e8eaed;">${this.formatMarkdownToHTML(
                  content.question || "No question found"
                )}</div>
              </div>
              <div style="margin-bottom: 15px; padding: 10px; background: #0f2142; border-radius: 6px;">
                <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">💡 Answer</div>
                <div style="color: #e8eaed; line-height: 1.5;">${this.formatMarkdownToHTML(
                  content.answer || "No answer found"
                )}</div>
              </div>
            `
          } else {
            formattedContent = `
              <div style="margin-bottom: 15px; padding: 10px; background: #0f2142; border-radius: 6px;">
                <div style="color: #7198f8; font-weight: bold; margin-bottom: 8px;">💡 Raw Content</div>
                <div style="color: #e8eaed; line-height: 1.5;">${JSON.stringify(
                  content,
                  null,
                  2
                )}</div>
              </div>
            `
          }
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

    async answerQuestion(question, content) {
      // Create page-specific cache key including URL
      const pageUrl = window.location.pathname
      const cacheKey = `qa_${pageUrl}_${this.getContentHash(
        content + question
      )}`

      // Check cache first
      const cached = await this.getCachedResponse(cacheKey)
      if (cached) {
        console.log("🔒 GDPR: Using cached Q&A (no API call needed)", {
          pageUrl,
        })
        return cached
      }

      if (!this.apiKey) {
        return "❌ AI-powered Q&A requires an API key. Please configure your Mistral API key in the settings."
      }

      try {
        console.log(
          "🔒 GDPR: Generating AI answer via Mistral (anonymous content only)"
        )

        const prompt = `You are a radiology education expert. Answer the following question based on the provided content.

CONTENT: "${content.substring(0, 3000)}"

QUESTION: "${question}"

INSTRUCTIONS:
- Provide a clear, educational answer based on the content
- If the question cannot be answered from the content, say so
- Use medical terminology appropriately for learning
- Keep the answer concise but informative
- Focus on radiology and medical education aspects

ANSWER:`

        const response = await this.callMistralAPI(prompt)

        if (response && response.content) {
          const rawAnswer = response.content.trim()
          // Format markdown to HTML
          const formattedAnswer = this.formatMarkdownToHTML(rawAnswer)

          // Cache the formatted response
          await this.cacheResponse(cacheKey, formattedAnswer)

          // Store Q&A history for this page
          await this.storeQAHistory(pageUrl, question, formattedAnswer)

          return formattedAnswer
        } else {
          throw new Error("Invalid response from Mistral AI")
        }
      } catch (error) {
        console.error("🔒 GDPR: Error generating AI answer:", error)
        return "❌ Error generating answer. Please try again or check your API key."
      }
    }

    assessDifficulty(content) {
      const complexTerms = [
        "pathophysiology",
        "differential diagnosis",
        "histopathology",
        "immunohistochemistry",
        "molecular",
        "genetics",
      ]

      const complexCount = complexTerms.filter(term =>
        content.toLowerCase().includes(term)
      ).length

      if (complexCount >= 3) return "Advanced"
      if (complexCount >= 1) return "Intermediate"
      return "Beginner"
    }

    // Store Q&A history for specific page (GM storage only)
    async storeQAHistory(pageUrl, question, answer) {
      try {
        const dataManager = window.raTutor ? window.raTutor.dataManager : null
        if (!dataManager) return

        const historyKey = `qa_history_${this.getContentHash(pageUrl)}`
        let history = await dataManager.loadData(historyKey, [])

        // Ensure history is an array
        if (!Array.isArray(history)) {
          history = []
        }

        // Add new Q&A entry
        history.unshift({
          question,
          answer,
          timestamp: Date.now(),
          pageUrl,
          pageTitle: document.title || "Unknown Page",
        })

        // Limit history to last 50 entries per page
        if (history.length > 50) {
          history = history.slice(0, 50)
        }

        await dataManager.saveData(historyKey, history)
        console.log(`🔒 GDPR: Q&A history stored for page: ${pageUrl}`)
      } catch (error) {
        console.error("Error storing Q&A history:", error)
      }
    }

    // Get Q&A history for specific page (GM storage only)
    async getQAHistory(pageUrl) {
      try {
        const dataManager = window.raTutor ? window.raTutor.dataManager : null
        if (!dataManager) return []

        const historyKey = `qa_history_${this.getContentHash(pageUrl)}`
        const history = await dataManager.loadData(historyKey, [])

        // Handle both array format and object format (numbered entries)
        if (Array.isArray(history)) {
          return history
        } else if (typeof history === "object" && history !== null) {
          // Convert numbered object entries to array
          const entries = Object.values(history)
          return entries.filter(
            entry => entry && entry.question && entry.answer
          )
        }

        return []
      } catch (error) {
        console.error("Error loading Q&A history:", error)
        return []
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
        if (typeof stats !== "object" || stats === null)
          stats = { apiCallsTotal: 0, lastApiCall: null }
        stats.apiCallsTotal = (stats.apiCallsTotal || 0) + 1
        stats.lastApiCall = Date.now()
        await dataManager.saveData(statsKey, stats)
        console.log(
          `🔒 GDPR: API call tracked (GM storage). Total: ${stats.apiCallsTotal}`
        )
      } catch (error) {
        console.error("Error tracking API call (GM storage):", error)
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
    }

    init() {
      this.injectStyles()
      this.createTutorPanel()
      // Removed: this.bindEvents() - no more progress tracking
      // Removed: this.startPeriodicUpdates() - no more background updates

      // Set initial toggle button state
      const toggleButton = document.getElementById("ra-tutor-toggle")
      if (toggleButton) {
        toggleButton.style.display = this.isMinimized ? "block" : "none"
      }

      // Initialize summary content
      setTimeout(() => {
        this.updateSummaryTab()
      }, 100)
    }

    injectStyles() {
      GM.addStyle(CSS_STYLES)
    }

    createTutorPanel() {
      const panel = document.createElement("div")
      panel.id = "ra-tutor-panel"

      // Use direct style assignment like the working example
      Object.assign(panel.style, {
        position: "fixed",
        top: "0",
        right: "0",
        width: "380px",
        height: "100vh",
        background: "linear-gradient(145deg, #123262, #1a3a6b)",
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
          ? "translateX(calc(100% - 50px))"
          : "translateX(0)",
      })

      panel.innerHTML = `
                <div class="tutor-header" data-action="toggle">
                    <span>🧠 AI Tutor</span>
                    <span style="font-size: 12px;">✖️</span>
                </div>
                <div class="tutor-content">
                    <div class="tab-buttons">
                        <button class="tab-button active" data-action="tab" data-tab="summary">Summary</button>
                        <button class="tab-button" data-action="tab" data-tab="quiz">Quiz</button>
                    </div>
                    
                    <div id="summary-tab" class="tutor-tab active">
                        <div id="summary-content">Loading summary...</div>
                    </div>
                    
                    <div id="quiz-tab" class="tutor-tab">
                        <div id="quiz-content">
                            <button data-action="generate-quiz" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #7198f8 0%, #5577e6 100%); color: white; border: none; border-radius: 8px; cursor: pointer;">
                                🧠 Test My Knowledge
                            </button>
                        </div>
                    </div>
                </div>
                
                
                <!-- Settings Section - Combined with Stats -->
                <div class="tutor-settings" style="position: absolute; bottom: 60px; left: 0; right: 0; padding: 12px 15px; background: #0f2544; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="color: #7198f8; font-size: 12px;">⚙️ Settings & Stats</strong>
                        <button id="toggle-settings" style="background: none; border: none; color: #7198f8; cursor: pointer; font-size: 14px;">▼</button>
                    </div>
                    <div id="settings-content" style="display: none;">
                        <!-- Stats Summary First -->
                        <div style="margin-bottom: 12px; padding: 8px; background: #1a3a6b; border-radius: 6px;">
                            <div style="color: #b0bec5; margin-bottom: 6px;"><strong>📊 Usage Stats</strong></div>
                            <div id="live-stats" style="color: #e8eaed; line-height: 1.4; font-size: 11px;">
                                Loading...
                            </div>
                        </div>
                        
                        <!-- API Key Management -->
                        <div style="margin-bottom: 12px; padding: 8px; background: #1a3a6b; border-radius: 6px;">
                            <div style="color: #b0bec5; margin-bottom: 6px;"><strong>🔑 API Key Status</strong></div>
                            <div id="api-key-status" style="color: #95a5a6; font-size: 10px; margin-bottom: 6px;">Loading...</div>
                            <div style="display: flex; gap: 6px;">
                                <button data-action="manage-api-key" style="padding: 4px 8px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                                    Manage Key
                                </button>
                                <button data-action="test-api-key" style="padding: 4px 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                                    Test Key
                                </button>
                            </div>
                        </div>
                        
                        <!-- Data Management -->
                        <div style="margin-bottom: 12px; padding: 8px; background: #1a3a6b; border-radius: 6px;">
                            <div style="color: #b0bec5; margin-bottom: 8px;"><strong>💾 Data Management</strong></div>
                            
                            <!-- View/Export Section -->
                            <div style="margin-bottom: 8px; padding: 6px; background: #123262; border-radius: 4px;">
                                <button data-action="view-data-overview" style="padding: 4px 8px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px; margin-right: 6px; margin-bottom: 4px;">
                                    📊 Review Data by Day
                                </button>
                                <button data-action="export-data" style="padding: 4px 8px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                                    📤 Export Data
                                </button>
                            </div>
                            
                            <!-- Danger Zone -->
                            <div style="padding: 6px; background: #2c1810; border-radius: 4px; border: 1px solid #8b4513;">
                                <div style="color: #ff6b6b; font-size: 10px; margin-bottom: 4px;"><strong>⚠️ Danger Zone</strong></div>
                                <button data-action="purge-data-keep-key" style="padding: 4px 8px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px; margin-right: 6px; margin-bottom: 4px;">
                                    🗑️ Purge Data (Keep API Key)
                                </button>
                                <button data-action="purge-all-data" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                                    💥 Purge Everything
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Attribution Footer - Fixed to bottom -->
                <div class="tutor-footer" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 15px; border-top: 1px solid #2c4a7c; background: #0f2142; font-size: 11px; color: #95a5a6; text-align: center; line-height: 1.4;">
                    Made with ❤️ for radiology by 
                    <a href="https://www.simonrekanovic.com" target="_blank" style="color: #7198f8; text-decoration: none;">simonrekanovic.com</a> • 
                    <a href="https://www.linkedin.com/in/simonrekanovic" target="_blank" style="color: #7198f8; text-decoration: none;">LinkedIn</a><br>
                    <span style="font-size: 10px; color: #7f8c8d;">v${
                      GM.info ? GM.info.script.version : "0.0.1"
                    }
                    <strong>CAUTION: AI may generate incorrect or misleading information. Always verify with reliable sources.</strong> </span>
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
      // Header toggle
      const header = panel.querySelector('[data-action="toggle"]')
      if (header) {
        header.addEventListener("click", () => this.togglePanel())
      }

      // Tab buttons
      const tabButtons = panel.querySelectorAll('[data-action="tab"]')
      tabButtons.forEach(button => {
        button.addEventListener("click", () => {
          const tab = button.getAttribute("data-tab")
          this.switchTab(tab)
        })
      })

      // Generate quiz button
      const generateQuizBtn = panel.querySelector(
        '[data-action="generate-quiz"]'
      )
      if (generateQuizBtn) {
        generateQuizBtn.addEventListener("click", () => this.generateQuiz())
      }

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
        } else if (e.target.dataset.action === "view-data-overview") {
          console.log("� View data overview clicked")
          this.showDataOverview()
        } else if (e.target.dataset.action === "export-data") {
          console.log("📤 Export data clicked")
          this.exportAllData()
        } else if (e.target.dataset.action === "purge-data-keep-key") {
          console.log("🗑️ Purge data (keep key) clicked")
          this.purgeDataKeepKey()
        } else if (e.target.dataset.action === "purge-all-data") {
          console.log("💥 Purge all data clicked")
          this.purgeAllData()
        }
      })

      // Settings panel toggle (now includes stats)
      const settingsHeader = panel.querySelector(".tutor-settings")
      if (settingsHeader) {
        const toggleSettings = settingsHeader.querySelector("#toggle-settings")
        if (toggleSettings) {
          toggleSettings.addEventListener("click", () => this.toggleSettings())
        }
      }

      // Initialize settings content (which now includes stats)
      this.updateSettingsContent()
    }

    updateProgressTab() {
      // REMOVED: All progress tracking functionality has been removed
      // This method is kept for compatibility but does nothing
    }

    async updateSummaryTab() {
      const content = document.getElementById("summary-content")
      if (!content) return

      // Check if AI features are available
      if (!this.aiTutor.hasApiKey()) {
        const pageContent = this.aiTutor.extractPageContent()
        const basicSummary = this.generateBasicSummary(pageContent)

        content.innerHTML = `
          <div class="progress-item">
            <strong>📄 Page Analysis</strong><br>
            <strong>Word Count:</strong> ${basicSummary.wordCount}<br>
            <strong>Est. Reading Time:</strong> ${basicSummary.readingTime} min<br>
          </div>
          <div class="progress-item">
            <strong>📊 Content Overview:</strong><br>
            ${basicSummary.overview}
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button data-action="setup-api" style="padding: 8px 16px; background: #7198f8; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
              🔧 Enable AI Analysis
            </button>
          </div>
          <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #2c4a7c;">
            <strong>⚙️ Settings</strong><br>
            <div style="font-size: 11px; color: #95a5a6; margin: 8px 0;">
              API Key: ❌ Not configured
            </div>
            <button data-action="setup-api" style="padding: 6px 12px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 8px; margin-right: 8px;">
              🔧 Setup API Key
            </button>
            <button data-action="clear-data" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 8px;">
              🗑️ Clear All Data
            </button>
          </div>
        `

        // Add event listener for setup button
        const setupBtn = content.querySelector('[data-action="setup-api"]')
        if (setupBtn) {
          setupBtn.addEventListener("click", () => this.showApiKeySetup())
        }
        return
      }

      content.innerHTML = "🔄 Analyzing page content..."

      try {
        const pageContent = this.aiTutor.extractPageContent()

        // Show initial summary options
        content.innerHTML = `
          <div class="progress-item">
            <strong>📄 AI Summary Options</strong><br>
            <div style="margin: 10px 0; display: flex; gap: 5px; flex-wrap: wrap;">
              <button class="summary-option" data-length="short" data-focus="key_learning_points" style="padding: 4px 8px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                📝 Main Points
              </button>
              <button class="summary-option" data-length="medium" data-focus="clinical_overview" style="padding: 4px 8px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                📚 Short Recap
              </button>
              <button class="summary-option" data-length="medium" data-focus="imaging_pearls" style="padding: 4px 8px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                💎 Imaging Pearls
              </button>
              <button class="summary-option" data-length="medium" data-focus="imaging_differential" style="padding: 4px 8px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                � Imaging Differential Key Points
              </button>
            </div>
          </div>
          <div id="summary-content">
            <div style="padding: 20px; text-align: center; color: #95a5a6;">
              Select a summary type above to generate AI-powered insights
            </div>
          </div>
        `

        // Add event listeners for summary options
        const summaryButtons = content.querySelectorAll(".summary-option")
        summaryButtons.forEach(button => {
          button.addEventListener("click", async () => {
            const length = button.dataset.length
            const focus = button.dataset.focus

            // Update button states
            summaryButtons.forEach(b => (b.style.background = "#7198f8"))
            button.style.background = "#28a745"

            const summaryContent = document.getElementById("summary-content")
            summaryContent.innerHTML = "🔄 Generating AI summary..."

            try {
              // Force fresh content for manual clicks (bypass cache)
              const summary = await this.aiTutor.generateSummary(
                pageContent,
                {
                  length,
                  focus,
                },
                true
              ) // true = forceBypassCache
              this.displaySummary(summary, summaryContent)
            } catch (error) {
              summaryContent.innerHTML = `<div style="color: #dc3545;">Error generating summary: ${error.message}</div>`
            }
          })
        })

        // Generate default summary
        const defaultSummary = await this.aiTutor.generateSummary(pageContent, {
          length: "medium",
          focus: "key_learning_points",
        })
        const summaryContentDiv = document.getElementById("summary-content")
        this.displaySummary(defaultSummary, summaryContentDiv)
      } catch (error) {
        content.innerHTML = "Error generating summary"
        console.error("Summary error:", error)
      }
    }

    displaySummary(summary, container) {
      // Show current summary timestamp at top in small font
      const currentTime = new Date()
        .toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(",", "")

      // Use same styling as Q&A answers for consistency
      let html = `
        <div style="margin-top: 10px; padding: 10px; background: #0f2142; border-radius: 4px; color: #e8eaed; line-height: 1.4;">
          <div style="margin-bottom: 8px; padding: 4px 8px; background: #0a1f3d; border-radius: 4px; font-size: 9px; color: #7f8c8d; text-align: center;">
            AI Summary generated: ${currentTime}
          </div>
          
          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #2c4a7c;">
            <strong style="color: #7198f8;">📄 Page Analysis</strong><br>
            <strong>Est. Reading Time:</strong> ${summary.readingTime} min
          </div>`

      if (summary.keyPoints && summary.keyPoints.length > 0) {
        const sectionTitle =
          summary.imagingApproach && summary.imagingApproach.length > 0
            ? "🔍 Imaging Findings:"
            : summary.diagnosticApproach &&
              summary.diagnosticApproach.length > 0
            ? "🎯 Clinical Points:"
            : "🎯 Key Learning Points:"

        html += `
          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #2c4a7c;">
            <strong style="color: #7198f8;">${sectionTitle}</strong><br>
            <div style="margin-top: 6px;">
              ${summary.keyPoints.map(point => `• ${point}`).join("<br>")}
            </div>
          </div>
        `
      }

      if (summary.clinicalPearls && summary.clinicalPearls.length > 0) {
        const sectionTitle =
          summary.imagingApproach && summary.imagingApproach.length > 0
            ? "💎 Technical Tips:"
            : "💎 Clinical Pearls:"

        html += `
          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #2c4a7c;">
            <strong style="color: #7198f8;">${sectionTitle}</strong><br>
            <div style="margin-top: 6px;">
              ${summary.clinicalPearls.map(pearl => `• ${pearl}`).join("<br>")}
            </div>
          </div>
        `
      }

      if (summary.differentials && summary.differentials.length > 0) {
        html += `
          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #2c4a7c;">
            <strong style="color: #7198f8;">🔍 Differential Diagnoses:</strong><br>
            <div style="margin-top: 6px;">
              ${summary.differentials.map(diff => `• ${diff}`).join("<br>")}
            </div>
          </div>
        `
      }

      // Show imaging approach if available
      if (summary.imagingApproach && summary.imagingApproach.length > 0) {
        html += `
          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #2c4a7c;">
            <strong style="color: #7198f8;">📋 Imaging Approach:</strong><br>
            <div style="margin-top: 6px;">
              ${summary.imagingApproach
                .map((step, index) => `${index + 1}. ${step}`)
                .join("<br>")}
            </div>
          </div>
        `
      }

      // Show diagnostic approach if available
      if (summary.diagnosticApproach && summary.diagnosticApproach.length > 0) {
        html += `
          <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #2c4a7c;">
            <strong style="color: #7198f8;">🩺 Diagnostic Approach:</strong><br>
            <div style="margin-top: 6px;">
              ${summary.diagnosticApproach
                .map((step, index) => `${index + 1}. ${step}`)
                .join("<br>")}
            </div>
          </div>
        `
      }

      // Add regeneration options
      html += `
        <div style="margin-bottom: 12px; padding-top: 12px; border-top: 1px solid #2c4a7c;">
          <strong style="color: #7198f8;">🔄 Generate Different Summary:</strong><br>
          <div style="margin: 10px 0; display: flex; gap: 5px; flex-wrap: wrap;">
            <button class="summary-regen" data-length="short" data-focus="key_learning_points" style="padding: 4px 8px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
              📝 Main Points
            </button>
            <button class="summary-regen" data-length="medium" data-focus="clinical_overview" style="padding: 4px 8px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
              � Short Recap
            </button>
            <button class="summary-regen" data-length="medium" data-focus="imaging_pearls" style="padding: 4px 8px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
              � Imaging Pearls
            </button>
            <button class="summary-regen" data-length="medium" data-focus="imaging_differential" style="padding: 4px 8px; background: #7198f8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
              🔍 Imaging Differential Key Points
            </button>
          </div>
        </div>
      `

      // Add Q&A section with history
      html += `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2c4a7c;">
          <strong style="color: #7198f8;">❓ Ask About This Content</strong><br>
          <div style="margin: 8px 0;">
            <input type="text" id="question-input" placeholder="Ask a question about this content..." 
                   style="width: 100%; padding: 8px; border: 1px solid #2c4a7c; border-radius: 4px; background: #1a3a6b; color: white; font-size: 12px;">
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <button id="ask-question" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
              🤔 Get Answer
            </button>
            <button id="show-qa-history" style="padding: 6px 12px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
              📜 View History
            </button>
          </div>
          <div id="qa-history-content" style="margin-top: 10px; display: none;"></div>
          <div id="answer-content" style="margin-top: 10px; padding: 10px; background: #0f2142; border-radius: 4px; display: none;"></div>
        </div>
      </div>
      `

      container.innerHTML = html

      // Add event listeners for regeneration buttons
      const regenButtons = container.querySelectorAll(".summary-regen")
      regenButtons.forEach(button => {
        button.addEventListener("click", async () => {
          const length = button.dataset.length
          const focus = button.dataset.focus

          // Update button states
          regenButtons.forEach(b => (b.style.background = "#7198f8"))
          button.style.background = "#28a745"

          container.innerHTML =
            "🔄 Regenerating summary with different focus..."

          try {
            const pageContent = this.aiTutor.extractPageContent()
            // Force bypass cache for regeneration to get fresh content
            const summary = await this.aiTutor.generateSummary(
              pageContent,
              {
                length,
                focus,
              },
              true
            ) // true = forceBypassCache
            this.displaySummary(summary, container)
          } catch (error) {
            container.innerHTML = `<div style="color: #dc3545;">Error regenerating summary: ${error.message}</div>`
          }
        })
      })

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
            const answer = await this.aiTutor.answerQuestion(
              question,
              pageContent
            )
            answerContent.innerHTML = `<strong>💡 Answer:</strong><br>${answer}`
            questionInput.value = "" // Clear input after successful answer

            // Refresh history button to show new entry exists
            if (showHistoryButton) {
              showHistoryButton.style.background = "#ffc107"
              showHistoryButton.textContent = "📜 New History!"

              // If history content is currently visible and showing "no questions" message, refresh it
              if (historyContent.style.display === "block") {
                const pageUrl = window.location.pathname
                const updatedHistory = await this.aiTutor.getQAHistory(pageUrl)
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
          } catch (error) {
            answerContent.innerHTML = `<div style="color: #dc3545;">Error: ${error.message}</div>`
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
                    ${entry.answer}
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
            showHistoryButton.textContent = "🔼 Hide History"
          } else {
            historyContent.style.display = "none"
            showHistoryButton.textContent = "📜 View History"
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
        content.innerHTML = "Error generating quiz"
        console.error("Quiz error:", error)
      }
    }

    answerQuiz(selectedIndex) {
      if (!this.currentQuiz) return

      const isCorrect = selectedIndex === this.currentQuiz.correct
      const content = document.getElementById("quiz-content")

      // Show feedback (no more progress tracking)
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

    generateBasicSummary(content) {
      if (!content) {
        return {
          wordCount: 0,
          readingTime: 0,

          overview: "No content detected on this page.",
        }
      }

      const words = content.trim().split(/\s+/).length
      const readingTime = Math.ceil(words / 100) // Average reading speed

      // Simple content analysis without AI
      let overview = "This page contains medical content"
      if (content.toLowerCase().includes("diagnosis"))
        overview += " about diagnosis"
      if (content.toLowerCase().includes("treatment"))
        overview += " and treatment"
      if (content.toLowerCase().includes("anatomy"))
        overview += " covering anatomy"
      if (content.toLowerCase().includes("imaging"))
        overview += " with imaging information"

      return {
        wordCount: words,
        readingTime: readingTime,
        paragraphs: paragraphs,
        overview: overview + ".",
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
          • GDPR compliant - no personal data collected
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
              overlay.remove()
              // Refresh current tab to show new features
              this.switchTab(this.currentTab)
              console.log("🔑 GDPR: API key saved securely in local storage")
              alert("✅ API key saved successfully!")
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

          console.log("🔒 GDPR: All user data cleared successfully")
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
    // ⚙️ COMBINED SETTINGS & STATS PANEL
    // ========================================

    // Combined toggle for settings panel (now includes stats)
    toggleSettings() {
      const settingsContent = document.getElementById("settings-content")
      const toggleButton = document.getElementById("toggle-settings")

      if (settingsContent.style.display === "none") {
        settingsContent.style.display = "block"
        toggleButton.textContent = "▲"
        // Update both settings and stats when opened
        this.updateSettingsContent()
      } else {
        settingsContent.style.display = "none"
        toggleButton.textContent = "▼"
      }
    }

    async updateSettingsContent() {
      // Update API key status only
      const apiKeyStatus = document.getElementById("api-key-status")
      if (apiKeyStatus) {
        const hasKey = this.aiTutor.hasApiKey()
        apiKeyStatus.innerHTML = hasKey
          ? `✅ Configured: ${this.aiTutor.apiKey.substring(0, 8)}...****`
          : "❌ Not configured"
      }

      // Update stats display - simplified
      const liveStats = document.getElementById("live-stats")
      if (liveStats) {
        liveStats.innerHTML = `
          📊 Extension loaded and ready<br>
          🤖 AI features: ${
            this.aiTutor.hasApiKey() ? "Available" : "Need API key"
          }<br>
          🕐 Status: Active
        `
      }
    }

    async showDataOverview() {
      try {
        // Get all data to calculate overview stats
        const allGMKeys = await GM.listValues()
        const appDataKeys = allGMKeys.filter(key =>
          key.startsWith("ra_tutor_gdpr_")
        )
        const aiCacheKeys = allGMKeys.filter(key => key.startsWith("ai_cache_"))

        // Calculate totals (simplified - derive pages from AI summaries)
        let totalQAEntries = 0
        let totalSummaries = 0
        let daysWithActivity = new Set()
        let uniquePagesWithSummaries = new Set()

        // Count Q&A entries by loading qa_history keys
        for (const key of appDataKeys) {
          if (key.includes("qa_history_")) {
            try {
              const cleanKey = key.replace("ra_tutor_gdpr_", "")
              const history = await this.dataManager.loadData(cleanKey, [])
              if (Array.isArray(history)) {
                totalQAEntries += history.length
                // Add dates from Q&A history
                history.forEach(entry => {
                  if (entry.timestamp) {
                    const date = new Date(entry.timestamp)
                      .toISOString()
                      .split("T")[0]
                    daysWithActivity.add(date)
                  }
                })
              }
            } catch (error) {
              console.warn("Error loading Q&A history:", error)
            }
          }
        }

        // Count summaries from AI cache and derive unique pages
        for (const key of aiCacheKeys) {
          if (key.startsWith("ai_cache_summary_")) {
            totalSummaries++

            // Extract page info from cache key to count unique pages
            const pageInfo = key.replace("ai_cache_summary_", "").split("_")[0]
            if (pageInfo && pageInfo !== "undefined") {
              uniquePagesWithSummaries.add(pageInfo)
            }

            // Add dates from cache timestamps
            try {
              const cached = await GM.getValue(key, null)
              if (cached) {
                const parsedCache = JSON.parse(cached)
                if (parsedCache.timestamp) {
                  const date = new Date(parsedCache.timestamp)
                    .toISOString()
                    .split("T")[0]
                  daysWithActivity.add(date)
                }
              }
            } catch (error) {
              console.warn("Error parsing cache timestamp:", error)
            }
          }
        }

        // Create day-by-day activity data
        const activityByDate = await this.getActivityByDate()

        this.showDataModal(
          "📊 Learning Activity Overview",
          `
          <div style="background: #1a3a6b; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <strong>📈 Your Learning Journey:</strong><br>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
              <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; color: #7198f8; font-weight: bold;">${daysWithActivity.size}</div>
                <div style="font-size: 11px; color: #b0bec5;">Active Days</div>
              </div>
              <div style="background: #123262; padding: 10px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; color: #7198f8; font-weight: bold;">${uniquePagesWithSummaries.size}</div>
                <div style="font-size: 11px; color: #b0bec5;">Pages Summarized</div>
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
          
          <div style="margin: 15px 0;">
            <strong style="color: #7198f8;">📅 Activity by Day:</strong>
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
      const activityMap = new Map()

      try {
        // Get Q&A history by date
        const allGMKeys = await GM.listValues()
        const appDataKeys = allGMKeys.filter(
          key => key.startsWith("ra_tutor_gdpr_") && key.includes("qa_history_")
        )

        for (const key of appDataKeys) {
          try {
            const cleanKey = key.replace("ra_tutor_gdpr_", "")
            console.log("🔍 Loading Q&A history for activity:", cleanKey)
            const history = await this.dataManager.loadData(cleanKey, [])
            console.log("🔍 Q&A history for activity:", history)

            if (Array.isArray(history)) {
              history.forEach(entry => {
                if (entry.timestamp && entry.question && entry.answer) {
                  const date = new Date(entry.timestamp)
                    .toISOString()
                    .split("T")[0]
                  console.log(
                    "🔍 Adding Q&A entry for date:",
                    date,
                    entry.question
                  )
                  if (!activityMap.has(date)) {
                    activityMap.set(date, {
                      questions: [],
                      summaries: [],
                    })
                  }
                  activityMap.get(date).questions.push({
                    question: entry.question,
                    answer: entry.answer,
                    time: new Date(entry.timestamp).toLocaleString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                    page: entry.pageTitle || "Unknown Page",
                  })
                }
              })
            }
          } catch (error) {
            console.warn("Error loading Q&A for date grouping:", error)
          }
        }

        // Get summaries by date from AI cache
        const aiCacheKeys = allGMKeys.filter(key =>
          key.startsWith("ai_cache_summary_")
        )
        for (const key of aiCacheKeys) {
          try {
            const cached = await GM.getValue(key, null)
            if (cached) {
              const parsedCache = JSON.parse(cached)
              if (parsedCache.timestamp && parsedCache.content) {
                const date = new Date(parsedCache.timestamp)
                  .toISOString()
                  .split("T")[0]
                if (!activityMap.has(date)) {
                  activityMap.set(date, {
                    questions: [],
                    summaries: [],
                  })
                }

                // Extract page info from cache key
                const pageInfo =
                  key.replace("ai_cache_summary_", "").split("_")[0] ||
                  "Unknown Page"

                activityMap.get(date).summaries.push({
                  content: parsedCache.content,
                  time: new Date(parsedCache.timestamp).toLocaleString(
                    "en-GB",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }
                  ),
                  page: pageInfo,
                  keyPoints: parsedCache.content.keyPoints?.length || 0,
                })
              }
            }
          } catch (error) {
            console.warn("Error loading summary for date grouping:", error)
          }
        }

        // Sort dates descending (newest first)
        const sortedDates = Array.from(activityMap.keys()).sort((a, b) =>
          b.localeCompare(a)
        )

        if (sortedDates.length === 0) {
          return `
            <div style="padding: 20px; text-align: center; color: #b0bec5;">
              📅 No learning activity recorded yet.<br>
              <span style="font-size: 11px;">Start by reading pages and asking questions!</span>
            </div>
          `
        }

        let html = ""
        sortedDates.forEach(date => {
          const activity = activityMap.get(date)
          const formattedDate = new Date(date).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })

          html += `
            <div style="margin-bottom: 12px; border: 1px solid #2c4a7c; border-radius: 6px; overflow: hidden;">
              <div style="background: #1a3a6b; padding: 8px; font-weight: bold; color: #7198f8;">
                📅 ${formattedDate}
                <span style="font-size: 11px; color: #b0bec5; margin-left: 10px;">
                  ${activity.questions.length} Q&A • ${activity.summaries.length} summaries
                </span>
              </div>
              <div style="padding: 10px; background: #0f2142;">
          `

          // Show Q&A for this date
          if (activity.questions.length > 0) {
            html += `<div style="margin-bottom: 8px;"><strong style="color: #28a745;">❓ Questions & Answers (${activity.questions.length}):</strong></div>`
            activity.questions.forEach((qa, index) => {
              const qaId = `qa-${date}-${index}`
              const isLongAnswer = qa.answer.length > 200
              const shortAnswer = qa.answer.substring(0, 200)

              html += `
                <div style="margin-bottom: 10px; padding: 10px; background: #123262; border-radius: 6px; border-left: 4px solid #28a745;">
                  <div style="font-size: 11px; color: #7198f8; margin-bottom: 6px;">
                    🕐 ${qa.time} • 📄 ${qa.page}
                  </div>
                  <div style="font-weight: bold; color: #7198f8; margin-bottom: 6px; font-size: 13px;">
                    ❓ ${qa.question}
                  </div>
                  <div style="color: #e8eaed; font-size: 12px; line-height: 1.4; margin-bottom: 6px;">
                    <strong>💡 Answer:</strong><br>
                    <span id="${qaId}-short">${shortAnswer}${
                isLongAnswer ? "..." : ""
              }</span>
                    ${
                      isLongAnswer
                        ? `
                      <span id="${qaId}-full" style="display: none;">${qa.answer}</span>
                      <button onclick="
                        const short = document.getElementById('${qaId}-short');
                        const full = document.getElementById('${qaId}-full');
                        const btn = this;
                        if (full.style.display === 'none') {
                          short.style.display = 'none';
                          full.style.display = 'inline';
                          btn.textContent = '🔼 Show Less';
                        } else {
                          short.style.display = 'inline';
                          full.style.display = 'none';
                          btn.textContent = '🔽 Show Full Answer';
                        }
                      " style="background: #17a2b8; color: white; border: none; border-radius: 3px; padding: 2px 6px; font-size: 10px; cursor: pointer; margin-left: 8px;">
                        🔽 Show Full Answer
                      </button>
                    `
                        : ""
                    }
                  </div>
                </div>
              `
            })
          }

          // Show summaries for this date
          if (activity.summaries.length > 0) {
            html += `<div style="margin-bottom: 8px; margin-top: 12px;"><strong style="color: #ffc107;">📄 AI Summaries (${activity.summaries.length}):</strong></div>`
            activity.summaries.forEach((summary, index) => {
              const summaryId = `summary-${date}-${index}`
              const content = summary.content

              html += `
                <div style="margin-bottom: 10px; padding: 10px; background: #123262; border-radius: 6px; border-left: 4px solid #ffc107;">
                  <div style="font-size: 11px; color: #7198f8; margin-bottom: 6px;">
                    🕐 ${summary.time} • 📄 ${summary.page}
                  </div>
                  <div style="font-weight: bold; color: #ffc107; margin-bottom: 6px; font-size: 13px;">
                    📄 AI Summary
                  </div>
                  <div id="${summaryId}-preview" style="color: #b0bec5; font-size: 11px; margin-bottom: 6px;">
                    Generated AI summary with ${
                      summary.keyPoints
                    } key learning points
                    <button onclick="
                      const preview = document.getElementById('${summaryId}-preview');
                      const full = document.getElementById('${summaryId}-full');
                      const btn = this;
                      if (full.style.display === 'none') {
                        preview.style.display = 'none';
                        full.style.display = 'block';
                        btn.textContent = '🔼 Hide Summary';
                      } else {
                        preview.style.display = 'block';
                        full.style.display = 'none';
                        btn.textContent = '📖 View Full Summary';
                      }
                    " style="background: #ffc107; color: black; border: none; border-radius: 3px; padding: 2px 6px; font-size: 10px; cursor: pointer; margin-left: 8px;">
                      📖 View Full Summary
                    </button>
                  </div>
                  <div id="${summaryId}-full" style="display: none; color: #e8eaed; font-size: 12px; line-height: 1.4;">
                    ${this.formatSummaryContent(content)}
                  </div>
                </div>
              `
            })
          }

          html += `</div></div>`
        })

        return html
      } catch (error) {
        console.error("Error generating activity by date:", error)
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

    async testApiKey() {
      if (!this.aiTutor.hasApiKey()) {
        alert("❌ No API key configured. Please set up your API key first.")
        return
      }

      try {
        const testResponse = await this.aiTutor.callMistralAPI(
          'Test message - please respond with "OK"',
          "mistral-small-latest"
        )
        if (testResponse && testResponse.content) {
          alert("✅ API key is working correctly!")
        } else {
          alert("⚠️ API key test returned unexpected response.")
        }
      } catch (error) {
        alert(`❌ API key test failed: ${error.message}`)
      }
    }

    async showAllDataViewer() {
      console.log("🔍 showAllDataViewer called")
      try {
        console.log("🔍 Getting ALL GM keys (including AI cache)...")

        // Get ALL GM keys, not just prefixed ones
        const allGMKeys = await GM.listValues()
        console.log("🔍 All GM keys found:", allGMKeys)

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

        console.log("🔍 Categorized keys:", {
          appData: appDataKeys.length,
          aiCache: aiCacheKeys.length,
          apiKey: apiKeyKeys.length,
          other: otherKeys.length,
        })

        // Count Q&A history entries
        const qaHistoryKeys = appDataKeys.filter(key =>
          key.includes("qa_history_")
        )
        console.log("🔍 Q&A History keys found:", qaHistoryKeys.length)

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
          console.log("🔍 Loading app data for key:", cleanKey)
          const data = await this.dataManager.loadData(cleanKey, {})
          dataPreview[`APP_DATA_${cleanKey}`] = data
        }

        // Load AI cache data
        for (const key of aiCacheKeys) {
          console.log("🔍 Loading AI cache for key:", key)
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
          console.log("🔍 Loading other data for key:", key)
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

    async exportAllData() {
      console.log("📤 exportAllData called")
      try {
        // Debug: Log all current data
        await this.dataManager.debugLogAllData()

        const allKeys = await this.dataManager.getAllKeys()
        const exportData = {
          exportDate: new Date().toISOString(),
          scriptVersion: GM.info ? GM.info.script.version : "0.0.1",
          data: {},
        }

        for (const key of allKeys) {
          const cleanKey = key.replace("ra_tutor_", "")
          const data = await this.dataManager.loadData(cleanKey, {})
          exportData.data[cleanKey] = data
        }

        // Include API key status (but not the actual key for security)
        exportData.apiKeyConfigured = this.aiTutor.hasApiKey()

        const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement("a")
        link.href = url
        link.download = `radiology-assistant-tutor-data-${
          new Date().toISOString().split("T")[0]
        }.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        alert("✅ Data exported successfully!")
      } catch (error) {
        console.error("📤 Error in exportAllData:", error)
        alert(`❌ Error exporting data: ${error.message}`)
      }
    }

    async purgeDataKeepKey() {
      console.log("🗑️ purgeDataKeepKey called")
      if (
        confirm(
          "⚠️ This will delete all progress data but keep your API key. Continue?"
        )
      ) {
        try {
          // Clear all data except API key
          const allKeys = await this.dataManager.getAllKeys()
          for (const key of allKeys) {
            const cleanKey = key.replace("ra_tutor_", "")
            if (cleanKey !== "mistral_api_key") {
              await this.dataManager.deleteData(cleanKey)
            }
          }

          console.log("🔒 GDPR: Progress data purged, API key preserved")
          alert("✅ Progress data cleared. API key preserved.")
          this.switchTab(this.currentTab)
          this.updateSettingsContent()
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
        await this.clearAllData()
        this.updateSettingsContent()
        alert("💥 Everything has been permanently deleted.")
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
        console.log("🧠 Starting Radiology Assistant Personal Tutor...")
        window.raTutor = this
        console.log("🔒 GDPR: Initializing AI Tutor...")
        await this.aiTutor.initialize()
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
