// Chrome Extension Manifest V3 Background Service Worker

// Enable side panel open on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('SidePanel config error:', error));

// Message router between SidePanel, ContentScript and External APIs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'PING') {
    sendResponse({ status: 'PONG', time: Date.now() });
    return true;
  }

  // Capture visible tab screenshot for multimodal analysis
  if (message.action === 'CAPTURE_TAB') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, dataUrl });
      }
    });
    return true; // async response
  }

  // Forward message to active tab content script
  if (message.action === 'FORWARD_TO_CONTENT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0 || !tabs[0].id) {
        sendResponse({ success: false, error: '未找到活动的浏览器标签页' });
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, message.payload, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: `无法与当前页面通信: ${chrome.runtime.lastError.message}。请刷新目标页面后再试。`,
          });
        } else {
          sendResponse(response);
        }
      });
    });
    return true; // async response
  }

  // Query active tab info
  if (message.action === 'GET_TAB_INFO') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        sendResponse({
          success: true,
          tab: {
            id: tabs[0].id,
            url: tabs[0].url,
            title: tabs[0].title,
            favIconUrl: tabs[0].favIconUrl,
          },
        });
      } else {
        sendResponse({ success: false, error: '未检测到当前标签页' });
      }
    });
    return true;
  }
});
