// background.js - 插件后台脚本

// 初始化默认设置
const defaultSettings = {
  mode: 'none', // none, dark, eye
  darkTheme: {
    backgroundColor: '#121212',
    textColor: '#e0e0e0',
    linkColor: '#8ab4f8',
    accentColor: '#bb86fc'
  },
  eyeTheme: {
    backgroundColor: '#f2f2e8',
    textColor: '#333333',
    linkColor: '#0066cc',
    accentColor: '#6699cc'
  }
};

// 当插件安装时初始化设置
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set(defaultSettings, () => {
      console.log('默认设置已初始化');
    });
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    // 获取当前设置并返回给内容脚本
    chrome.storage.sync.get(defaultSettings, (settings) => {
      sendResponse(settings);
    });
    return true; // 保持消息通道开放
  }
  
  if (request.action === 'updateSettings') {
    // 更新设置
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 监听标签页更新事件，确保页面加载完成后应用主题
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 向内容脚本发送消息，应用当前主题
    chrome.tabs.sendMessage(tabId, { action: 'applyTheme' });
  }
});