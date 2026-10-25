// AI Form AutoFiller SidePanel Controller

const DEFAULT_SERVER_URL = 'http://localhost:3000';

const state = {
  serverUrl: DEFAULT_SERVER_URL,
  excelData: null, // { fileName, headers: [], rows: [] }
  currentRecordIndex: 0,
  ledgerImages: [], // { id, fileName, dataUrl }
  detectedFormElements: [],
  fieldMappings: [],
  pageInfo: { url: '', title: '' },
};

// DOM References
const excelDropZone = document.getElementById('excelDropZone');
const excelFileInput = document.getElementById('excelFileInput');
const excelIdleState = document.getElementById('excelIdleState');
const excelLoadedState = document.getElementById('excelLoadedState');
const excelFileName = document.getElementById('excelFileName');
const excelRecordCount = document.getElementById('excelRecordCount');
const btnReuploadExcel = document.getElementById('btnReuploadExcel');

const screenshotDropZone = document.getElementById('screenshotDropZone');
const imageFileInput = document.getElementById('imageFileInput');
const btnSelectImages = document.getElementById('btnSelectImages');
const imagePreviewsContainer = document.getElementById('imagePreviewsContainer');
const pasteHint = document.getElementById('pasteHint');

const recordPager = document.getElementById('recordPager');
const currentRecordLabel = document.getElementById('currentRecordLabel');
const btnPrevRecord = document.getElementById('btnPrevRecord');
const btnNextRecord = document.getElementById('btnNextRecord');
const recordPreviewToggle = document.getElementById('recordPreviewToggle');
const recordDetailsBox = document.getElementById('recordDetailsBox');
const recordFieldCount = document.getElementById('recordFieldCount');
const recordTagsCloud = document.getElementById('recordTagsCloud');
const recordArrow = document.getElementById('recordArrow');

const btnAnalyzeForm = document.getElementById('btnAnalyzeForm');
const detectedElemBadge = document.getElementById('detectedElemBadge');
const statusBanner = document.getElementById('statusBanner');
const statusBannerText = document.getElementById('statusBannerText');

const mappingContainer = document.getElementById('mappingContainer');
const emptyMappingPlaceholder = document.getElementById('emptyMappingPlaceholder');
const mappingTableWrapper = document.getElementById('mappingTableWrapper');
const mappingTableBody = document.getElementById('mappingTableBody');
const mappingCount = document.getElementById('mappingCount');
const btnCheckAllPreview = document.getElementById('btnCheckAllPreview');

const btnStartFill = document.getElementById('btnStartFill');
const feedbackBox = document.getElementById('feedbackBox');
const feedbackTitle = document.getElementById('feedbackTitle');
const feedbackBadge = document.getElementById('feedbackBadge');
const statSuccessCount = document.getElementById('statSuccessCount');
const statFailCount = document.getElementById('statFailCount');
const feedbackList = document.getElementById('feedbackList');

const btnSettings = document.getElementById('btnSettings');
const settingsModal = document.getElementById('settingsModal');
const serverUrlInput = document.getElementById('serverUrlInput');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const btnClearData = document.getElementById('btnClearData');

// Initialize settings
function initConfig() {
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['ai_filler_server_url'], (res) => {
      if (res && res.ai_filler_server_url) {
        state.serverUrl = res.ai_filler_server_url;
      }
      serverUrlInput.value = state.serverUrl;
    });
  } else {
    serverUrlInput.value = state.serverUrl;
  }
}

// Save settings
function saveConfig() {
  const url = (serverUrlInput.value || '').trim().replace(/\/+$/, '');
  if (!url) {
    alert('请输入有效的后端服务地址');
    return;
  }
  state.serverUrl = url;
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ ai_filler_server_url: url });
  }
  settingsModal.classList.add('hidden');
}

// Show/hide status banner
function showStatus(text) {
  statusBanner.classList.remove('hidden');
  statusBannerText.innerText = text;
}

function hideStatus() {
  statusBanner.classList.add('hidden');
}

// Communication helper with content script
function sendMessageToContent(payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'FORWARD_TO_CONTENT', payload }, (res) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(res || { success: false, error: '未接收到页面响应' });
      }
    });
  });
}

// Capture tab screenshot
function captureVisibleTab() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'CAPTURE_TAB' }, (res) => {
      if (res && res.success) {
        resolve(res.dataUrl);
      } else {
        resolve(null);
      }
    });
  });
}

// Handle Excel Upload
async function handleExcelFile(file) {
  if (!file) return;
  showStatus(`正在上传并解析 Excel 文件: ${file.name}...`);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${state.serverUrl}/api/upload/excel`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    hideStatus();

    if (!res.ok || !data.success) {
      alert(`Excel解析失败: ${data.error || '未知错误'}`);
      return;
    }

    state.excelData = {
      fileName: data.fileName,
      headers: data.headers || [],
      rows: data.rows || [],
    };
    state.currentRecordIndex = 0;

    renderExcelState();
    renderRecordPager();
    btnClearData.classList.remove('hidden');
  } catch (err) {
    hideStatus();
    alert(`无法连接后端服务 (${state.serverUrl})，请检查设置中的地址是否正确: ${err.message}`);
  }
}

// Render Excel Card State
function renderExcelState() {
  if (!state.excelData) {
    excelIdleState.classList.remove('hidden');
    excelLoadedState.classList.add('hidden');
    return;
  }

  excelIdleState.classList.add('hidden');
  excelLoadedState.classList.remove('hidden');
  excelFileName.innerText = state.excelData.fileName;
  excelRecordCount.innerText = `共 ${state.excelData.rows.length} 条数据`;
}

// Render Pager & Current Record Preview
function renderRecordPager() {
  const rows = state.excelData ? state.excelData.rows : [];
  const total = rows.length;

  if (total === 0) {
    currentRecordLabel.innerText = '暂无记录';
    btnPrevRecord.disabled = true;
    btnNextRecord.disabled = true;
    recordFieldCount.innerText = '0';
    recordTagsCloud.innerHTML = '<span style="color:#94a3b8;">未导入台账数据</span>';
    return;
  }

  const curr = state.currentRecordIndex;
  currentRecordLabel.innerText = `第 ${curr + 1} / ${total} 条`;
  btnPrevRecord.disabled = curr === 0;
  btnNextRecord.disabled = curr >= total - 1;

  const currentRecord = rows[curr] || {};
  const entries = Object.entries(currentRecord);
  recordFieldCount.innerText = entries.length;

  recordTagsCloud.innerHTML = entries
    .map(
      ([k, v]) => `
      <div class="data-row-item">
        <span class="data-row-key">${escapeHtml(k)}:</span>
        <span class="data-row-val" title="${escapeHtml(String(v))}">${escapeHtml(String(v))}</span>
      </div>
    `
    )
    .join('');

  // If mappings already exist, update the mapped fillValue for the new record
  if (state.fieldMappings.length > 0) {
    state.fieldMappings.forEach((m) => {
      if (currentRecord[m.sourceField] !== undefined) {
        m.sourceValue = currentRecord[m.sourceField];
        m.fillValue = currentRecord[m.sourceField];
      }
    });
    renderMappingTable();
  }
}

// Handle Screenshot uploads
function addScreenshot(dataUrl, fileName = 'screenshot.png') {
  const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  state.ledgerImages.push({ id, fileName, dataUrl });
  renderScreenshotPreviews();
  btnClearData.classList.remove('hidden');
}

function renderScreenshotPreviews() {
  if (state.ledgerImages.length === 0) {
    pasteHint.classList.remove('hidden');
    // Remove existing thumbs
    const existing = imagePreviewsContainer.querySelectorAll('.img-thumb-wrap');
    existing.forEach((el) => el.remove());
    return;
  }

  pasteHint.classList.add('hidden');
  const existing = imagePreviewsContainer.querySelectorAll('.img-thumb-wrap');
  existing.forEach((el) => el.remove());

  state.ledgerImages.forEach((img) => {
    const wrap = document.createElement('div');
    wrap.className = 'img-thumb-wrap';
    wrap.innerHTML = `
      <img src="${img.dataUrl}" alt="${escapeHtml(img.fileName)}" />
      <button class="img-delete-btn" data-id="${img.id}">&times;</button>
    `;
    wrap.querySelector('.img-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      state.ledgerImages = state.ledgerImages.filter((i) => i.id !== img.id);
      renderScreenshotPreviews();
    });
    imagePreviewsContainer.appendChild(wrap);
  });
}

// Main: Trigger Form Analysis
async function analyzeForm() {
  showStatus('正在抓取当前页面表单元素与截图...');

  // 1. Extract DOM elements from content script
  const contentRes = await sendMessageToContent({ action: 'EXTRACT_FORM' });
  if (!contentRes.success) {
    hideStatus();
    alert(`表单分析失败: ${contentRes.error || '无法与目标页面通信，请刷新网页后再试'}`);
    return;
  }

  const { elements, totalCount, url, title } = contentRes.data;
  state.detectedFormElements = elements || [];
  state.pageInfo = { url, title };
  detectedElemBadge.innerText = `已检测到 ${totalCount} 个表单控件`;

  // 2. Capture tab screenshot
  let pageScreenshot = null;
  try {
    pageScreenshot = await captureVisibleTab();
  } catch (e) {
    console.warn('Capture tab failed, continuing with text extraction:', e);
  }

  // 3. Prepare payload
  const currentRowData =
    state.excelData && state.excelData.rows[state.currentRecordIndex]
      ? state.excelData.rows[state.currentRecordIndex]
      : {};

  const ledgerImagesBase64 = state.ledgerImages.map((i) => i.dataUrl);

  showStatus('正在向多模态大模型请求深度映射方案...');

  try {
    const res = await fetch(`${state.serverUrl}/api/form/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formElements: state.detectedFormElements,
        pageScreenshot,
        rowData: currentRowData,
        ledgerImages: ledgerImagesBase64,
        url,
        pageTitle: title,
      }),
    });

    const data = await res.json();
    hideStatus();

    if (!res.ok || !data.success) {
      alert(`AI智能分析失败: ${data.error || '大模型服务暂时不可用'}`);
      return;
    }

    state.fieldMappings = data.mappings || [];
    renderMappingTable();
    btnStartFill.disabled = state.fieldMappings.length === 0;

    if (data.mappings.length === 0) {
      alert('未能在当前表单中找到与台账对应的匹配字段，请检查页面是否为目标填报页面');
    }
  } catch (err) {
    hideStatus();
    alert(`请求表单分析接口失败: ${err.message}`);
  }
}

// Render Mapping Results Table
function renderMappingTable() {
  const mappings = state.fieldMappings;
  if (!mappings || mappings.length === 0) {
    emptyMappingPlaceholder.classList.remove('hidden');
    mappingTableWrapper.classList.add('hidden');
    btnStartFill.disabled = true;
    return;
  }

  emptyMappingPlaceholder.classList.add('hidden');
  mappingTableWrapper.classList.remove('hidden');
  mappingCount.innerText = mappings.length;

  mappingTableBody.innerHTML = '';

  mappings.forEach((m, idx) => {
    const tr = document.createElement('tr');

    // Generate dropdown options from detected form elements
    const elementOptionsHtml = state.detectedFormElements
      .map((elem) => {
        const isSelected = elem.selector === m.targetSelector;
        const display = `${elem.label || elem.placeholder || elem.name || elem.id || '未命名'} (${elem.type})`;
        return `<option value="${escapeHtml(elem.selector)}" ${isSelected ? 'selected' : ''}>${escapeHtml(display)}</option>`;
      })
      .join('');

    tr.innerHTML = `
      <td>
        <div class="source-cell-title">${escapeHtml(m.sourceField)}</div>
        <div class="source-cell-val">${escapeHtml(String(m.sourceValue || ''))}</div>
      </td>
      <td>
        <select class="target-select" data-idx="${idx}">
          <option value="">-- 请选择对应表单字段 --</option>
          ${elementOptionsHtml}
        </select>
        <input type="text" class="selector-input" data-idx="${idx}" value="${escapeHtml(m.targetSelector || '')}" title="可直接修改CSS选择器" />
      </td>
      <td class="action-cell">
        <button class="preview-pill" data-selector="${escapeHtml(m.targetSelector || '')}" title="在页面高亮此元素">🔍 核验</button>
      </td>
    `;

    // Dropdown change listener
    const selectElem = tr.querySelector('.target-select');
    const inputElem = tr.querySelector('.selector-input');
    const previewBtn = tr.querySelector('.preview-pill');

    selectElem.addEventListener('change', (e) => {
      const newSel = e.target.value;
      m.targetSelector = newSel;
      inputElem.value = newSel;
      const matchedElem = state.detectedFormElements.find((el) => el.selector === newSel);
      if (matchedElem) {
        m.targetLabel = matchedElem.label || matchedElem.name || '';
        m.elementType = matchedElem.type;
      }
      previewBtn.setAttribute('data-selector', newSel);
    });

    inputElem.addEventListener('input', (e) => {
      const newSel = e.target.value.trim();
      m.targetSelector = newSel;
      previewBtn.setAttribute('data-selector', newSel);
    });

    previewBtn.addEventListener('click', () => {
      const sel = previewBtn.getAttribute('data-selector');
      if (sel) {
        sendMessageToContent({ action: 'PREVIEW_ELEMENT', selector: sel });
      }
    });

    mappingTableBody.appendChild(tr);
  });
}

// Execute Form Filling
async function startFormFill() {
  if (!state.fieldMappings || state.fieldMappings.length === 0) {
    alert('暂无字段映射，请先分析表单');
    return;
  }

  showStatus('正在执行页面表单自动填充并注入受控事件...');
  btnStartFill.disabled = true;

  const res = await sendMessageToContent({
    action: 'EXECUTE_FILL',
    mappings: state.fieldMappings,
  });

  hideStatus();
  btnStartFill.disabled = false;

  if (!res.success) {
    alert(`填报执行失败: ${res.error || '页面无响应'}`);
    return;
  }

  // Render Feedback
  renderFeedback(res);

  // Send execution log to backend
  try {
    fetch(`${state.serverUrl}/api/form/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetUrl: state.pageInfo.url,
        excelFileName: state.excelData ? state.excelData.fileName : undefined,
        recordIndex: state.currentRecordIndex + 1,
        totalRecords: state.excelData ? state.excelData.rows.length : 1,
        mappedFieldsCount: state.fieldMappings.length,
        successCount: res.successCount,
        failCount: res.failCount,
        details: res.results,
      }),
    });
  } catch (logErr) {
    console.warn('Logging to backend failed:', logErr);
  }
}

function renderFeedback(res) {
  feedbackBox.classList.remove('hidden');
  const pct = Math.round((res.successCount / res.total) * 100);
  feedbackTitle.innerText = res.failCount === 0 ? '🎉 表单已全量完成填报' : '⚠️ 表单部分字段已填报';
  feedbackBadge.innerText = `${pct}% 成功`;
  feedbackBadge.style.background = res.failCount === 0 ? '#16a34a' : '#d97706';

  statSuccessCount.innerText = res.successCount;
  statFailCount.innerText = res.failCount;

  feedbackList.innerHTML = res.results
    .map((item) => {
      const isErr = item.status === 'failed';
      return `
      <div class="feedback-item ${isErr ? 'err' : ''}">
        <span>${escapeHtml(item.sourceField)} -> ${escapeHtml(item.targetLabel || item.targetSelector)}</span>
        <span>${isErr ? `❌ ${escapeHtml(item.error || '未找到')}` : '✅ 成功'}</span>
      </div>
    `;
    })
    .join('');
}

// Utility: HTML escape
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Event Listeners setup
function setupEventListeners() {
  // Settings modal
  btnSettings.addEventListener('click', () => settingsModal.classList.remove('hidden'));
  btnCloseSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
  btnSaveSettings.addEventListener('click', saveConfig);

  // Clear data
  btnClearData.addEventListener('click', () => {
    state.excelData = null;
    state.currentRecordIndex = 0;
    state.ledgerImages = [];
    state.fieldMappings = [];
    renderExcelState();
    renderRecordPager();
    renderScreenshotPreviews();
    renderMappingTable();
    feedbackBox.classList.add('hidden');
    btnClearData.classList.add('hidden');
  });

  // Excel Upload
  excelDropZone.addEventListener('click', () => excelFileInput.click());
  btnReuploadExcel?.addEventListener('click', (e) => {
    e.stopPropagation();
    excelFileInput.click();
  });
  excelFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleExcelFile(file);
  });

  excelDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    excelDropZone.classList.add('dragover');
  });
  excelDropZone.addEventListener('dragleave', () => excelDropZone.classList.remove('dragover'));
  excelDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    excelDropZone.classList.remove('dragover');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleExcelFile(file);
  });

  // Screenshots Upload
  btnSelectImages.addEventListener('click', () => imageFileInput.click());
  imageFileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => addScreenshot(ev.target.result, file.name);
      reader.readAsDataURL(file);
    });
  });

  // Clipboard Paste Support for screenshots
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => addScreenshot(ev.target.result, `paste_${Date.now()}.png`);
        reader.readAsDataURL(blob);
      }
    }
  });

  // Pager navigation
  btnPrevRecord.addEventListener('click', () => {
    if (state.currentRecordIndex > 0) {
      state.currentRecordIndex--;
      renderRecordPager();
    }
  });

  btnNextRecord.addEventListener('click', () => {
    if (state.excelData && state.currentRecordIndex < state.excelData.rows.length - 1) {
      state.currentRecordIndex++;
      renderRecordPager();
    }
  });

  // Record drawer toggle
  recordPreviewToggle.addEventListener('click', () => {
    const isHidden = recordDetailsBox.classList.contains('hidden');
    if (isHidden) {
      recordDetailsBox.classList.remove('hidden');
      recordArrow.innerText = '▲';
    } else {
      recordDetailsBox.classList.add('hidden');
      recordArrow.innerText = '▼';
    }
  });

  // Analyze Form button
  btnAnalyzeForm.addEventListener('click', analyzeForm);

  // Check all highlight
  btnCheckAllPreview?.addEventListener('click', () => {
    state.fieldMappings.forEach((m) => {
      if (m.targetSelector) {
        sendMessageToContent({ action: 'PREVIEW_ELEMENT', selector: m.targetSelector });
      }
    });
  });

  // Start fill button
  btnStartFill.addEventListener('click', startFormFill);
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initConfig();
  setupEventListeners();
  renderRecordPager();
});
