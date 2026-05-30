[English](README_en.md) | [简体中文](README.md)

# MiniMemory AI ⚡️

> Use human-verified "Golden Facts" to physically suppress AI hallucinations, providing a lightweight memory tool for instant correction, local storage, and on-the-go usage.

MiniMemory AI is a lightweight Chrome / Edge browser extension designed for heavy AI users (ChatGPT, Claude, Gemini, DeepSeek, Kimi, Qwen, Zhipu, Tencent Yuanbao, MiniMax, etc.). When you notice the AI starting to hallucinate or you lose the context focus in a multi-turn conversation, you can use it to **capture facts, smart compress, and one-click inject**, forcing the AI back on the right logical track.

## ✨ Core Features

- **⚡️ Quick Capture:** Highlight text on any webpage, press `Alt+X` (or `Cmd+X` on Mac) to instantly bring up the panel.
- **🏷️ Role Isolation:** Captured information can be tagged as `[User]`, `[AI]`, or `[Web]`, effectively preventing AI context pollution.
- **💉 Context Inject:** Select the needed memories and seamlessly inject them into the current page's AI chatbox with one click (accompanied by a strong constraint prompt).
- **🗜️ Smart Compress:** Integrates with LLM APIs to powerfully condense lengthy, fluffy chat histories into the most concise "Atomic Facts", significantly saving Tokens.
- **📝 Prompt Master:** Built-in top-tier prompt generation logic. It extracts your memory facts and abandons bloated templates, generating high-density prompts where every word is "Load-bearing".
- **🌐 Bilingual & Markdown Export:** Supports English and Chinese UI, dynamically preserves original languages during processing, and offers one-click Markdown export.
- **🔌 Flexible API Config:** Natively supports all OpenAI-compatible LLM APIs (e.g., DeepSeek, Groq, custom proxies, etc.).

---

## 🚀 Installation Guide

Since it is currently in the MVP development stage, you can install it locally via the "Unpacked Extension" mode:

1. **Download Source Code:**
   Clone or download this project as a ZIP and extract it to a permanent folder.
   ```bash
   git clone https://github.com/yourusername/minimemory-ai.git
   ```
2. **Open Extension Management:**
   Type `chrome://extensions/` in your Chrome address bar (or `edge://extensions/` for Edge).
3. **Enable Developer Mode:**
   Toggle the **"Developer mode"** switch in the top right corner of the page.
4. **Load Extension:**
   Click the **"Load unpacked"** button in the top left and select the `minimemory-ai` folder you just extracted.
5. **Pin to Toolbar (Recommended):**
   Click the "puzzle" icon in the top right corner of the browser and pin the MiniMemory AI lightning icon for easy access.

---

## 🛠️ Configuration & Usage

### Step 1: Basic Configuration (For Smart Features)
1. Click the extension icon to open the main panel.
2. Click **"⚙️ Settings"** in the top right corner.
3. Enter your **API Endpoint** (e.g., DeepSeek's `https://api.deepseek.com/v1`, or OpenAI's default address).
4. Enter your **API Key** and the **Model** you wish to use (e.g., `deepseek-v4-flash` or `gpt-4o`).
5. (Optional) If you don't like the default `x` shortcut, you can change it to another letter here.
6. Click **"Save Config"**.

### Step 2: Start Capturing Memories
1. On any webpage (e.g., a ChatGPT conversation page, or a technical documentation page).
2. **Select/Highlight** a piece of important fact, code, or an AI's incorrect response.
3. Press the shortcut `Alt + X` (`Cmd + X` or `Option + X` on Mac).
4. In the pop-up floating buttons, choose the source tag for this content (`🙋 User Prompt`, `🤖 AI Reply`, or `🌐 Web Content`).
5. Memory saved successfully!

### Step 3: Apply Memories
Open the extension panel, and you will see all your captured memory cards. You can:
- **Inject Context:** Check the boxes of the cards and click "⚡ Inject Context" to automatically paste them into the chatbox at the bottom of the current webpage.
- **Smart Compress:** Think the cards are too long? Select all of them and click "🗜️ Compress", and the LLM will distill them into pure knowledge points, reducing the length by 70%.
- **Generate Prompt:** Select the pure knowledge points and click "📝 Generate Prompt" to have the LLM tailor a professional system prompt with a rigorous logical structure for you.

---

## 🔒 Privacy & Security

- **Basic Features Run 100% Locally:** If you do not enter an API Key, the highlight capture, memory saving, panel display, injection, and export features remain fully functional. All data is stored locally in the browser's `chrome.storage.local` and **will absolutely never be uploaded to any third-party server**.
- **Transparent API Communication:** The "Smart Compress" and "Generate Prompt" features will ONLY send the cards you **actively select** to the API Endpoint you specified in the settings.

## 💡 Architecture
- **Vanilla Ecosystem**: Written in pure HTML + CSS + JavaScript, without bloated heavy frameworks.
- **Manifest V3**: Follows the latest Chrome extension standards, utilizing a Service Worker (`background.js`) as the underlying engine.
- Employs **Shadow DOM** technology to ensure the floating UI injected into webpages is immune to the host page's CSS pollution.

## 🤝 Contributions & Developer Help Wanted
This project is currently in the MVP stage. The one-click injection feature (`content.js`) is primarily adapted for ChatGPT and most standard web input fields.

**⚠️ Help Wanted:**
Limited by the complex synthetic events and state isolation of modern AI platform frontend frameworks (like React/Vue), our one-click injection might not work perfectly on certain specific platforms. We are eagerly looking for developers familiar with frontend engineering or Chrome extension development to join us and help with deep input field adaptations for the following platforms:
- [ ] Adapt to **Claude.ai**'s complex input field and cursor logic.
- [ ] Adapt to **DeepSeek Web**'s isolated input events.
- [ ] Adapt to **Google Gemini**'s rich text components.
- [ ] Explore a universal solution to dispatch events directly through React/Vue DOM node internal instances.

Feel free to submit an Issue or Pull Request! We look forward to your brilliant ideas and technical support.

## 📄 License
MIT License
