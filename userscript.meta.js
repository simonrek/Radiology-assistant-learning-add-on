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