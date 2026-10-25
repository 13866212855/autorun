'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Sparkles,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Layers,
  ChevronRight,
  ChevronLeft,
  Search,
  Globe,
  ArrowRight,
  Eye,
  Building2,
  FileCheck,
  RefreshCw,
  Sliders,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { ScrapedFormElement } from './api/proxy/scrape/route';

// Preset Systems
const PRESET_SYSTEMS = [
  {
    id: 'culture_enterprise',
    name: '全国文化企事业单位年度统计调查表 (综合类)',
    url: 'https://stats.gov.sample.cn/survey/form/enterprise',
    badge: '文统综1号 · 年度',
    fields: [
      { id: 'unitName', label: '单位名称 (全称)', type: 'text', placeholder: '请输入单位完整法定名称', required: true },
      { id: 'creditCode', label: '统一社会信用代码 (18位)', type: 'text', placeholder: '91/12开头的18位信用代码', required: true },
      { id: 'legalRepresentative', label: '法定代表人 / 负责人', type: 'text', placeholder: '负责人姓名' },
      { id: 'contactPhone', label: '联系电话', type: 'tel', placeholder: '手机或办公固定电话' },
      { id: 'employeeCount', label: '在编职工人数 (人)', type: 'number', placeholder: '0' },
      { id: 'revenue', label: '年营业收入 (万元)', type: 'number', placeholder: '0.00' },
      { id: 'totalAssets', label: '资产总计 (万元)', type: 'number', placeholder: '0.00' },
      {
        id: 'orgType',
        label: '机构性质与类型',
        type: 'select',
        options: ['企业法人单位', '公益一类事业单位', '公益二类事业单位', '民办非企业单位', '社会团体'],
      },
      {
        id: 'region',
        label: '所在区域',
        type: 'select',
        options: ['华东区', '华北区', '华南区', '西南区', '西北区'],
      },
      {
        id: 'isHighTech',
        label: '是否高新技术资质单位',
        type: 'radio',
        options: ['是', '否'],
      },
      {
        id: 'operationStatus',
        label: '运营现状',
        type: 'radio',
        options: ['正常运营', '筹建或调整'],
      },
      { id: 'businessDesc', label: '主要业务活动说明', type: 'textarea', placeholder: '简述单位从事的主要文化业务或公共文化活动' },
    ],
  },
  {
    id: 'service_finance',
    name: '规模以上重点服务业财务与运营季度统计表',
    url: 'https://stats.gov.sample.cn/survey/service-finance',
    badge: '服统季2号 · 季度',
    fields: [
      { id: 'unitName', label: '企业单位全称', type: 'text', placeholder: '营业执照登记企业名称', required: true },
      { id: 'creditCode', label: '统一社会信用代码', type: 'text', placeholder: '统一社会信用代码', required: true },
      { id: 'legalRepresentative', label: '统计负责人', type: 'text', placeholder: '报表填报负责人' },
      { id: 'contactPhone', label: '联系电话', type: 'tel', placeholder: '填报人手机或座机' },
      { id: 'revenue', label: '主营业务收入 (万元)', type: 'number', placeholder: '0.00' },
      { id: 'totalAssets', label: '营业利润 (万元)', type: 'number', placeholder: '0.00' },
      { id: 'employeeCount', label: '期末从业人员总数', type: 'number', placeholder: '人' },
      {
        id: 'region',
        label: '企业注册所在大区',
        type: 'select',
        options: ['华东区', '华北区', '华南区', '西南区', '西北区'],
      },
      {
        id: 'operationStatus',
        label: '报告期经营状况',
        type: 'radio',
        options: ['正常运营', '筹建或调整'],
      },
      { id: 'businessDesc', label: '重点服务产品及业务线描述', type: 'textarea', placeholder: '简要说明核心服务模式与营收来源' },
    ],
  },
  {
    id: 'project_declare',
    name: '科技与数字化文化创新研发项目申报表',
    url: 'https://tech.gov.sample.cn/project/declare',
    badge: '科创申报 · 项目制',
    fields: [
      { id: 'unitName', label: '申报单位主体名称', type: 'text', placeholder: '申报机构名称', required: true },
      { id: 'creditCode', label: '统一社会信用代码', type: 'text', placeholder: '18位统一信用代码', required: true },
      { id: 'legalRepresentative', label: '项目总监 / 申报人', type: 'text', placeholder: '项目第一申报人' },
      { id: 'contactPhone', label: '申报人联系电话', type: 'tel', placeholder: '手机号' },
      { id: 'revenue', label: '申请资助与自筹预算 (万元)', type: 'number', placeholder: '0.00' },
      {
        id: 'orgType',
        label: '申报单位资质门类',
        type: 'select',
        options: ['企业法人单位', '公益一类事业单位', '公益二类事业单位', '民办非企业单位'],
      },
      {
        id: 'isHighTech',
        label: '单位是否具备高新资质',
        type: 'radio',
        options: ['是', '否'],
      },
      { id: 'businessDesc', label: '项目创新点与技术路线', type: 'textarea', placeholder: '阐述核心技术研发重点及预期成果' },
    ],
  },
];

// Sample Ledger dataset with 3 distinct records for instant testing
const SAMPLE_EXCEL_DATA = {
  fileName: '2024年度重点文化企事业单位基础台账.xlsx',
  headers: [
    '单位名称',
    '统一代码',
    '负责人',
    '联系电话',
    '职工人数',
    '年营业收入',
    '资产总计',
    '机构类型',
    '所在区域',
    '高新单位',
    '运营状态',
    '主营业务说明',
  ],
  rows: [
    {
      '单位名称': '东方数智文化创意发展有限公司',
      '统一代码': '91310115MA1K5ABC88',
      '负责人': '张建国',
      '联系电话': '13812345678',
      '职工人数': '68',
      '年营业收入': '1850.5',
      '资产总计': '3420.0',
      '机构类型': '企业法人单位',
      '所在区域': '华东区',
      '高新单位': '是',
      '运营状态': '正常运营',
      '主营业务说明': '数字文化展览展示策划、多媒体数字藏品研发与文化云平台运营。',
    },
    {
      '单位名称': '市群众艺术文化活动传播中心',
      '统一代码': '12310000400018892K',
      '负责人': '李文华',
      '联系电话': '18987654321',
      '职工人数': '42',
      '年营业收入': '620.0',
      '资产总计': '1580.0',
      '机构类型': '公益一类事业单位',
      '所在区域': '华东区',
      '高新单位': '否',
      '运营状态': '正常运营',
      '主营业务说明': '群众文化公益演出组织、全民艺术普及讲座、市民文化节系列赛事承办。',
    },
    {
      '单位名称': '江南古籍文博数字化保护研究所',
      '统一代码': '12320000728919931X',
      '负责人': '陈晓平',
      '联系电话': '13699887766',
      '职工人数': '29',
      '年营业收入': '430.8',
      '资产总计': '980.5',
      '机构类型': '公益二类事业单位',
      '所在区域': '华东区',
      '高新单位': '是',
      '运营状态': '筹建或调整',
      '主营业务说明': '古籍善本高精图像扫描归档、破损纸质文献修补装裱及古文献数字数据库开放。',
    },
  ],
};

export default function HomePage() {
  // Navigation View
  const [activeView, setActiveView] = useState<'sandbox' | 'guide'>('sandbox');

  // Address Bar URL & Dynamic Target Page State
  const [targetUrlInput, setTargetUrlInput] = useState('https://stats.gov.sample.cn/survey/form/enterprise');
  const [currentSystemId, setCurrentSystemId] = useState<string>('culture_enterprise');
  const [pageLoading, setPageLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<{
    url: string;
    title: string;
    elements: ScrapedFormElement[];
  } | null>(null);

  // Dynamic values stored for whatever form is active (key is element id/name/selector)
  const [dynamicFormValues, setDynamicFormValues] = useState<Record<string, any>>({
    unitName: '',
    creditCode: '',
    legalRepresentative: '',
    contactPhone: '',
    employeeCount: '',
    revenue: '',
    totalAssets: '',
    orgType: '',
    region: '',
    isHighTech: '否',
    operationStatus: '正常运营',
    businessDesc: '',
  });

  // Highlight state for sandbox DOM
  const [highlightedFields, setHighlightedFields] = useState<Record<string, boolean>>({});

  // Ledger state
  const [excelData, setExcelData] = useState<{
    fileName: string;
    headers: string[];
    rows: Record<string, any>[];
  } | null>(null);
  const [currentRecordIdx, setCurrentRecordIdx] = useState(0);
  const [ledgerScreenshots, setLedgerScreenshots] = useState<
    Array<{ id: string; name: string; url: string }>
  >([]);

  // Mappings & Analysis
  const [mappings, setMappings] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [fillFeedback, setFillFeedback] = useState<any | null>(null);

  // Form DOM container reference
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Handle URL change & load
  async function handleLoadUrl(targetUrlToLoad?: string) {
    const rawUrl = (targetUrlToLoad || targetUrlInput || '').trim();
    if (!rawUrl) return;

    let fullUrl = rawUrl;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`;
      setTargetUrlInput(fullUrl);
    }

    setPageLoading(true);
    setMappings([]);
    setFillFeedback(null);
    setHighlightedFields({});

    // Check if matches one of our preset systems
    const matchedPreset = PRESET_SYSTEMS.find((p) => p.url === fullUrl || fullUrl.includes(p.id));
    if (matchedPreset) {
      setCurrentSystemId(matchedPreset.id);
      setScrapedData(null);
      setTargetUrlInput(matchedPreset.url);
      setPageLoading(false);
      return;
    }

    // Otherwise, it's an external custom URL: scrape and extract form elements live via backend!
    setCurrentSystemId('custom_external');
    try {
      const res = await fetch('/api/proxy/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`抓取外部网页失败: ${data.error || '无法访问该网页，已为您保留表单容器'}`);
        // Fallback placeholder structure
        setScrapedData({
          url: fullUrl,
          title: `目标表单: ${fullUrl}`,
          elements: [
            { selector: '#unitName', id: 'unitName', tagName: 'input', type: 'text', label: '单位全称 / 机构名称', placeholder: '请输入' },
            { selector: '#creditCode', id: 'creditCode', tagName: 'input', type: 'text', label: '统一社会信用代码', placeholder: '请输入' },
            { selector: '#legalRepresentative', id: 'legalRepresentative', tagName: 'input', type: 'text', label: '法定代表人', placeholder: '请输入' },
            { selector: '#contactPhone', id: 'contactPhone', tagName: 'input', type: 'tel', label: '联系电话', placeholder: '请输入' },
            { selector: '#revenue', id: 'revenue', tagName: 'input', type: 'number', label: '营业收入 (万元)', placeholder: '0.00' },
            { selector: '#employeeCount', id: 'employeeCount', tagName: 'input', type: 'number', label: '从业人员数', placeholder: '0' },
          ],
        });
      } else {
        setScrapedData({
          url: data.url,
          title: data.title || fullUrl,
          elements: data.elements || [],
        });
      }
    } catch (err: any) {
      alert(`网络请求异常: ${err.message}`);
    } finally {
      setPageLoading(false);
    }
  }

  // Load sample excel data
  function loadSampleData() {
    setExcelData(SAMPLE_EXCEL_DATA);
    setCurrentRecordIdx(0);
  }

  // Load sample screenshot
  function loadSampleScreenshot() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="15" y="25" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">【台账截图】单位财务年报摘抄</text>
      <line x1="15" y1="35" x2="285" y2="35" stroke="#e2e8f0"/>
      <text x="15" y="55" font-family="sans-serif" font-size="11" fill="#475569">在编人数: 68人</text>
      <text x="15" y="75" font-family="sans-serif" font-size="11" fill="#475569">主营收入: 1850.5 万元</text>
      <text x="15" y="95" font-family="sans-serif" font-size="11" fill="#475569">年末资产: 3420.0 万元</text>
      <text x="15" y="115" font-family="sans-serif" font-size="11" fill="#475569">信用代码: 91310115MA1K5ABC88</text>
      <rect x="15" y="130" width="80" height="20" rx="3" fill="#dbeafe"/>
      <text x="25" y="144" font-family="sans-serif" font-size="10" fill="#1d4ed8">台账盖章属实</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    setLedgerScreenshots([
      {
        id: 'sample_shot_1',
        name: '单位财务与信用台账留存.png',
        url: dataUrl,
      },
    ]);
  }

  // Handle local excel file upload in sandbox
  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/excel', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExcelData({
          fileName: data.fileName,
          headers: data.headers || [],
          rows: data.rows || [],
        });
        setCurrentRecordIdx(0);
      } else {
        alert(data.error || 'Excel解析失败');
      }
    } catch (err: any) {
      alert(`上传失败: ${err.message}`);
    }
  }

  // Switch records (keeps mappings and replaces data values)
  function handlePrevRecord() {
    if (currentRecordIdx > 0) {
      const nextIdx = currentRecordIdx - 1;
      setCurrentRecordIdx(nextIdx);
      syncMappingsWithRecord(nextIdx);
    }
  }

  function handleNextRecord() {
    if (excelData && currentRecordIdx < excelData.rows.length - 1) {
      const nextIdx = currentRecordIdx + 1;
      setCurrentRecordIdx(nextIdx);
      syncMappingsWithRecord(nextIdx);
    }
  }

  function syncMappingsWithRecord(idx: number) {
    if (!excelData || !excelData.rows[idx]) return;
    const record = excelData.rows[idx];
    setMappings((prev) =>
      prev.map((m) => {
        if (record[m.sourceField] !== undefined) {
          return {
            ...m,
            sourceValue: record[m.sourceField],
            fillValue: record[m.sourceField],
          };
        }
        return m;
      })
    );
  }

  // Extract current active form structure on the left (whether preset or custom scraped)
  function extractActiveFormStructure() {
    if (!formContainerRef.current) return [];
    const elements: any[] = [];
    const inputs = formContainerRef.current.querySelectorAll('input, select, textarea');

    inputs.forEach((elem: any) => {
      const id = elem.id;
      const name = elem.name;
      const tag = elem.tagName.toLowerCase();
      const type = elem.type || tag;
      const selector = id ? `#${id}` : `[name="${name}"]`;

      // Find label
      let label = '';
      if (id) {
        const lbl = formContainerRef.current?.querySelector(`label[for="${id}"]`);
        if (lbl) label = (lbl as HTMLElement).innerText.replace(/[*：:\n]/g, '').trim();
      }
      if (!label && elem.placeholder) label = elem.placeholder;
      if (!label) label = name || id;

      // Options
      let options: any[] = [];
      if (tag === 'select') {
        options = Array.from((elem as HTMLSelectElement).options).map((o) => ({
          text: o.text.trim(),
          value: o.value,
        }));
      }

      elements.push({
        selector,
        id,
        name,
        type,
        label,
        options,
        placeholder: elem.placeholder || '',
      });
    });

    return elements;
  }

  // Trigger Analyze
  async function triggerAnalyze() {
    if (!excelData && ledgerScreenshots.length === 0) {
      alert('请先导入 Excel 台账或上传台账截图');
      return;
    }

    setIsAnalyzing(true);
    setFillFeedback(null);

    const formElements = extractActiveFormStructure();
    const currentRowData =
      excelData && excelData.rows[currentRecordIdx] ? excelData.rows[currentRecordIdx] : {};

    try {
      const res = await fetch('/api/form/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formElements,
          rowData: currentRowData,
          ledgerImages: ledgerScreenshots.map((s) => s.url),
          url: targetUrlInput,
          pageTitle: scrapedData?.title || '目标表单系统',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMappings(data.mappings || []);
      } else {
        alert(data.error || '分析失败');
      }
    } catch (err: any) {
      alert(`分析请求异常: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Execute fill in Sandbox using native setter & events (React/Vue controlled compatibility)
  function executeFill() {
    if (mappings.length === 0) {
      alert('请先点击分析表单获取字段映射');
      return;
    }

    setIsFilling(true);
    const newValues = { ...dynamicFormValues };
    const newHighlights: Record<string, boolean> = {};
    const results: any[] = [];
    let successCount = 0;
    let failCount = 0;

    mappings.forEach((m) => {
      const val = m.fillValue;
      const sel = m.targetSelector;

      let success = true;
      let error = '';

      // Direct dynamic mapping key
      const cleanKey = sel.replace(/^[#.[\]= "']+|["']+/g, '');
      newValues[cleanKey] = String(val);

      // Also trigger real DOM element setter
      if (formContainerRef.current) {
        try {
          const elem: any = formContainerRef.current.querySelector(sel);
          if (elem) {
            // Native prototype value setter for controlled components
            let prototype = Object.getPrototypeOf(elem);
            let descriptor = null;
            while (prototype) {
              descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
              if (descriptor && descriptor.set) break;
              prototype = Object.getPrototypeOf(prototype);
            }
            if (descriptor && descriptor.set) {
              descriptor.set.call(elem, String(val));
            } else {
              elem.value = String(val);
            }

            elem.dispatchEvent(new Event('input', { bubbles: true }));
            elem.dispatchEvent(new Event('change', { bubbles: true }));
            newHighlights[sel] = true;
          } else {
            newHighlights[sel] = true; // Still marked
          }
        } catch (e: any) {
          success = false;
          error = e.message;
        }
      }

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      results.push({
        sourceField: m.sourceField,
        targetLabel: m.targetLabel || sel,
        status: success ? 'success' : 'failed',
        error,
      });
    });

    setDynamicFormValues(newValues);
    setHighlightedFields(newHighlights);

    const feedback = {
      total: mappings.length,
      successCount,
      failCount,
      results,
    };
    setFillFeedback(feedback);
    setIsFilling(false);

    // Save task log to backend
    fetch('/api/form/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetUrl: targetUrlInput,
        domain: new URL(targetUrlInput).hostname,
        excelFileName: excelData?.fileName || '在线模拟台账',
        recordIndex: currentRecordIdx + 1,
        totalRecords: excelData?.rows.length || 1,
        mappedFieldsCount: mappings.length,
        successCount,
        failCount,
        details: results.map((r) => ({
          sourceField: r.sourceField,
          sourceValue: '',
          selector: r.targetLabel,
          status: r.status,
          error: r.error,
        })),
      }),
    }).catch(() => {});

    // Clear highlights after 6 seconds
    setTimeout(() => {
      setHighlightedFields({});
    }, 6000);
  }

  // Highlight preview single element
  function previewSingleField(selector: string) {
    setHighlightedFields({ [selector]: true });
    if (formContainerRef.current) {
      const el = formContainerRef.current.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    setTimeout(() => {
      setHighlightedFields({});
    }, 3000);
  }

  const currentRecord = excelData?.rows[currentRecordIdx] || null;
  const activePreset = PRESET_SYSTEMS.find((p) => p.id === currentSystemId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              AI驱动的浏览器表单自动填写助手
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                Manifest V3 + OpenAI SDK
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              任意网址表单识别 · Excel台账解析 · 多模态视觉匹配 · React/Vue受控组件原生注入
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveView('sandbox')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeView === 'sandbox'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              在线仿真填报演练场
            </button>
            <button
              onClick={() => setActiveView('guide')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeView === 'guide'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              插件下载与安装指南
            </button>
          </div>

          {/* Direct Extension Download Button */}
          <a
            href="/api/extension/download"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>下载 Chrome 插件 (ZIP)</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeView === 'guide' ? (
          /* Guide & Documentation Tab */
          <div className="space-y-8 max-w-4xl mx-auto py-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Chrome 插件安装与使用完全指南</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    遵循 Google Chrome Manifest V3 标准，无需商店审核，解压即装即用。
                  </p>
                </div>
                <a
                  href="/api/extension/download"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>立即下载 ZIP 源码包</span>
                </a>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm mb-4">
                    1
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">解压插件源码包</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    点击下载 <code className="text-blue-300">ai-form-autofiller-extension.zip</code>，解压到任意本地目录（内含 manifest.json、content.js 等全部源码）。
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl relative">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4">
                    2
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">开启开发者模式</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    在 Chrome 浏览器地址栏输入 <code className="text-blue-300">chrome://extensions</code>，打开右上角【开发者模式】开关。
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                    3
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">加载已解压程序</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    点击左上角【加载已解压的扩展程序】，选择刚刚解压的目录。完成后在工具栏将插件图标固定，随时可在任何已登录表单页面唤起！
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Live Interactive Sandbox */
          <div className="space-y-4">
            {/* Quick Demo Toolbar */}
            <div className="bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-blue-500/20 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">双屏实训沙箱已就绪</h3>
                  <p className="text-xs text-slate-400">
                    左侧支持【直接输入任意目标网址】动态抓取表单，右侧为【Chrome 插件 SidePanel 控制台】
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={loadSampleData}
                  className="px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>一键导入示例台账 (3条数据)</span>
                </button>
                <button
                  onClick={loadSampleScreenshot}
                  className="px-3.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>加载台账截图</span>
                </button>
                <button
                  onClick={() => {
                    setDynamicFormValues({
                      unitName: '',
                      creditCode: '',
                      legalRepresentative: '',
                      contactPhone: '',
                      employeeCount: '',
                      revenue: '',
                      totalAssets: '',
                      orgType: '',
                      region: '',
                      isHighTech: '否',
                      operationStatus: '正常运营',
                      businessDesc: '',
                    });
                    setHighlightedFields({});
                    setFillFeedback(null);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs transition-colors cursor-pointer"
                  title="重置清空模拟表单"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT 7 COLS: Simulated Target Form Website with DYNAMIC ADDRESS BAR */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                  {/* Dynamic Browser Address Bar */}
                  <div className="bg-slate-950 p-3 border-b border-slate-800 space-y-2.5">
                    {/* Window Controls & Quick Preset Switcher */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500/70 inline-block"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500/70 inline-block"></span>
                        <span className="text-xs font-bold text-slate-300 ml-2">目标表单网页浏览器</span>
                      </div>

                      {/* Presets Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">预设系统表单：</span>
                        <select
                          value={currentSystemId}
                          onChange={(e) => {
                            const sysId = e.target.value;
                            if (sysId === 'custom_external') {
                              setCurrentSystemId('custom_external');
                              setScrapedData(null);
                            } else {
                              const found = PRESET_SYSTEMS.find((p) => p.id === sysId);
                              if (found) {
                                setCurrentSystemId(found.id);
                                setTargetUrlInput(found.url);
                                handleLoadUrl(found.url);
                              }
                            }
                          }}
                          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          {PRESET_SYSTEMS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                          <option value="custom_external">-- 输入任意自定义外部网址 --</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive URL Address Input Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 focus-within:border-blue-500 rounded-xl px-3 py-1.5 text-xs transition-colors">
                        <Globe className="w-3.5 h-3.5 text-blue-400 mr-2 flex-shrink-0" />
                        <span className="text-emerald-400 font-mono select-none mr-0.5">https://</span>
                        <input
                          type="text"
                          value={targetUrlInput.replace(/^https?:\/\//, '')}
                          onChange={(e) => setTargetUrlInput(`https://${e.target.value}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleLoadUrl();
                          }}
                          placeholder="例如: stats.gov.sample.cn/survey/form/enterprise 或自定义网址"
                          className="w-full bg-transparent text-slate-200 focus:outline-none font-mono text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLoadUrl()}
                        disabled={pageLoading}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer flex-shrink-0"
                      >
                        {pageLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                        <span>{pageLoading ? '抓取中...' : '加载页面'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Content: Either Scraped Custom Web Form or Active Preset System */}
                  <div ref={formContainerRef} className="p-6">
                    {/* Header info */}
                    <div className="border-b border-slate-800 pb-4 mb-6 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-400" />
                          <h3 className="text-base font-bold text-white">
                            {scrapedData ? scrapedData.title : activePreset?.name || '在线业务填报系统'}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          当前页面 URL: <span className="text-blue-300 font-mono">{targetUrlInput}</span> ·
                          已成功加载表单结构
                        </p>
                      </div>
                      <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-md font-medium">
                        {scrapedData ? `从外部网址提取 ${scrapedData.elements.length} 项控件` : activePreset?.badge}
                      </span>
                    </div>

                    {/* DYNAMIC FORM RENDER */}
                    {scrapedData ? (
                      /* Custom Scraped External Form View */
                      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span>已成功解析外部网站表单结构！右侧 SidePanel 将自动识别并填充以下动态表单控件。</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {scrapedData.elements.map((elem, idx) => {
                            const fieldKey = elem.id || elem.name || `field_${idx}`;
                            const isHighlighted = highlightedFields[elem.selector] || highlightedFields[`#${elem.id}`];

                            return (
                              <div key={idx} className={elem.tagName === 'textarea' ? 'md:col-span-2' : ''}>
                                <label
                                  htmlFor={elem.id || `field_${idx}`}
                                  className="block text-xs font-semibold text-slate-300 mb-1"
                                >
                                  {elem.label}
                                </label>

                                <div className="relative">
                                  {elem.tagName === 'select' ? (
                                    <select
                                      id={elem.id}
                                      name={elem.name}
                                      value={dynamicFormValues[fieldKey] || ''}
                                      onChange={(e) =>
                                        setDynamicFormValues({ ...dynamicFormValues, [fieldKey]: e.target.value })
                                      }
                                      className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-xs transition-all ${
                                        isHighlighted
                                          ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-400/40 text-amber-200'
                                          : 'border-slate-700 text-slate-100'
                                      }`}
                                    >
                                      <option value="">-- 请选择 --</option>
                                      {elem.options?.map((opt, oIdx) => (
                                        <option key={oIdx} value={opt.value}>
                                          {opt.text}
                                        </option>
                                      ))}
                                    </select>
                                  ) : elem.tagName === 'textarea' ? (
                                    <textarea
                                      id={elem.id}
                                      name={elem.name}
                                      rows={2}
                                      value={dynamicFormValues[fieldKey] || ''}
                                      onChange={(e) =>
                                        setDynamicFormValues({ ...dynamicFormValues, [fieldKey]: e.target.value })
                                      }
                                      placeholder={elem.placeholder || '请输入'}
                                      className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-xs transition-all ${
                                        isHighlighted
                                          ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-400/40 text-amber-200'
                                          : 'border-slate-700 text-slate-100'
                                      }`}
                                    />
                                  ) : (
                                    <input
                                      type={elem.type || 'text'}
                                      id={elem.id}
                                      name={elem.name}
                                      value={dynamicFormValues[fieldKey] || ''}
                                      onChange={(e) =>
                                        setDynamicFormValues({ ...dynamicFormValues, [fieldKey]: e.target.value })
                                      }
                                      placeholder={elem.placeholder || '请输入'}
                                      className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-xs transition-all ${
                                        isHighlighted
                                          ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-400/40 text-amber-200'
                                          : 'border-slate-700 text-slate-100'
                                      }`}
                                    />
                                  )}

                                  {isHighlighted && (
                                    <span className="absolute right-2 top-2 text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                                      ✨ AI已填报
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </form>
                    ) : (
                      /* Preset System Form View */
                      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activePreset?.fields.map((f: any) => {
                            const isHighlighted = highlightedFields[`#${f.id}`] || highlightedFields[`[name="${f.id}"]`];

                            if (f.type === 'textarea') {
                              return (
                                <div key={f.id} className="md:col-span-2">
                                  <label htmlFor={f.id} className="block text-xs font-semibold text-slate-300 mb-1">
                                    {f.required && <span className="text-red-400">* </span>}
                                    {f.label}
                                  </label>
                                  <div className="relative">
                                    <textarea
                                      id={f.id}
                                      name={f.id}
                                      rows={2}
                                      value={dynamicFormValues[f.id] || ''}
                                      onChange={(e) =>
                                        setDynamicFormValues({ ...dynamicFormValues, [f.id]: e.target.value })
                                      }
                                      placeholder={f.placeholder}
                                      className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-xs transition-all ${
                                        isHighlighted
                                          ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-400/40 text-amber-200'
                                          : 'border-slate-700 text-slate-100'
                                      }`}
                                    />
                                    {isHighlighted && (
                                      <span className="absolute right-2 top-2 text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                                        ✨ AI已注入
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            if (f.type === 'select') {
                              return (
                                <div key={f.id}>
                                  <label htmlFor={f.id} className="block text-xs font-semibold text-slate-300 mb-1">
                                    {f.required && <span className="text-red-400">* </span>}
                                    {f.label}
                                  </label>
                                  <div className="relative">
                                    <select
                                      id={f.id}
                                      name={f.id}
                                      value={dynamicFormValues[f.id] || ''}
                                      onChange={(e) =>
                                        setDynamicFormValues({ ...dynamicFormValues, [f.id]: e.target.value })
                                      }
                                      className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-xs transition-all ${
                                        isHighlighted
                                          ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-400/40 text-amber-200'
                                          : 'border-slate-700 text-slate-100'
                                      }`}
                                    >
                                      <option value="">-- 请选择 --</option>
                                      {f.options?.map((opt: string) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                    {isHighlighted && (
                                      <span className="absolute right-6 top-2 text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                                        ✨ AI已注入
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            if (f.type === 'radio') {
                              return (
                                <div key={f.id}>
                                  <span className="block text-xs font-semibold text-slate-300 mb-2">{f.label}</span>
                                  <div className="flex items-center gap-6 text-xs">
                                    {f.options?.map((opt: string) => (
                                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={f.id}
                                          value={opt}
                                          checked={dynamicFormValues[f.id] === opt}
                                          onChange={(e) =>
                                            setDynamicFormValues({ ...dynamicFormValues, [f.id]: e.target.value })
                                          }
                                          className="accent-blue-500"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={f.id}>
                                <label htmlFor={f.id} className="block text-xs font-semibold text-slate-300 mb-1">
                                  {f.required && <span className="text-red-400">* </span>}
                                  {f.label}
                                </label>
                                <div className="relative">
                                  <input
                                    type={f.type || 'text'}
                                    id={f.id}
                                    name={f.id}
                                    value={dynamicFormValues[f.id] || ''}
                                    onChange={(e) =>
                                      setDynamicFormValues({ ...dynamicFormValues, [f.id]: e.target.value })
                                    }
                                    placeholder={f.placeholder}
                                    className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-xs transition-all ${
                                      isHighlighted
                                        ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-400/40 text-amber-200'
                                        : 'border-slate-700 text-slate-100 focus:border-blue-500'
                                    }`}
                                  />
                                  {isHighlighted && (
                                    <span className="absolute right-2 top-2 text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                                      ✨ AI已注入
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT 5 COLS: Embedded SidePanel Extension Simulator */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-900 border-2 border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  {/* Extension Top Bar */}
                  <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-600/30 text-blue-400 rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          AI 表单填写助手 (SidePanel)
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px] block">
                          当前绑定: {new URL(targetUrlInput).hostname}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                      ● 插件已激活
                    </span>
                  </div>

                  <div className="p-4 space-y-4 max-h-[820px] overflow-y-auto">
                    {/* 1. Ledger Upload Section */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>1. 台账数据源</span>
                          <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                            Excel / 截图
                          </span>
                        </h4>
                        {excelData && (
                          <button
                            onClick={() => {
                              setExcelData(null);
                              setLedgerScreenshots([]);
                              setMappings([]);
                            }}
                            className="text-[10px] text-slate-400 hover:text-red-400 underline"
                          >
                            清空
                          </button>
                        )}
                      </div>

                      {/* Excel Card */}
                      {excelData ? (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-bold text-white block truncate">
                                {excelData.fileName}
                              </span>
                              <span className="text-[10px] text-emerald-400">
                                已就绪：共 {excelData.rows.length} 条企业台账
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 p-3 rounded-xl block text-center cursor-pointer transition-colors bg-slate-900/40">
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleExcelUpload}
                            className="hidden"
                          />
                          <FileSpreadsheet className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                          <span className="text-xs text-slate-300 block font-medium">
                            点击或拖入 Excel 台账
                          </span>
                          <span className="text-[10px] text-slate-500">
                            支持 .xlsx / .xls 或点击上方“一键导入示例”
                          </span>
                        </label>
                      )}

                      {/* Screenshot Preview */}
                      {ledgerScreenshots.length > 0 && (
                        <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                              台账截图补充 ({ledgerScreenshots.length} 张)
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {ledgerScreenshots.map((s) => (
                              <div
                                key={s.id}
                                className="w-16 h-12 rounded border border-slate-700 overflow-hidden"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={s.url}
                                  alt={s.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Multi-Record Pager */}
                      {excelData && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="text-xs text-slate-300">
                            待填记录：
                            <strong className="text-blue-400 ml-1">
                              第 {currentRecordIdx + 1} / {excelData.rows.length} 条
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handlePrevRecord}
                              disabled={currentRecordIdx === 0}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs rounded-lg text-slate-300 flex items-center gap-0.5"
                            >
                              <ChevronLeft className="w-3 h-3" />
                              上一条
                            </button>
                            <button
                              onClick={handleNextRecord}
                              disabled={currentRecordIdx >= excelData.rows.length - 1}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs rounded-lg text-slate-300 flex items-center gap-0.5"
                            >
                              下一条
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Record fields preview pill */}
                      {currentRecord && (
                        <div className="text-[11px] bg-slate-900 p-2 rounded-lg text-slate-400">
                          <span className="font-semibold text-slate-300 block mb-1">
                            当前选定单位：{currentRecord['单位名称'] || '未命名'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            统一代码: {currentRecord['统一代码']} | 职工: {currentRecord['职工人数']}人 | 收入: {currentRecord['年营业收入']}万元
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. Analysis Button & Mappings Table */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>2. 表单结构识别与智能映射</span>
                        </h4>
                        <button
                          onClick={triggerAnalyze}
                          disabled={isAnalyzing}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {isAnalyzing ? (
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          )}
                          <span>分析当前表单</span>
                        </button>
                      </div>

                      {/* Mappings Table */}
                      {mappings.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>已生成 {mappings.length} 项智能字段映射</span>
                            <span className="text-emerald-400 text-[10px]">● 大模型语义匹配</span>
                          </div>

                          <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-800 bg-slate-950/80">
                            {mappings.map((m, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 flex items-center justify-between gap-2 text-xs hover:bg-slate-900/60 transition-colors"
                              >
                                <div className="truncate flex-1">
                                  <div className="font-semibold text-white truncate">
                                    {m.sourceField}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    待填值: {String(m.fillValue ?? '')}
                                  </div>
                                </div>

                                <div className="text-right flex items-center gap-2">
                                  <div className="text-right">
                                    <span className="text-[11px] text-blue-300 font-mono block truncate max-w-[120px]">
                                      {m.targetLabel || m.targetSelector}
                                    </span>
                                    <span className="text-[9px] text-slate-500">
                                      {m.elementType || 'input'}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => previewSingleField(m.targetSelector)}
                                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                                    title="在左侧页面高亮定位"
                                  >
                                    <Eye className="w-3 h-3 text-blue-400" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                          点击【分析当前表单】，AI 将自动提取上方页面全部表单控件并精准匹配台账字段
                        </div>
                      )}
                    </div>

                    {/* 3. Execute Fill Button */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <button
                        onClick={executeFill}
                        disabled={mappings.length === 0 || isFilling}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>开始填写当前记录 (注入受控事件)</span>
                      </button>

                      {/* Feedback Box */}
                      {fillFeedback && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              填报执行成功
                            </span>
                            <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                              成功 {fillFeedback.successCount} 项
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            已触发原生 prototype setter 并派发 input/change 事件，左侧表单已闪烁高亮展示！
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span>AI 驱动的浏览器表单自动填写助手</span> · 适用于全国文化/统计/工商等各类复杂审批与申报表单
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Chrome Manifest V3 兼容</span>
          <span>·</span>
          <span>受控组件原生响应</span>
        </div>
      </footer>
    </div>
  );
}
