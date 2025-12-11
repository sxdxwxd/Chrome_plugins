// popup.js - 弹出窗口交互脚本

// 全局变量
let currentSettings = null;

// DOM元素
let modeRadios = null;
let darkColorSettings = null;
let eyeColorSettings = null;
let saveBtn = null;
let resetBtn = null;

// 初始化
function init() {
  // 获取DOM元素
  modeRadios = document.querySelectorAll('input[name="mode"]');
  darkColorSettings = document.getElementById('dark-color-settings');
  eyeColorSettings = document.getElementById('eye-color-settings');
  saveBtn = document.getElementById('save-btn');
  resetBtn = document.getElementById('reset-btn');

  // 加载当前设置
  loadSettings();

  // 添加事件监听器
  modeRadios.forEach(radio => {
    radio.addEventListener('change', onModeChange);
  });

  // 添加颜色选择器事件监听器
  addColorPickerListeners();

  // 添加按钮事件监听器
  saveBtn.addEventListener('click', saveSettings);
  resetBtn.addEventListener('click', resetSettings);
}

// 加载设置
function loadSettings() {
  chrome.storage.sync.get(null, (settings) => {
    currentSettings = settings;
    updateUI(settings);
  });
}

// 更新UI
function updateUI(settings) {
  // 更新模式选择
  modeRadios.forEach(radio => {
    if (radio.value === settings.mode) {
      radio.checked = true;
    }
  });

  // 更新颜色设置面板
  updateColorSettings('dark', settings.darkTheme);
  updateColorSettings('eye', settings.eyeTheme);

  // 显示当前模式的颜色设置面板
  showColorSettingsPanel(settings.mode);
}

// 更新颜色设置
function updateColorSettings(mode, theme) {
  document.getElementById(`${mode}-bg`).value = theme.backgroundColor;
  document.getElementById(`${mode}-text`).value = theme.textColor;
  document.getElementById(`${mode}-link`).value = theme.linkColor;
  document.getElementById(`${mode}-accent`).value = theme.accentColor;
}

// 显示颜色设置面板
function showColorSettingsPanel(mode) {
  // 隐藏所有颜色设置面板
  darkColorSettings.classList.remove('show');
  eyeColorSettings.classList.remove('show');

  // 显示当前模式的颜色设置面板
  if (mode === 'dark') {
    darkColorSettings.classList.add('show');
  } else if (mode === 'eye') {
    eyeColorSettings.classList.add('show');
  }
}

// 模式选择变化事件
function onModeChange(event) {
  const selectedMode = event.target.value;
  showColorSettingsPanel(selectedMode);
}

// 添加颜色选择器事件监听器
function addColorPickerListeners() {
  const colorPickers = document.querySelectorAll('input[type="color"]');
  colorPickers.forEach(picker => {
    picker.addEventListener('change', onColorChange);
  });
}

// 颜色变化事件
function onColorChange(event) {
  const id = event.target.id;
  const [mode, property] = id.split('-');
  const color = event.target.value;

  // 更新当前设置
  if (mode === 'dark') {
    if (property === 'bg') currentSettings.darkTheme.backgroundColor = color;
    if (property === 'text') currentSettings.darkTheme.textColor = color;
    if (property === 'link') currentSettings.darkTheme.linkColor = color;
    if (property === 'accent') currentSettings.darkTheme.accentColor = color;
  } else if (mode === 'eye') {
    if (property === 'bg') currentSettings.eyeTheme.backgroundColor = color;
    if (property === 'text') currentSettings.eyeTheme.textColor = color;
    if (property === 'link') currentSettings.eyeTheme.linkColor = color;
    if (property === 'accent') currentSettings.eyeTheme.accentColor = color;
  }
}

// 保存设置
function saveSettings() {
  // 获取当前选择的模式
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  currentSettings.mode = selectedMode;

  // 保存设置到存储
  chrome.storage.sync.set(currentSettings, () => {
    console.log('设置已保存');
    
    // 向当前活动标签页发送消息，应用新的主题
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'updateTheme', 
          settings: currentSettings 
        });
      }
    });

    // 可以添加一个成功提示
    alert('设置已保存并应用');
  });
}

// 恢复默认设置
function resetSettings() {
  const defaultSettings = {
    mode: 'none',
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

  // 更新UI
  updateUI(defaultSettings);

  // 保存默认设置
  chrome.storage.sync.set(defaultSettings, () => {
    console.log('默认设置已恢复');
    
    // 向当前活动标签页发送消息，应用新的主题
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'updateTheme', 
          settings: defaultSettings 
        });
      }
    });

    alert('已恢复默认设置');
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);