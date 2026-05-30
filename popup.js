document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const btnToggleSettings = document.getElementById('toggle-settings');
  const panelSettings = document.getElementById('settings-panel');
  const btnSaveSettings = document.getElementById('save-settings');

  const selLanguage = document.getElementById('sel-language');
  const inputShortcut = document.getElementById('shortcut-key');
  const inputEndpoint = document.getElementById('api-endpoint');
  const inputKey = document.getElementById('api-key');
  const inputModel = document.getElementById('api-model');

  const memoryList = document.getElementById('memory-list');

  const btnInject = document.getElementById('btn-inject');
  const btnExport = document.getElementById('btn-export');
  const btnClear = document.getElementById('btn-clear');
  const btnCompress = document.getElementById('btn-compress');
  const btnPrompt = document.getElementById('btn-prompt');
  const cbSelectAll = document.getElementById('cb-select-all');

  // State
  let memories = [];
  let apiKey = '';
  let currentLang = 'zh';

  // i18n Dictionary
  const i18n = {
    zh: {
      title: 'MiniMemory AI',
      settings: '⚙️ 设置',
      lblLang: '语言 (Language)',
      lblShortcut: '快捷键 (Alt / Cmd + ?)',
      lblEndpoint: 'API Endpoint (兼容 OpenAI 格式)',
      lblKey: 'API Key',
      lblModel: 'Model',
      saveConfig: '保存配置',
      saved: '已保存 ✓',
      inject: '⚡ 一键注入上下文',
      export: '📥 本地导出 (MD)',
      clear: '🗑️ 清空所有',
      btnCompress: '🗜️ 智能压缩 (需Key)',
      btnPrompt: '📝 生成Prompt (需Key)',
      emptyMemories: '暂无记忆。在网页划选文本并按设置的快捷键即可保存。',
      delete: '删除',
      confirmClear: '确定清空所有记忆吗？',
      errNoSelect: '请至少勾选一条记忆。',
      errInject: '注入失败，无法在该页面找到合适的输入框，或未注入 content script。',
      noExport: '没有可导出的记忆！',
      needKey: '请先在设置中配置 API Key',
      compressing: '压缩中...',
      generating: '生成中...',
      promptCopied: '提示词已生成并复制到剪贴板！',
      compressDone: '压缩成功！',
      selectAll: '全选',
      injectPrefix: '⚠️【重要上下文与事实指引】\n请严格基于以下事实进行推导，严禁凭空捏造：\n',
      userInputInfo: '用户输入：'
    },
    en: {
      title: 'MiniMemory AI',
      settings: '⚙️ Settings',
      lblLang: 'Language',
      lblShortcut: 'Shortcut (Alt / Cmd + ?)',
      lblEndpoint: 'API Endpoint (OpenAI Compatible)',
      lblKey: 'API Key',
      lblModel: 'Model',
      saveConfig: 'Save Config',
      saved: 'Saved ✓',
      inject: '⚡ Inject Context',
      export: '📥 Export (MD)',
      clear: '🗑️ Clear All',
      btnCompress: '🗜️ Compress (Key req)',
      btnPrompt: '📝 Generate Prompt',
      emptyMemories: 'No memories yet. Select text on a page and press the shortcut to save.',
      delete: 'Delete',
      confirmClear: 'Are you sure to clear all memories?',
      errNoSelect: 'Please select at least one memory.',
      errInject: 'Failed to inject. No suitable input field found.',
      noExport: 'No memories to export!',
      needKey: 'Please configure API Key in settings first',
      compressing: 'Compressing...',
      generating: 'Generating...',
      promptCopied: 'Prompt generated & copied to clipboard!',
      compressDone: 'Compression successful!',
      selectAll: 'Select All',
      injectPrefix: '⚠️ [Context & Factual Guidance]\nPlease strictly reason based on the following facts:\n',
      userInputInfo: 'User Input:'
    }
  };

  // Initialization
  loadSettings();
  loadMemories();

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.memories) {
      memories = changes.memories.newValue || [];
      renderMemories(memories);
    }
  });

  // Settings Toggle
  btnToggleSettings.addEventListener('click', () => {
    panelSettings.style.display = panelSettings.style.display === 'block' ? 'none' : 'block';
  });

  // Save Settings
  btnSaveSettings.addEventListener('click', () => {
    const config = {
      language: selLanguage.value,
      shortcutKey: (inputShortcut.value.trim() || 'x').toLowerCase(),
      apiEndpoint: inputEndpoint.value.trim() || 'https://api.openai.com/v1',
      apiKey: inputKey.value.trim(),
      apiModel: inputModel.value.trim() || 'gpt-3.5-turbo'
    };
    chrome.storage.local.set(config, () => {
      apiKey = config.apiKey;
      currentLang = config.language;
      updateUI();
      panelSettings.style.display = 'none';
      btnSaveSettings.innerText = i18n[currentLang].saved;
      setTimeout(() => btnSaveSettings.innerText = i18n[currentLang].saveConfig, 2000);
    });
  });

  // Select All logic
  cbSelectAll.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    document.querySelectorAll('.mem-checkbox').forEach(cb => cb.checked = isChecked);
  });

  function updateSelectAllState() {
    const all = document.querySelectorAll('.mem-checkbox');
    const checked = document.querySelectorAll('.mem-checkbox:checked');
    cbSelectAll.checked = (all.length > 0 && all.length === checked.length);
  }

  function loadSettings() {
    chrome.storage.local.get(['language', 'shortcutKey', 'apiEndpoint', 'apiKey', 'apiModel'], (res) => {
      currentLang = res.language || 'zh';
      selLanguage.value = currentLang;
      inputShortcut.value = res.shortcutKey || 'x';
      inputEndpoint.value = res.apiEndpoint || '';
      inputKey.value = res.apiKey || '';
      inputModel.value = res.apiModel || '';
      apiKey = res.apiKey || '';
      updateUI();
    });
  }

  function updateUI() {
    const lang = i18n[currentLang];
    document.getElementById('ui-title').innerText = lang.title;
    btnToggleSettings.innerText = lang.settings;
    document.getElementById('ui-lbl-lang').innerText = lang.lblLang;
    document.getElementById('ui-lbl-shortcut').innerText = lang.lblShortcut;
    document.getElementById('ui-lbl-endpoint').innerText = lang.lblEndpoint;
    document.getElementById('ui-lbl-key').innerText = lang.lblKey;
    document.getElementById('ui-lbl-model').innerText = lang.lblModel;
    btnSaveSettings.innerText = lang.saveConfig;
    btnInject.innerText = lang.inject;
    btnExport.innerText = lang.export;
    btnClear.innerText = lang.clear;
    btnCompress.innerText = lang.btnCompress;
    btnPrompt.innerText = lang.btnPrompt;
    document.getElementById('lbl-select-all').innerText = lang.selectAll;
    updateSmartButtons();
    renderMemories(memories);
  }

  function updateSmartButtons() {
    const hasKey = !!apiKey;
    btnCompress.disabled = !hasKey;
    btnPrompt.disabled = !hasKey;
  }

  function loadMemories() {
    chrome.storage.local.get(['memories'], (res) => {
      memories = res.memories || [];
      renderMemories(memories);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderMemories(memoriesList) {
    memoryList.innerHTML = '';
    const listHeader = document.getElementById('list-header');
    
    if (!memoriesList || memoriesList.length === 0) {
      memoryList.innerHTML = `<div class="empty-state">${i18n[currentLang].emptyMemories}</div>`;
      listHeader.style.display = 'none';
      return;
    }

    listHeader.style.display = 'flex';
    cbSelectAll.checked = true;

    const sorted = [...memoriesList].sort((a, b) => b.timestamp - a.timestamp);
    sorted.forEach((mem) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.innerHTML = `
        <div class="card-checkbox"><input type="checkbox" class="mem-checkbox" value="${mem.id}" checked></div>
        <div class="card-content">
          <span class="card-tag">${escapeHtml(mem.tag)}</span>
          <button class="delete-btn">✕</button>
          <div class="card-text">${escapeHtml(mem.text.substring(0, 150))}</div>
        </div>
      `;
      card.querySelector('.mem-checkbox').addEventListener('change', updateSelectAllState);
      card.querySelector('.delete-btn').onclick = () => deleteMemory(mem.id);
      memoryList.appendChild(card);
    });
  }

  function deleteMemory(id) {
    const newMemories = memories.filter(m => m.id !== id);
    chrome.storage.local.set({ memories: newMemories });
  }

  function getSelectedMemories() {
    const checkboxes = document.querySelectorAll('.mem-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);
    return memories.filter(m => selectedIds.includes(m.id)).sort((a, b) => a.timestamp - b.timestamp);
  }

  btnClear.addEventListener('click', () => {
    if (confirm(i18n[currentLang].confirmClear)) {
      chrome.storage.local.set({ memories: [] });
    }
  });

  // Action: Inject
  btnInject.addEventListener('click', () => {
    const selected = getSelectedMemories();
    if (selected.length === 0) return alert(i18n[currentLang].errNoSelect);

    let injectText = i18n[currentLang].injectPrefix;
    selected.forEach(m => {
      injectText += `- ${m.tag} ${m.text}\n`;
    });
    injectText += '---\n' + i18n[currentLang].userInputInfo;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'injectText',
          text: injectText
        }, (res) => {
          if (chrome.runtime.lastError || !res || !res.success) {
            alert(i18n[currentLang].errInject);
          } else {
            window.close(); // Close popup on success
          }
        });
      }
    });
  });

  // Action: Export MD
  btnExport.addEventListener('click', () => {
    if (memories.length === 0) return alert(i18n[currentLang].noExport);

    let mdContent = '# MiniMemory AI 导出记录 / Export Record\n\n';
    const sorted = [...memories].sort((a, b) => a.timestamp - b.timestamp);
    sorted.forEach(m => {
      const date = new Date(m.timestamp).toLocaleString();
      mdContent += `### ${m.tag} - ${date}\n${m.text}\n\n---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);


    const a = document.createElement('a');
    a.href = url;
    a.download = 'MiniMemory_Export.md';
    document.body.appendChild(a);
    a.click();


    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  });


  // Action: Compress (Smart Core Implementation)
  btnCompress.addEventListener('click', async () => {
    const selected = getSelectedMemories();
    if (selected.length === 0) return alert(i18n[currentLang].errNoSelect);
    
    if (!apiKey) {
      alert(i18n[currentLang].needKey);
      return;
    }

    const originalText = btnCompress.innerText;
    btnCompress.innerText = i18n[currentLang].compressing;
    btnCompress.disabled = true;

    const memoriesText = selected.map(m => `[${m.tag}] ${m.text}`).join('\n');
    const endpoint = inputEndpoint.value.trim() || 'https://api.openai.com/v1';
    const model = inputModel.value.trim() || 'gpt-3.5-turbo';

    const systemPrompt = currentLang === 'zh'
      ? "你是一个极简主义的信息压缩与提炼专家。你的任务是将用户提供的冗长、杂乱的内容提炼为高密度的核心摘要。\n要求：\n1. 大幅缩减字数（尽量缩减70%以上），进行高度概括。\n2. 剔除问候语、情绪表达、重复的解释和无效废话。综合考虑所有多方视角（如[User]和[AI]之间的交互上下文）进行连贯的逻辑总结。\n3. 精确保留用户的【核心意图】以及所有的【关键参数、客观事实、数据、代码逻辑和硬性约束】。绝对不要翻译原本的引用内容或代码，必须保留其原始语言（例如如果是英文邮件或代码，保持英文）。\n4. 不要改变原始内容的根本属性（如果原文是任务指令，压缩后依然是精简的指令；如果是背景知识，压缩后依然是知识库）。\n5. 只输出压缩后的最终文本，绝对不要包含任何“这是为您压缩的内容”之类的开场白。"
      : "You are a minimalist information compression expert. Your task is to distill the user's lengthy, scattered content into a high-density core summary.\nRules:\n1. Significantly reduce length (>70%) through concise summarization.\n2. Remove greetings, emotional expressions, repetitive explanations, and fluff. Synthesize multi-party perspectives (e.g., [User] and [AI] interactions) into a coherent summary.\n3. Accurately preserve the user's [Core Intent] and all [Key Parameters, Facts, Data, Code Logic, and Hard Constraints]. NEVER translate original quotes or code; strictly preserve their original language (e.g., keep an English email in English).\n4. Do not alter the fundamental nature of the original text (if it was an instruction, the output must remain a concise instruction; if it was background knowledge, it remains a knowledge base).\n5. Output ONLY the compressed text, with no introductory filler.";

    try {
      const response = await fetch(`${endpoint.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Please compress the following:\n\n${memoriesText}` }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const compressedText = data.choices?.[0]?.message?.content?.trim();

      if (compressedText) {
        // Save as a new memory card
        chrome.storage.local.get(['memories'], (res) => {
          const currentMemories = res.memories || [];
          const newMemory = {
            id: Date.now().toString(),
            text: compressedText,
            tag: '[Compressed]',
            timestamp: Date.now()
          };
          currentMemories.push(newMemory);
          chrome.storage.local.set({ memories: currentMemories }, () => {
            // Re-render handled by the onChanged listener
            alert(currentLang === 'zh' ? '压缩成功！已作为新记忆存入列表顶部。' : 'Compression successful! Saved as a new memory at the top.');
          });
        });
      } else {
        throw new Error('No compressed text generated from API.');
      }
    } catch (error) {
      console.error('API Error:', error);
      alert(`API Request Failed: ${error.message}`);
    } finally {
      btnCompress.innerText = originalText;
      btnCompress.disabled = false;
    }
  });

  // Action: Prompt Generation (Smart Core Stub -> Real Implementation)
  btnPrompt.addEventListener('click', async () => {
    const selected = getSelectedMemories();
    if (selected.length === 0) return alert(i18n[currentLang].errNoSelect);
    
    if (!apiKey) {
      alert(i18n[currentLang].needKey);
      return;
    }

    const originalText = btnPrompt.innerText;
    btnPrompt.innerText = i18n[currentLang].generating;
    btnPrompt.disabled = true;

    const memoriesText = selected.map(m => `[${m.tag}] ${m.text}`).join('\n');
    const endpoint = inputEndpoint.value.trim() || 'https://api.openai.com/v1';
    const model = inputModel.value.trim() || 'gpt-3.5-turbo';

    const systemPrompt = `You are Prompt Master, an expert at writing accurate, highly-efficient prompts for AI tools.
Your goal is to take the provided set of user facts and memories and construct a sharp, token-efficient System Prompt.
Rules based on the Prompt Master framework:
1. The best prompt is not the longest. It's the one where every word is load-bearing. Strip fluff and unnecessary padding from instructions.
2. Extract dimensions of intent (task, constraints, context) and structure them cleanly.
3. CRITICAL: NEVER truncate, summarize, or omit the actual content of the user's payloads, emails, code, or quotes (do not use "..."). They MUST be included IN FULL, because this generated prompt will be used in a brand new chat window that has no prior history.
4. Use safe techniques like role assignment, clear constraints, formatting locks, and few-shot examples if implied.
5. CRITICAL: You MUST retain the source labels (e.g., [User], [AI], [Web]) for the extracted facts in your generated prompt, so the target AI knows exactly where each piece of information came from.
6. Output ONLY the final generated prompt text. Do not add conversational filler, markdown formatting blocks around the whole text (like \`\`\` text), or explanations. Just the prompt.`;

    const languageRule = currentLang === 'zh'
      ? "\n6. IMPORTANT: The framing and instructions of your generated prompt MUST be in Simplified Chinese (简体中文). However, you MUST strictly preserve the original language of any quotes, code, or text payloads from the memories (e.g., if a memory is an English email, keep it in English)."
      : "\n6. IMPORTANT: The framing and instructions of your generated prompt MUST be in English. However, you MUST strictly preserve the original language of any quotes, code, or text payloads from the memories.";
    
    const finalSystemPrompt = systemPrompt + languageRule;

    try {
      const response = await fetch(`${endpoint.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: finalSystemPrompt },
            { role: 'user', content: `Here are the context memories to build the prompt from:\n\n${memoriesText}` }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedPrompt = data.choices?.[0]?.message?.content?.trim();

      if (generatedPrompt) {
        await navigator.clipboard.writeText(generatedPrompt);
        alert(i18n[currentLang].promptCopied.replace('(Feature in dev...)', '').replace('(生成功能开发中...)', ''));
      } else {
        throw new Error('No prompt generated from API.');
      }
    } catch (error) {
      console.error('API Error:', error);
      alert(`API Request Failed: ${error.message}`);
    } finally {
      btnPrompt.innerText = originalText;
      btnPrompt.disabled = false;
    }
  });

});
