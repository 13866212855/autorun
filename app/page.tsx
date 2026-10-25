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
    id: 'tjxt_education',
    name: '教育事业综合统计调查_2026 (全国教育统计管理信息采集系统)',
    url: 'https://tjxt.moe.edu.cn/collections/?_t=6ab53f8b994bc000d9d67b3a#/pageGather',
    badge: '教基3115 · 教育部统发',
    isEducationTable: true,
    schoolType: '完全中学',
    fields: [
      { id: 'edu_r02_c03', label: '普通初中班 - 毕业生数', type: 'number', placeholder: '0' },
      { id: 'edu_r02_c04', label: '普通初中班 - 招生数', type: 'number', placeholder: '0' },
      { id: 'edu_r02_c05', label: '普通初中班 - 在校生数(合计)', type: 'number', placeholder: '0' },
      { id: 'edu_r02_c06', label: '普通初中班 - 在校生数(女)', type: 'number', placeholder: '0' },
      { id: 'edu_r02_c07', label: '普通初中班 - 在校生数(一年级)', type: 'number', placeholder: '0' },
      { id: 'edu_r02_c08', label: '普通初中班 - 在校生数(二年级)', type: 'number', placeholder: '0' },
      { id: 'edu_r02_c09', label: '普通初中班 - 在校生数(三年级)', type: 'number', placeholder: '0' },
      { id: 'edu_r02_c10', label: '普通初中班 - 预计毕业生数', type: 'number', placeholder: '0' },
      { id: 'edu_r03_c03', label: '职业初中班 - 毕业生数', type: 'number', placeholder: '0' },
      { id: 'edu_r03_c04', label: '职业初中班 - 招生数', type: 'number', placeholder: '0' },
      { id: 'edu_r03_c05', label: '职业初中班 - 在校生数(合计)', type: 'number', placeholder: '0' },
      { id: 'edu_r03_c06', label: '职业初中班 - 在校生数(女)', type: 'number', placeholder: '0' },
      { id: 'edu_r03_c07', label: '职业初中班 - 在校生数(一年级)', type: 'number', placeholder: '0' },
      { id: 'edu_r03_c08', label: '职业初中班 - 在校生数(二年级)', type: 'number', placeholder: '0' },
      { id: 'edu_r03_c09', label: '职业初中班 - 在校生数(三年级)', type: 'number', placeholder: '0' },
      { id: 'edu_r03_c10', label: '职业初中班 - 预计毕业生数', type: 'number', placeholder: '0' },
    ],
  },
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

// Education statistics sample ledger matching tjxt.moe.edu.cn (全国教育事业综合统计调查)
const SAMPLE_EDUCATION_EXCEL_DATA = {
  fileName: '2026学年某完全中学初中部分类学生数基础台账.xlsx',
  headers: [
    '指标分类',
    '代码',
    '毕业生数',
    '招生数',
    '在校生数_合计',
    '在校生数_女',
    '在校生数_一年级',
    '在校生数_二年级',
    '在校生数_三年级',
    '预计毕业生数',
  ],
  rows: [
    {
      '指标分类': '普通初中班',
      '代码': '02',
      '毕业生数': '245',
      '招生数': '260',
      '在校生数_合计': '768',
      '在校生数_女': '372',
      '在校生数_一年级': '260',
      '在校生数_二年级': '255',
      '在校生数_三年级': '253',
      '预计毕业生数': '253',
    },
    {
      '指标分类': '职业初中班',
      '代码': '03',
      '毕业生数': '35',
      '招生数': '40',
      '在校生数_合计': '110',
      '在校生数_女': '48',
      '在校生数_一年级': '40',
      '在校生数_二年级': '38',
      '在校生数_三年级': '32',
      '预计毕业生数': '32',
    },
    {
      '指标分类': '特殊教育班',
      '代码': '04',
      '毕业生数': '8',
      '招生数': '10',
      '在校生数_合计': '26',
      '在校生数_女': '11',
      '在校生数_一年级': '10',
      '在校生数_二年级': '9',
      '在校生数_三年级': '7',
      '预计毕业生数': '7',
    },
  ],
};

export default function HomePage() {
  // Navigation View
  const [activeView, setActiveView] = useState<'sandbox' | 'guide'>('sandbox');

  // Address Bar URL & Dynamic Target Page State
  const [targetUrlInput, setTargetUrlInput] = useState('https://stats.gov.sample.cn/survey/form/enterprise');
  const [currentSystemId, setCurrentSystemId] = useState<string>('culture_enterprise');
  const [leftViewMode, setLeftViewMode] = useState<'form' | 'iframe' | 'paste'>('form');
  const [pasteHtmlInput, setPasteHtmlInput] = useState('');
  const [educationActiveTab, setEducationActiveTab] = useState('教基3115');
  const [isSpaEmpty, setIsSpaEmpty] = useState(false);
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
    // 教育统计默认初值
    edu_r01_c03: '288',
    edu_r01_c04: '310',
    edu_r01_c05: '904',
    edu_r01_c06: '431',
    edu_r01_c07: '310',
    edu_r01_c08: '302',
    edu_r01_c09: '292',
    edu_r01_c10: '292',
    edu_r02_c03: '',
    edu_r02_c04: '',
    edu_r02_c05: '',
    edu_r02_c06: '',
    edu_r02_c07: '',
    edu_r02_c08: '',
    edu_r02_c09: '',
    edu_r02_c10: '',
    edu_r03_c03: '',
    edu_r03_c04: '',
    edu_r03_c05: '',
    edu_r03_c06: '',
    edu_r03_c07: '',
    edu_r03_c08: '',
    edu_r03_c09: '',
    edu_r03_c10: '',
    edu_r04_c03: '',
    edu_r04_c04: '',
    edu_r04_c05: '',
    edu_r04_c06: '',
    edu_r04_c07: '',
    edu_r04_c08: '',
    edu_r04_c09: '',
    edu_r04_c10: '',
    edu_r05_c03: '',
    edu_r05_c04: '',
    edu_r05_c05: '',
    edu_r05_c06: '',
    edu_r05_c07: '',
    edu_r05_c08: '',
    edu_r05_c09: '',
    edu_r05_c10: '',
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

    // Check if matches education statistics system (tjxt.moe.edu.cn)
    if (
      fullUrl.includes('tjxt.moe.edu.cn') ||
      fullUrl.includes('moe.edu.cn') ||
      fullUrl.includes('pageGather') ||
      fullUrl.includes('collections/?_t=')
    ) {
      setCurrentSystemId('tjxt_education');
      setScrapedData(null);
      setIsSpaEmpty(false);
      setTargetUrlInput(fullUrl);
      setPageLoading(false);
      return;
    }

    // Check if matches one of our preset systems
    const matchedPreset = PRESET_SYSTEMS.find((p) => p.url === fullUrl || fullUrl.includes(p.id));
    if (matchedPreset) {
      setCurrentSystemId(matchedPreset.id);
      setScrapedData(null);
      setIsSpaEmpty(false);
      setTargetUrlInput(matchedPreset.url);
      setPageLoading(false);
      return;
    }

    // Otherwise, it's an external custom URL: scrape and extract form elements live via backend!
    setCurrentSystemId('custom_external');
    setIsSpaEmpty(false);
    try {
      const res = await fetch('/api/proxy/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIsSpaEmpty(true);
        setScrapedData({
          url: fullUrl,
          title: `目标表单: ${fullUrl}`,
          elements: [],
        });
      } else {
        const elems = data.elements || [];
        if (elems.length === 0) {
          setIsSpaEmpty(true);
        }
        setScrapedData({
          url: data.url,
          title: data.title || fullUrl,
          elements: elems,
        });
      }
    } catch (err: any) {
      setIsSpaEmpty(true);
      setScrapedData({
        url: fullUrl,
        title: `目标表单: ${fullUrl}`,
        elements: [],
      });
    } finally {
      setPageLoading(false);
    }
  }

  // Load sample excel data (Culture Enterprise)
  function loadSampleData() {
    setExcelData(SAMPLE_EXCEL_DATA);
    setCurrentRecordIdx(0);
  }

  // Load Education statistics sample data (tjxt.moe.edu.cn 教基3115)
  function loadEducationSampleData() {
    setExcelData(SAMPLE_EDUCATION_EXCEL_DATA);
    setCurrentRecordIdx(0);
    setCurrentSystemId('tjxt_education');
    setTargetUrlInput('https://tjxt.moe.edu.cn/collections/?_t=6ab53f8b994bc000d9d67b3a#/pageGather');
    setScrapedData(null);
    setIsSpaEmpty(false);
  }

  // Parse pasted HTML into form elements
  function handleParsePastedHtml() {
    if (!pasteHtmlInput.trim()) {
      alert('请先粘贴 HTML 代码片段');
      return;
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(pasteHtmlInput, 'text/html');
      const inputElems = doc.querySelectorAll('input:not([type="hidden"]), select, textarea');
      const parsed: ScrapedFormElement[] = [];

      inputElems.forEach((elem, idx) => {
        const id = elem.id || `pasted_elem_${idx}`;
        const name = elem.getAttribute('name') || '';
        const tag = elem.tagName.toLowerCase();
        const type = elem.getAttribute('type') || tag;
        const selector = id ? `#${id}` : `[name="${name}"]`;
        let label =
          elem.getAttribute('placeholder') ||
          elem.getAttribute('title') ||
          elem.getAttribute('aria-label') ||
          name ||
          id;

        const prev = elem.previousElementSibling;
        if (prev && ['LABEL', 'SPAN', 'TH', 'TD'].includes(prev.tagName)) {
          label = (prev as HTMLElement).innerText.trim() || label;
        }

        parsed.push({
          selector,
          id,
          name,
          tagName: tag,
          type,
          label,
          placeholder: elem.getAttribute('placeholder') || '',
        });
      });

      if (parsed.length === 0) {
        alert('未在粘贴的内容中找到 input/select/textarea 控件，请确认粘贴的是包含输入框的 HTML 代码');
        return;
      }

      setScrapedData({
        url: targetUrlInput,
        title: `已从粘贴代码提取 ${parsed.length} 项控件`,
        elements: parsed,
      });
      setCurrentSystemId('custom_external');
      setLeftViewMode('form');
      setIsSpaEmpty(false);
    } catch (e: any) {
      alert(`解析失败: ${e.message}`);
    }
  }

  // Helper for Education Table: Fill all empty numeric inputs with 0
  function handleEduFillZeros() {
    const updated = { ...dynamicFormValues };
    const cols = ['c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10'];
    const rows = ['r01', 'r02', 'r03', 'r04', 'r05'];
    rows.forEach((r) => {
      cols.forEach((c) => {
        const k = `edu_${r}_${c}`;
        if (!updated[k] || updated[k] === '') {
          updated[k] = '0';
        }
      });
    });
    setDynamicFormValues(updated);
  }

  // Helper for Education Table: Auto sum rows (r02 + r03 + r04 + r05) into r01 (计)
  function handleEduCalculate() {
    const updated = { ...dynamicFormValues };
    const cols = ['c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10'];
    cols.forEach((c) => {
      let sum = 0;
      ['r02', 'r03', 'r04', 'r05'].forEach((r) => {
        const v = Number(updated[`edu_${r}_${c}`]) || 0;
        sum += v;
      });
      updated[`edu_r01_${c}`] = String(sum);
    });
    setDynamicFormValues(updated);
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
      let label = elem.getAttribute('data-label') || '';
      if (!label && id) {
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
        domain: (() => { try { return new URL(targetUrlInput).hostname; } catch { return targetUrlInput; } })(),
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

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={loadEducationSampleData}
                  className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="自动加载教育事业统计(教基3115)调查表及初中分类学生数台账"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>教育统计示例台账 (教基3115)</span>
                </button>
                <button
                  onClick={loadSampleData}
                  className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  <span>文化企业综合台账 (文统综1号)</span>
                </button>
                <button
                  onClick={loadSampleScreenshot}
                  className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>台账截图</span>
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
                      edu_r01_c03: '0',
                      edu_r01_c04: '0',
                      edu_r01_c05: '0',
                      edu_r01_c06: '0',
                      edu_r01_c07: '0',
                      edu_r01_c08: '0',
                      edu_r01_c09: '0',
                      edu_r01_c10: '0',
                      edu_r02_c03: '',
                      edu_r02_c04: '',
                      edu_r02_c05: '',
                      edu_r02_c06: '',
                      edu_r02_c07: '',
                      edu_r02_c08: '',
                      edu_r02_c09: '',
                      edu_r02_c10: '',
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
                    {/* Window Controls & View Mode Tabs & Presets */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500/70 inline-block"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500/70 inline-block"></span>
                        <span className="text-xs font-bold text-slate-300 ml-1">目标系统浏览器</span>
                      </div>

                      {/* View Mode Switcher */}
                      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setLeftViewMode('form')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                            leftViewMode === 'form'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          📑 交互表单视图
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeftViewMode('iframe')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                            leftViewMode === 'iframe'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          🌐 实时网页反代内嵌
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeftViewMode('paste')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                            leftViewMode === 'paste'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          📋 粘贴DOM代码
                        </button>
                      </div>

                      {/* Presets Dropdown */}
                      <div className="flex items-center gap-1.5">
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
                          <option value="custom_external">-- 自定义外部网址 --</option>
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
                          placeholder="输入任意目标网址，如: tjxt.moe.edu.cn/collections/?_t=..."
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
                        <span>{pageLoading ? '加载中...' : '加载页面'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. VIEW MODE: IFRAME REVERSE PROXY */}
                  {leftViewMode === 'iframe' && (
                    <div className="flex flex-col">
                      <div className="p-3 bg-blue-950/40 border-b border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-400" />
                          <span>已通过反向代理穿透 X-Frame-Options 嵌入该网址：</span>
                          <code className="text-blue-200 font-mono bg-blue-900/40 px-1.5 py-0.5 rounded">
                            {targetUrlInput}
                          </code>
                        </span>
                        <button
                          type="button"
                          onClick={() => setLeftViewMode('form')}
                          className="text-[11px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg"
                        >
                          切换到高真交互表单
                        </button>
                      </div>

                      <div className="w-full h-[660px] bg-white relative">
                        <iframe
                          src={`/api/proxy/view?url=${encodeURIComponent(targetUrlInput)}`}
                          className="w-full h-full border-0"
                          title="目标网页实时反代内嵌"
                          sandbox="allow-same-origin allow-scripts allow-forms"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. VIEW MODE: PASTE HTML INSPECTOR */}
                  {leftViewMode === 'paste' && (
                    <div className="p-6 space-y-4">
                      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-white">
                          <Code2 className="w-4 h-4 text-blue-400" />
                          <span>从目标页面 F12 复制粘贴 HTML 代码快速提取控件</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          对于需要专用内网或登录的复杂统计系统，您可以在原标签页按{' '}
                          <code className="text-blue-300 font-mono">F12</code> 打开控制台，在 Elements
                          面板中右键表单或表格标签，选择 <strong>Copy &gt; Copy outerHTML</strong>
                          ，粘贴到下方即可瞬间解析全部输入控件：
                        </p>
                        <textarea
                          rows={8}
                          value={pasteHtmlInput}
                          onChange={(e) => setPasteHtmlInput(e.target.value)}
                          placeholder="在此处粘贴包含 input / select / textarea / table 的 HTML 代码片段..."
                          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            解析器将自动提取 id, name, placeholder, label 及表格行列标签
                          </span>
                          <button
                            type="button"
                            onClick={handleParsePastedHtml}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>立即解析并生成表单</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. VIEW MODE: INTERACTIVE FORM (Education System 1:1, Scraped Form, or Presets) */}
                  {leftViewMode === 'form' && (
                    <div ref={formContainerRef} className="p-6">
                      {/* EDUCATION SYSTEM 1:1 PRESET (tjxt.moe.edu.cn) */}
                      {currentSystemId === 'tjxt_education' ? (
                        <div className="space-y-4">
                          {/* Top Education System Header */}
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-base font-bold text-white">
                                  教育事业综合统计调查_2026
                                </h3>
                                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-medium">
                                  教育部教育统计管理信息采集系统
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                                <span>办学类型：<strong className="text-slate-200">完全中学</strong></span>
                                <span>·</span>
                                <span>填报状态：<strong className="text-emerald-400">采集录入中</strong></span>
                                <span>·</span>
                                <span>调查表号：<strong className="text-amber-300 font-mono">教基3115</strong></span>
                              </div>
                            </div>

                            <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg">
                              教基3115 · 全国教育部统发
                            </span>
                          </div>

                          {/* Action Toolbar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              >
                                导出选中报表
                              </button>
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              >
                                EXCEL导入
                              </button>
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:bg-blue-600/50 rounded-lg text-xs font-medium"
                              >
                                保存
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = { ...dynamicFormValues };
                                  ['r01', 'r02', 'r03', 'r04', 'r05'].forEach((r) => {
                                    ['c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10'].forEach((c) => {
                                      updated[`edu_${r}_${c}`] = '';
                                    });
                                  });
                                  setDynamicFormValues(updated);
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs"
                              >
                                清除
                              </button>
                              <button
                                type="button"
                                onClick={handleEduFillZeros}
                                className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                                title="对表格内所有未填写的空单元格一键补 0"
                              >
                                一键补0
                              </button>
                              <button
                                type="button"
                                onClick={handleEduCalculate}
                                className="px-2.5 py-1 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                                title="自动将普通初中班、职业初中班等行数据合计汇总至第01行【计】"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>自动计算(求和)</span>
                              </button>
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              >
                                查错
                              </button>
                            </div>

                            <span className="text-[11px] text-slate-400">
                              单位：人
                            </span>
                          </div>

                          {/* Navigation Sub-Tabs */}
                          <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto text-xs pb-1">
                            {[
                              { id: '教基3115', label: '教基3115 初中分类学生数' },
                              { id: '教基1001', label: '教基1001 学校基本情况' },
                              { id: '教基1102', label: '教基1102 校舍资产与图书' },
                              { id: '教基2107', label: '教基2107 专任教师学历与职务' },
                              { id: '教基封面', label: '教基封面' },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setEducationActiveTab(tab.id)}
                                className={`px-3 py-1.5 rounded-t-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                                  educationActiveTab === tab.id
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* 2-Tier Grid Matrix Table: 教基3115 */}
                          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950/60">
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800 text-center font-bold">
                                  <th rowSpan={2} className="p-2 border-r border-slate-800 whitespace-nowrap w-28">
                                    指标名称
                                  </th>
                                  <th rowSpan={2} className="p-2 border-r border-slate-800 whitespace-nowrap w-12">
                                    代码
                                  </th>
                                  <th rowSpan={2} className="p-2 border-r border-slate-800 whitespace-nowrap w-24">
                                    毕业生数
                                  </th>
                                  <th rowSpan={2} className="p-2 border-r border-slate-800 whitespace-nowrap w-24">
                                    招生数
                                  </th>
                                  <th colSpan={5} className="p-1.5 border-r border-slate-800 whitespace-nowrap">
                                    在校生数
                                  </th>
                                  <th rowSpan={2} className="p-2 whitespace-nowrap w-24">
                                    预计毕业生数
                                  </th>
                                </tr>
                                <tr className="bg-slate-900/70 text-slate-400 border-b border-slate-800 text-center text-[11px]">
                                  <th className="p-1 border-r border-slate-800 w-20">合计 (1)</th>
                                  <th className="p-1 border-r border-slate-800 w-20">女 (2)</th>
                                  <th className="p-1 border-r border-slate-800 w-20">一年级 (3)</th>
                                  <th className="p-1 border-r border-slate-800 w-20">二年级 (4)</th>
                                  <th className="p-1 border-r border-slate-800 w-20">三年级 (5)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                {[
                                  { id: 'r01', code: '01', name: '计', isTotal: true },
                                  { id: 'r02', code: '02', name: '普通初中班', isTotal: false },
                                  { id: 'r03', code: '03', name: '职业初中班', isTotal: false },
                                  { id: 'r04', code: '04', name: '特殊教育班', isTotal: false },
                                  { id: 'r05', code: '05', name: '附设初中班', isTotal: false },
                                ].map((row) => {
                                  const cols = [
                                    { id: 'c03', name: '毕业生数' },
                                    { id: 'c04', name: '招生数' },
                                    { id: 'c05', name: '在校生数(合计)' },
                                    { id: 'c06', name: '在校生数(女)' },
                                    { id: 'c07', name: '在校生数(一年级)' },
                                    { id: 'c08', name: '在校生数(二年级)' },
                                    { id: 'c09', name: '在校生数(三年级)' },
                                    { id: 'c10', name: '预计毕业生数' },
                                  ];

                                  return (
                                    <tr
                                      key={row.id}
                                      className={`hover:bg-slate-900/40 transition-colors ${
                                        row.isTotal ? 'bg-slate-900/50 font-semibold' : ''
                                      }`}
                                    >
                                      <td className="p-2 border-r border-slate-800 text-slate-200 whitespace-nowrap font-medium text-center">
                                        {row.name}
                                      </td>
                                      <td className="p-2 border-r border-slate-800 text-slate-400 text-center font-mono text-[11px]">
                                        {row.code}
                                      </td>
                                      {cols.map((col) => {
                                        const cellId = `edu_${row.id}_${col.id}`;
                                        const labelText = `${row.name} - ${col.name}`;
                                        const isHighlighted =
                                          highlightedFields[`#${cellId}`] ||
                                          highlightedFields[cellId] ||
                                          highlightedFields[`[id="${cellId}"]`];

                                        return (
                                          <td
                                            key={col.id}
                                            className="p-1 border-r border-slate-800 last:border-r-0 relative"
                                          >
                                            <input
                                              type="number"
                                              id={cellId}
                                              name={cellId}
                                              data-label={labelText}
                                              value={dynamicFormValues[cellId] ?? ''}
                                              onChange={(e) =>
                                                setDynamicFormValues({
                                                  ...dynamicFormValues,
                                                  [cellId]: e.target.value,
                                                })
                                              }
                                              placeholder="0"
                                              className={`w-full text-center px-1.5 py-1.5 bg-slate-950 border rounded-lg text-xs font-mono transition-all ${
                                                isHighlighted
                                                  ? 'border-amber-400 bg-amber-500/25 ring-2 ring-amber-400 text-amber-200 font-bold'
                                                  : 'border-slate-800 text-slate-200 focus:border-blue-500 focus:bg-slate-900'
                                              }`}
                                            />
                                            {isHighlighted && (
                                              <span className="absolute -top-1 right-0 text-[8px] bg-amber-500 text-slate-950 font-bold px-1 rounded shadow">
                                                ✨AI已填
                                              </span>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                            <span>
                              💡 填报指引：右侧点击【分析当前表单】后，AI 将自动把台账中的指标对应填入上述单元格，并支持【一键补0】与【自动求和计算】。
                            </span>
                          </div>
                        </div>
                      ) : scrapedData ? (
                        /* SCRAPED EXTERNAL FORM VIEW OR SPA DIAGNOSTIC CARD */
                        scrapedData.elements.length === 0 ? (
                          /* SPA EMPTY DIAGNOSIS CARD */
                          <div className="space-y-4">
                            <div className="p-5 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border border-amber-500/30 rounded-2xl space-y-4 shadow-xl">
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl flex-shrink-0 mt-0.5">
                                  <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-white">
                                    目标系统为客户端动态渲染单页应用 (SPA) 或需要登录身份
                                  </h4>
                                  <p className="text-xs text-slate-300 leading-relaxed">
                                    当前输入的网址 <code className="text-amber-300 font-mono">{targetUrlInput}</code>{' '}
                                    属于政务/统计类单页系统（Vue/React SPA，包含 <code className="text-amber-300 font-mono">_t=...</code> 会话 Token）。
                                    无状态的静态网络爬虫无法在未携带您的登录 Cookie/会话的情况下，在后台执行前端 JavaScript 渲染出内部动态表单。
                                  </p>
                                </div>
                              </div>

                              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                                <span className="text-xs font-bold text-slate-200 block">
                                  已为您准备以下 3 种即开即用的解决方案：
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                  <button
                                    type="button"
                                    onClick={loadEducationSampleData}
                                    className="p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-left cursor-pointer transition-colors"
                                  >
                                    <div className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1">
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span>方案一：1:1 统计仿真表</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 block">
                                      直接切换到 1:1 教育部教育统计综合调查(教基3115)真实表单演练
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setLeftViewMode('iframe')}
                                    className="p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-left cursor-pointer transition-colors"
                                  >
                                    <div className="text-xs font-bold text-blue-300 mb-1 flex items-center gap-1">
                                      <Globe className="w-3.5 h-3.5" />
                                      <span>方案二：实时反代内嵌</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 block">
                                      在左侧内嵌反向代理穿透后的完整网页
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setLeftViewMode('paste')}
                                    className="p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-left cursor-pointer transition-colors"
                                  >
                                    <div className="text-xs font-bold text-purple-300 mb-1 flex items-center gap-1">
                                      <Code2 className="w-3.5 h-3.5" />
                                      <span>方案三：粘贴 DOM 提取</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 block">
                                      从您已登录的网页 F12 复制表单 HTML 直接导入
                                    </span>
                                  </button>
                                </div>
                              </div>

                              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                                <span className="font-semibold text-slate-300 block mb-0.5">
                                  🌟 Chrome 插件实战提示（核心生产方式）：
                                </span>
                                本项目的 Chrome 插件设计正是为了解决这一场景！您只需在 Chrome 扩展管理中加载解压后的插件，直接在您当前已登录教育统计系统的标签页中打开插件 SidePanel，点击【分析表单】，插件便能直接在您当前运行中的原生 DOM 里一键抓取并高亮填报！
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Scraped Elements List */
                          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <span>已成功解析外部网站表单结构！右侧 SidePanel 将自动识别并填充以下动态表单控件。</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {scrapedData.elements.map((elem, idx) => {
                                const fieldKey = elem.id || elem.name || `field_${idx}`;
                                const isHighlighted =
                                  highlightedFields[elem.selector] || highlightedFields[`#${elem.id}`];

                                return (
                                  <div
                                    key={idx}
                                    className={elem.tagName === 'textarea' ? 'md:col-span-2' : ''}
                                  >
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
                                            setDynamicFormValues({
                                              ...dynamicFormValues,
                                              [fieldKey]: e.target.value,
                                            })
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
                                            setDynamicFormValues({
                                              ...dynamicFormValues,
                                              [fieldKey]: e.target.value,
                                            })
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
                                            setDynamicFormValues({
                                              ...dynamicFormValues,
                                              [fieldKey]: e.target.value,
                                            })
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
                        )
                      ) : (
                        /* Standard Preset Form View */
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activePreset?.fields.map((f: any) => {
                              const isHighlighted =
                                highlightedFields[`#${f.id}`] || highlightedFields[`[name="${f.id}"]`];

                              if (f.type === 'textarea') {
                                return (
                                  <div key={f.id} className="md:col-span-2">
                                    <label
                                      htmlFor={f.id}
                                      className="block text-xs font-semibold text-slate-300 mb-1"
                                    >
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
                                          setDynamicFormValues({
                                            ...dynamicFormValues,
                                            [f.id]: e.target.value,
                                          })
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
                                    <label
                                      htmlFor={f.id}
                                      className="block text-xs font-semibold text-slate-300 mb-1"
                                    >
                                      {f.required && <span className="text-red-400">* </span>}
                                      {f.label}
                                    </label>
                                    <div className="relative">
                                      <select
                                        id={f.id}
                                        name={f.id}
                                        value={dynamicFormValues[f.id] || ''}
                                        onChange={(e) =>
                                          setDynamicFormValues({
                                            ...dynamicFormValues,
                                            [f.id]: e.target.value,
                                          })
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
                                    <span className="block text-xs font-semibold text-slate-300 mb-2">
                                      {f.label}
                                    </span>
                                    <div className="flex items-center gap-6 text-xs">
                                      {f.options?.map((opt: string) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-2 cursor-pointer"
                                        >
                                          <input
                                            type="radio"
                                            name={f.id}
                                            value={opt}
                                            checked={dynamicFormValues[f.id] === opt}
                                            onChange={(e) =>
                                              setDynamicFormValues({
                                                ...dynamicFormValues,
                                                [f.id]: e.target.value,
                                              })
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
                                  <label
                                    htmlFor={f.id}
                                    className="block text-xs font-semibold text-slate-300 mb-1"
                                  >
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
                                        setDynamicFormValues({
                                          ...dynamicFormValues,
                                          [f.id]: e.target.value,
                                        })
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
                  )}
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
                          当前绑定: {(() => { try { return new URL(targetUrlInput).hostname; } catch { return targetUrlInput; } })()}
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
                            当前选定：{currentRecord['单位名称'] || currentRecord['指标分类'] || '未命名记录'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {currentRecord['统一代码']
                              ? `统一代码: ${currentRecord['统一代码']} | 职工: ${currentRecord['职工人数']}人 | 收入: ${currentRecord['年营业收入']}万元`
                              : `代码: ${currentRecord['代码']} | 毕业生: ${currentRecord['毕业生数']} | 招生: ${currentRecord['招生数']} | 在校生: ${currentRecord['在校生数_合计']}`}
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
