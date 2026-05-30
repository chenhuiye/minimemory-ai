// content.js - Injected into the webpage, listens for shortcuts and text selections

let floatingUI = null;
let currentSelectionText = '';
let currentShortcutKey = 'x'; // Default

try {
  chrome.storage.local.get(['shortcutKey'], (res) => {
    if (res && res.shortcutKey) currentShortcutKey = res.shortcutKey;
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.shortcutKey) {
      currentShortcutKey = changes.shortcutKey.newValue;
    }
  });
} catch (e) {
  console.log('MiniMemory AI: Could not load initial shortcut config.');
}

// Listen for Alt+Key or Cmd+Key (Mac)
document.addEventListener('keydown', (e) => {
  if ((e.altKey && e.key.toLowerCase() === currentShortcutKey) || (e.metaKey && e.key.toLowerCase() === currentShortcutKey)) {
    e.preventDefault(); // Prevent default browser behavior
    
    currentSelectionText = window.getSelection().toString().trim();
    
    if (currentSelectionText) {
      try {
        // Just accessing chrome.runtime can throw if context is invalidated
        if (chrome.runtime && chrome.runtime.id) {
          showFloatingUI();
        }
      } catch (err) {
        if (err.message.includes('Extension context invalidated')) {
          alert('MiniMemory AI 插件已更新，请刷新当前网页 (F5) 即可继续使用！');
        } else {
          console.error(err);
        }
      }
    } else {
      console.log('MiniMemory AI: No text selected.');
    }
  }
});

function showFloatingUI() {
  if (floatingUI) {
    floatingUI.remove();
  }

  try {
    if (!chrome.runtime || !chrome.runtime.id) {
      alert('MiniMemory AI 插件已更新，当前页面连接已断开，请刷新页面 (F5)！');
      return;
    }
    
    chrome.storage.local.get(['language'], (res) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
    const lang = res.language || 'zh';
    const i18n = {
      zh: { user: '🙋 User 提示词', ai: '🤖 AI 回答', web: '🌐 网页内容' },
      en: { user: '🙋 User Prompt', ai: '🤖 AI Reply', web: '🌐 Web Content' }
    };

    // Get selection bounding rect to position UI nearby
    const selection = window.getSelection();
    let rect;
    if (selection.rangeCount > 0) {
      rect = selection.getRangeAt(0).getBoundingClientRect();
    } else {
      rect = { bottom: window.innerHeight / 2, left: window.innerWidth / 2 };
    }

    floatingUI = document.createElement('div');
    floatingUI.id = 'minimemory-floating-ui';
    
    // Attach Shadow DOM to prevent host page CSS conflicts
    const shadow = floatingUI.attachShadow({mode: 'closed'});
    
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: ${rect.bottom + window.scrollY + 10}px;
      left: ${rect.left + window.scrollX}px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 10px;
      z-index: 2147483647;
      display: flex;
      gap: 10px;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    const btnStyle = `
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    `;

    const btnUser = document.createElement('button');
    btnUser.innerText = i18n[lang].user;
    btnUser.style.cssText = btnStyle + `background: #f0f0f0; color: #333;`;
    btnUser.onmouseover = () => btnUser.style.background = '#e0e0e0';
    btnUser.onmouseout = () => btnUser.style.background = '#f0f0f0';
    
    const btnAI = document.createElement('button');
    btnAI.innerText = i18n[lang].ai;
    btnAI.style.cssText = btnStyle + `background: #e6f2ff; border: 1px solid #cce5ff; color: #0056b3;`;
    btnAI.onmouseover = () => btnAI.style.background = '#cce5ff';
    btnAI.onmouseout = () => btnAI.style.background = '#e6f2ff';

    const btnWeb = document.createElement('button');
    btnWeb.innerText = i18n[lang].web;
    btnWeb.style.cssText = btnStyle + `background: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32;`;
    btnWeb.onmouseover = () => btnWeb.style.background = '#c8e6c9';
    btnWeb.onmouseout = () => btnWeb.style.background = '#e8f5e9';

    const closeBtn = document.createElement('span');
    closeBtn.innerText = '✕';
    closeBtn.style.cssText = `
      cursor: pointer;
      font-size: 12px;
      color: #999;
      align-self: center;
      margin-left: 5px;
    `;
    closeBtn.onclick = hideFloatingUI;

    btnUser.onclick = () => saveMemory('[User]');
    btnAI.onclick = () => saveMemory('[AI]');
    btnWeb.onclick = () => saveMemory('[Web]');

    container.appendChild(btnUser);
    container.appendChild(btnAI);
    container.appendChild(btnWeb);
    container.appendChild(closeBtn);
    shadow.appendChild(container);
    
    document.body.appendChild(floatingUI);
    
    // Auto-hide when clicking outside
    document.addEventListener('mousedown', onClickOutside);
  });
  } catch (err) {
    console.log('MiniMemory AI extension context invalidated, requires page reload.', err);
  }
}

function hideFloatingUI() {
  if (floatingUI) {
    floatingUI.remove();
    floatingUI = null;
  }
  document.removeEventListener('mousedown', onClickOutside);
}

function onClickOutside(e) {
  if (floatingUI && !floatingUI.contains(e.target)) {
    hideFloatingUI();
  }
}

function saveMemory(tag) {
  chrome.runtime.sendMessage({
    action: 'saveMemory',
    text: currentSelectionText,
    tag: tag
  }, (response) => {
    if (response && response.success) {
      hideFloatingUI();
      // Optional: Show brief success toast
    }
  });
}

// Listen for messages from popup (e.g. inject text)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectText') {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable || activeEl.tagName === 'INPUT')) {
      // Basic injection, websites like ChatGPT might require more complex React event synthesis
      if (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT') {
        const originalText = activeEl.value;
        activeEl.value = request.text + '\n' + originalText;
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (activeEl.isContentEditable) {
        const originalText = activeEl.innerText;
        activeEl.innerText = request.text + '\n' + originalText;
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
      sendResponse({ success: true });
    } else {
      // Try to find common AI chat textareas if nothing is focused
      const promptArea = document.querySelector('textarea#prompt-textarea') || document.querySelector('textarea');
      if (promptArea) {
        const originalText = promptArea.value;
        promptArea.value = request.text + '\n' + originalText;
        promptArea.dispatchEvent(new Event('input', { bubbles: true }));
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No suitable input field found.' });
      }
    }
  }
});