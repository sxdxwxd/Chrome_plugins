// content.js - 页面内容脚本，用于修改页面样式

// 全局变量
let currentSettings = null;
let styleElement = null;

// 获取设置并应用主题
function loadAndApplyTheme() {
  chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
    currentSettings = settings;
    applyTheme(settings.mode);
  });
}

// 应用主题
function applyTheme(mode) {
  // 移除现有的样式元素
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }

  if (mode === 'none') {
    // 不应用任何主题
    return;
  }

  // 创建新的样式元素
  styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.id = 'eye-protection-theme';

  // 获取当前主题配置
  const theme = mode === 'dark' ? currentSettings.darkTheme : currentSettings.eyeTheme;

  // 构建CSS规则
  const cssRules = `
    /* 基本元素样式 - 增强优先级 */
    html, body, body * {
      background-color: ${theme.backgroundColor} !important;
      color: ${theme.textColor} !important;
    }
    
    /* 确保body的样式被正确应用 */
    :root, body {
      background-color: ${theme.backgroundColor} !important;
      color: ${theme.textColor} !important;
    }
    
    /* 处理可能的内联样式覆盖 */
    body[style], html[style] {
      background-color: ${theme.backgroundColor} !important !important;
      color: ${theme.textColor} !important !important;
    }

    /* 文本元素 */
    h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, label, a {
      color: ${theme.textColor} !important;
    }

    /* 链接 */
    a {
      color: ${theme.linkColor} !important;
    }

    a:hover {
      color: ${theme.accentColor} !important;
    }

    /* 输入元素 */
    input, textarea, select, button {
      background-color: ${theme.backgroundColor} !important;
      color: ${theme.textColor} !important;
      border-color: ${theme.accentColor} !important;
    }

    /* 按钮 */
    button {
      background-color: ${theme.accentColor} !important;
      color: ${theme.backgroundColor} !important;
    }

    /* 卡片和面板 */
    .card, .panel, .box, .container {
      background-color: ${theme.backgroundColor} !important;
      border-color: ${theme.accentColor} !important;
    }

    /* 导航栏 */
    nav, .navbar, .header, .topbar {
      background-color: ${theme.backgroundColor} !important;
      border-color: ${theme.accentColor} !important;
    }

    /* 侧边栏 */
    .sidebar, .aside, .leftbar, .rightbar {
      background-color: ${theme.backgroundColor} !important;
      border-color: ${theme.accentColor} !important;
    }

    /* 代码块 */
    pre, code {
      background-color: ${adjustColor(theme.backgroundColor, -10)} !important;
      color: ${theme.textColor} !important;
      border-color: ${theme.accentColor} !important;
    }

    /* 表格 */
    table {
      background-color: ${theme.backgroundColor} !important;
      border-color: ${theme.accentColor} !important;
    }

    th, td {
      border-color: ${theme.accentColor} !important;
    }

    /* 图片 */
    img {
      opacity: 0.9 !important;
    }

    /* 滚动条 */
    ::-webkit-scrollbar {
      background-color: ${theme.backgroundColor} !important;
    }

    ::-webkit-scrollbar-thumb {
      background-color: ${theme.accentColor} !important;
    }

    /* 覆盖可能的冲突样式 */
    [style*="background"], [style*="color"] {
      background-color: ${theme.backgroundColor} !important !important;
      color: ${theme.textColor} !important !important;
    }

    /* 处理常见的网站容器和布局元素 */
    #root, #app, #content, .main-container, .site-wrapper, .wrapper {
      background-color: ${theme.backgroundColor} !important;
      color: ${theme.textColor} !important;
    }

    /* 处理背景图片 */
    [style*="background-image"] {
      background-color: ${theme.backgroundColor} !important;
      background-blend-mode: overlay !important;
      opacity: 0.9 !important;
    }

    /* 处理iframe内容（如果允许） */
    iframe {
      background-color: ${theme.backgroundColor} !important;
    }

    /* 确保所有元素继承正确的颜色 */
    * {
      background-color: inherit !important;
      color: inherit !important;
    }

    /* 重新设置根元素和body的颜色，确保继承链正确 */
    :root, body {
      background-color: ${theme.backgroundColor} !important !important;
      color: ${theme.textColor} !important !important;
    }
  `;

  // 将CSS规则添加到样式元素
  styleElement.appendChild(document.createTextNode(cssRules));
  
  // 将样式元素添加到页面头部
  document.head.appendChild(styleElement);
}

// 辅助函数：调整颜色亮度
function adjustColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'applyTheme') {
    loadAndApplyTheme();
  } else if (request.action === 'updateTheme') {
    currentSettings = request.settings;
    applyTheme(request.settings.mode);
  }
});

// 页面加载完成后应用主题
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAndApplyTheme);
} else {
  loadAndApplyTheme();
}