// background.js - Service worker for background tasks
chrome.runtime.onInstalled.addListener(() => {
  console.log('MiniMemory AI installed');
  // Initialize storage if empty
  chrome.storage.local.get(['memories'], (result) => {
    if (!result.memories) {
      chrome.storage.local.set({ memories: [] });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveMemory') {
    chrome.storage.local.get(['memories'], (result) => {
      const memories = result.memories || [];
      const newMemory = {
        id: Date.now().toString(),
        text: request.text,
        tag: request.tag,
        timestamp: Date.now()
      };
      
      // TODO: Call API for Semantic Conflict Warning if Key exists
      
      memories.push(newMemory);
      chrome.storage.local.set({ memories }, () => {
        sendResponse({ success: true, memory: newMemory });
      });
    });
    return true; // Indicates asynchronous response
  }
});
