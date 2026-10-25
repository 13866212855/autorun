// AI Form AutoFiller Content Script
(function () {
  // Prevent duplicate injection
  if (window.__AI_FORM_FILLER_INJECTED__) return;
  window.__AI_FORM_FILLER_INJECTED__ = true;

  console.log('[AI Form Filler] Content script initialized on:', window.location.href);

  // Helper to find associated label for an input element
  function findElementLabel(elem) {
    if (!elem) return '';

    // 1. Explicit <label for="id">
    if (elem.id) {
      const explicitLabel = document.querySelector(`label[for="${CSS.escape(elem.id)}"]`);
      if (explicitLabel && explicitLabel.innerText.trim()) {
        return explicitLabel.innerText.trim().replace(/[*：:\n]/g, '').trim();
      }
    }

    // 2. Wrapped inside <label>...</label>
    const parentLabel = elem.closest('label');
    if (parentLabel) {
      const clone = parentLabel.cloneNode(true);
      const inputs = clone.querySelectorAll('input, select, textarea');
      inputs.forEach((i) => i.remove());
      const text = clone.innerText.trim();
      if (text) return text.replace(/[*：:\n]/g, '').trim();
    }

    // 3. aria-label or title
    if (elem.getAttribute('aria-label')) {
      return elem.getAttribute('aria-label').trim();
    }
    if (elem.getAttribute('title')) {
      return elem.getAttribute('title').trim();
    }

    // 4. In a table cell (e.g. Statistical Matrix Table like 教基3115 / tjxt.moe.edu.cn)
    const td = elem.closest('td');
    if (td) {
      const tr = td.closest('tr');
      const table = tr ? tr.closest('table') : null;
      if (tr && table) {
        // Find row title (first or second cell text in row, e.g. "普通初中班")
        const rowCells = Array.from(tr.children);
        const colIdx = rowCells.indexOf(td);
        let rowTitle = '';
        for (let i = 0; i < Math.min(colIdx, 3); i++) {
          const t = rowCells[i].innerText.trim();
          if (t && isNaN(Number(t)) && t.length < 25) {
            rowTitle = t.replace(/[*：:\n]/g, '').trim();
            break;
          }
        }

        // Find column title from table thead or first row
        let colTitle = '';
        const headerRows = Array.from(table.querySelectorAll('thead tr, tr:first-child'));
        if (headerRows.length > 0) {
          const lastHeaderRow = headerRows[headerRows.length - 1];
          const headerCells = Array.from(lastHeaderRow.querySelectorAll('th, td'));
          if (headerCells[colIdx]) {
            colTitle = headerCells[colIdx].innerText.replace(/[*：:\n]/g, '').trim();
          }
        }

        if (rowTitle && colTitle) {
          return `${rowTitle} - ${colTitle}`;
        }
        if (rowTitle) return rowTitle;
        if (colTitle) return colTitle;
      }

      if (td.previousElementSibling) {
        const prevText = td.previousElementSibling.innerText.trim();
        if (prevText && prevText.length < 30) {
          return prevText.replace(/[*：:\n]/g, '').trim();
        }
      }
    }

    // 5. Form item label (Ant Design, Element UI, Arco, etc.)
    const formItem = elem.closest('.ant-form-item, .el-form-item, .form-group, .form-item, .layui-form-item, .item');
    if (formItem) {
      const labelElem = formItem.querySelector('.ant-form-item-label, .el-form-item__label, label, .form-label');
      if (labelElem && labelElem.innerText.trim()) {
        return labelElem.innerText.trim().replace(/[*：:\n]/g, '').trim();
      }
    }

    // 6. Preceding sibling or nearby text
    let prev = elem.previousElementSibling;
    while (prev) {
      if (['SPAN', 'DIV', 'P', 'LABEL', 'B', 'STRONG'].includes(prev.tagName)) {
        const text = prev.innerText.trim();
        if (text && text.length < 25) {
          return text.replace(/[*：:\n]/g, '').trim();
        }
      }
      prev = prev.previousElementSibling;
    }

    // 7. Fallback to placeholder or name
    return elem.getAttribute('placeholder') || elem.name || elem.id || '';
  }

  // Generate robust CSS selector
  function getUniqueSelector(elem) {
    if (elem.id) {
      return `#${CSS.escape(elem.id)}`;
    }
    if (elem.name) {
      const tag = elem.tagName.toLowerCase();
      const byName = `${tag}[name="${CSS.escape(elem.name)}"]`;
      if (document.querySelectorAll(byName).length === 1) {
        return byName;
      }
      // If multiple (e.g. radios/checkboxes), include index
      const matches = Array.from(document.querySelectorAll(byName));
      const idx = matches.indexOf(elem);
      if (idx >= 0) {
        return `${byName}:nth-of-type(${idx + 1})`;
      }
      return byName;
    }

    // Try parent class / nth-child path
    let current = elem;
    const path = [];
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${CSS.escape(current.id)}`;
        path.unshift(selector);
        break;
      }
      let sibling = current;
      let nth = 1;
      while ((sibling = sibling.previousElementSibling)) {
        if (sibling.tagName === current.tagName) nth++;
      }
      selector += `:nth-of-type(${nth})`;
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  // Extract all interactive form elements from current page
  function extractPageFormStructure() {
    const selectorQuery = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea';
    const rawElements = Array.from(document.querySelectorAll(selectorQuery));

    const elements = [];
    const radioGroups = new Map();

    rawElements.forEach((elem) => {
      // Ignore hidden or zero-size elements
      const rect = elem.getBoundingClientRect();
      const style = window.getComputedStyle(elem);
      if (style.display === 'none' || style.visibility === 'hidden' || elem.disabled) {
        // Skip disabled or hidden unless visually off-screen
      }

      const tagName = elem.tagName.toLowerCase();
      const inputType = elem.type ? elem.type.toLowerCase() : tagName;
      const selector = getUniqueSelector(elem);
      const label = findElementLabel(elem);
      const placeholder = elem.getAttribute('placeholder') || '';
      const name = elem.getAttribute('name') || '';
      const id = elem.id || '';

      // Context text surrounding element
      const parentRow = elem.closest('tr, .form-row, .row, .form-group, fieldset');
      const contextText = parentRow ? parentRow.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : '';

      // Handle Select dropdown options
      let options = [];
      if (tagName === 'select') {
        options = Array.from(elem.options || []).map((opt) => ({
          text: opt.text.trim(),
          value: opt.value,
        }));
      }

      // Handle Radio & Checkbox
      if (inputType === 'radio' || inputType === 'checkbox') {
        const groupName = name || elem.id || 'anonymous_group';
        const optText = findElementLabel(elem) || elem.value;

        if (!radioGroups.has(groupName)) {
          radioGroups.set(groupName, {
            groupName,
            type: inputType,
            label: contextText.slice(0, 40) || label,
            selector: `input[name="${CSS.escape(name)}"]`,
            options: [],
          });
        }
        radioGroups.get(groupName).options.push({
          text: optText,
          value: elem.value,
          selector,
        });
      }

      elements.push({
        selector,
        tagName,
        type: inputType,
        name,
        id,
        label,
        placeholder,
        contextText,
        options,
        currentValue: elem.value,
      });
    });

    return {
      url: window.location.href,
      title: document.title,
      totalCount: elements.length,
      elements,
    };
  }

  // React/Vue Controlled Component Native Value Setter
  function setNativeValue(element, value) {
    if (!element) return;

    let prototype = Object.getPrototypeOf(element);
    let descriptor = null;

    // Traverse prototype chain to find the native setter
    while (prototype) {
      descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
      if (descriptor && descriptor.set) {
        break;
      }
      prototype = Object.getPrototypeOf(prototype);
    }

    if (descriptor && descriptor.set) {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }

    // Trigger full synthetic event pipeline for React 16+, Vue 2/3, Angular & Native listeners
    element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
  }

  // Highlight filled element visually
  function highlightElement(elem, isSuccess = true) {
    if (!elem) return;

    // Remove old highlight badge if exists
    const oldBadge = elem.parentElement ? elem.parentElement.querySelector(`.ai-filler-badge-${elem.id || 'target'}`) : null;
    if (oldBadge) oldBadge.remove();

    const originalTransition = elem.style.transition;
    const originalBoxShadow = elem.style.boxShadow;
    const originalBorder = elem.style.border;
    const originalBg = elem.style.backgroundColor;

    // High visibility yellow/amber glowing style
    elem.style.transition = 'all 0.4s ease';
    elem.style.boxShadow = isSuccess
      ? '0 0 0 3px rgba(245, 158, 11, 0.45), 0 0 12px rgba(245, 158, 11, 0.3)'
      : '0 0 0 3px rgba(239, 68, 68, 0.45), 0 0 12px rgba(239, 68, 68, 0.3)';
    elem.style.border = isSuccess ? '1.5px solid #d97706' : '1.5px solid #dc2626';
    elem.style.backgroundColor = isSuccess ? '#fef3c7' : '#fee2e2';

    // Inject temporary glowing badge tag
    const badge = document.createElement('span');
    badge.className = `ai-filler-badge-${elem.id || 'target'}`;
    badge.innerText = isSuccess ? '✨ AI已填报' : '⚠️ 填充异常';
    badge.style.cssText = `
      position: absolute;
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
      background: ${isSuccess ? '#d97706' : '#dc2626'};
      color: #ffffff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      pointer-events: none;
      z-index: 999999;
      transform: translateY(-90%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    try {
      if (elem.offsetParent) {
        badge.style.left = `${elem.offsetLeft}px`;
        badge.style.top = `${elem.offsetTop}px`;
        elem.offsetParent.appendChild(badge);
      }
    } catch (e) {
      // Offset position fail safe
    }

    // Gradually restore normal background after 5s or on focus/hover
    setTimeout(() => {
      elem.style.backgroundColor = originalBg;
      elem.style.boxShadow = originalBoxShadow;
      elem.style.border = originalBorder;
      elem.style.transition = originalTransition;
      if (badge && badge.parentNode) {
        badge.style.opacity = '0';
        badge.style.transition = 'opacity 0.6s ease';
        setTimeout(() => badge.remove(), 600);
      }
    }, 6000);
  }

  // Execute single field fill
  function executeFillField(mapping) {
    const { targetSelector, fillValue, elementType, expectedOption } = mapping;

    if (!targetSelector) {
      return { success: false, error: '未指定目标元素CSS选择器' };
    }

    let elem = null;
    try {
      elem = document.querySelector(targetSelector);
    } catch (err) {
      return { success: false, error: `CSS选择器语法无效: ${targetSelector}` };
    }

    if (!elem) {
      return { success: false, error: `该字段未能找到匹配的表单元素 (${targetSelector})，请手动填写或修正选择器` };
    }

    try {
      const tag = elem.tagName.toLowerCase();
      const type = (elem.type || tag).toLowerCase();
      const valStr = fillValue !== undefined && fillValue !== null ? String(fillValue).trim() : '';

      // 1. Select Dropdown handling
      if (tag === 'select') {
        let matchedIndex = -1;
        const targetOptionText = expectedOption || valStr;

        for (let i = 0; i < elem.options.length; i++) {
          const opt = elem.options[i];
          const optText = opt.text.trim();
          const optVal = opt.value.trim();

          if (
            optText === targetOptionText ||
            optVal === targetOptionText ||
            optText.includes(targetOptionText) ||
            targetOptionText.includes(optText)
          ) {
            matchedIndex = i;
            break;
          }
        }

        if (matchedIndex >= 0) {
          elem.selectedIndex = matchedIndex;
          setNativeValue(elem, elem.options[matchedIndex].value);
          highlightElement(elem, true);
          return { success: true, actualValue: elem.options[matchedIndex].text };
        } else {
          highlightElement(elem, false);
          return { success: false, error: `下拉选项中未找到匹配项: "${targetOptionText}"` };
        }
      }

      // 2. Radio Button handling
      if (type === 'radio') {
        const name = elem.name;
        const radios = name ? Array.from(document.querySelectorAll(`input[type="radio"][name="${CSS.escape(name)}"]`)) : [elem];
        const matchVal = (expectedOption || valStr).toLowerCase();

        let matchedRadio = null;
        for (const radio of radios) {
          const radioLabel = findElementLabel(radio).toLowerCase();
          const radioVal = (radio.value || '').toLowerCase();
          if (radioLabel.includes(matchVal) || radioVal.includes(matchVal) || matchVal.includes(radioLabel)) {
            matchedRadio = radio;
            break;
          }
        }

        if (matchedRadio) {
          matchedRadio.checked = true;
          matchedRadio.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          matchedRadio.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          highlightElement(matchedRadio, true);
          return { success: true, actualValue: matchedRadio.value };
        } else {
          highlightElement(elem, false);
          return { success: false, error: `单选组未找到匹配选项: "${valStr}"` };
        }
      }

      // 3. Checkbox handling
      if (type === 'checkbox') {
        const shouldCheck = ['true', '1', '是', 'yes', '对', '有', '已勾选'].includes(valStr.toLowerCase()) || Boolean(valStr);
        elem.checked = shouldCheck;
        elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        elem.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        highlightElement(elem, true);
        return { success: true, actualValue: shouldCheck };
      }

      // 4. Text / Number / Textarea / Date / Tel / Email
      setNativeValue(elem, valStr);
      highlightElement(elem, true);
      return { success: true, actualValue: valStr };
    } catch (fillErr) {
      highlightElement(elem, false);
      return { success: false, error: `填充异常: ${fillErr.message}` };
    }
  }

  // Listener for messages from background/popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Action 1: Extract form structure
    if (request.action === 'EXTRACT_FORM') {
      try {
        const data = extractPageFormStructure();
        sendResponse({ success: true, data });
      } catch (err) {
        sendResponse({ success: false, error: `提取表单结构异常: ${err.message}` });
      }
      return true;
    }

    // Action 2: Execute filling mappings
    if (request.action === 'EXECUTE_FILL') {
      const mappings = request.mappings || [];
      const results = [];
      let successCount = 0;
      let failCount = 0;

      mappings.forEach((m) => {
        const res = executeFillField(m);
        if (res.success) {
          successCount++;
        } else {
          failCount++;
        }
        results.push({
          sourceField: m.sourceField,
          sourceValue: m.sourceValue,
          targetSelector: m.targetSelector,
          targetLabel: m.targetLabel,
          status: res.success ? 'success' : 'failed',
          error: res.error,
          actualValue: res.actualValue,
        });
      });

      sendResponse({
        success: true,
        total: mappings.length,
        successCount,
        failCount,
        results,
      });
      return true;
    }

    // Action 3: Highlight a specific element during user review
    if (request.action === 'PREVIEW_ELEMENT') {
      const { selector } = request;
      const elem = document.querySelector(selector);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightElement(elem, true);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: '元素未在页面中找到' });
      }
      return true;
    }
  });
})();
