import { NextRequest, NextResponse } from 'next/server';
import { callOpenAICompatible } from '@/lib/llm';

export interface FormElementMeta {
  selector: string;
  name?: string;
  id?: string;
  type: string;
  label?: string;
  placeholder?: string;
  options?: Array<{ text: string; value: string }>;
  contextText?: string;
  currentValue?: any;
}

export interface AnalyzeRequestBody {
  formElements: FormElementMeta[];
  pageScreenshot?: string; // base64
  rowData?: Record<string, any>;
  ledgerImages?: string[]; // array of base64
  url?: string;
  pageTitle?: string;
}

export interface FieldMapping {
  sourceField: string;
  sourceValue: any;
  targetSelector: string;
  targetLabel: string;
  elementType: string;
  confidence: number;
  fillValue: any;
  expectedOption?: string | null;
  reason?: string;
}

// Built-in intelligent heuristic matcher as fallback or baseline
function heuristicMatch(
  formElements: FormElementMeta[],
  dataRecord: Record<string, any>
): FieldMapping[] {
  const mappings: FieldMapping[] = [];
  const usedSelectors = new Set<string>();

  const normalize = (str: string) =>
    (str || '').toLowerCase().replace(/[\s\-_:：*()（）/]/g, '');

  for (const [key, val] of Object.entries(dataRecord)) {
    if (val === undefined || val === null || val === '') continue;

    const normKey = normalize(key);
    let bestElem: FormElementMeta | null = null;
    let bestScore = 0;
    let expectedOption: string | null = null;

    for (const elem of formElements) {
      if (usedSelectors.has(elem.selector)) continue;

      const normLabel = normalize(elem.label || '');
      const normName = normalize(elem.name || '');
      const normId = normalize(elem.id || '');
      const normPlaceholder = normalize(elem.placeholder || '');
      const normContext = normalize(elem.contextText || '');

      let score = 0;

      // Exact match
      if (normLabel && (normLabel === normKey || normKey.includes(normLabel) || normLabel.includes(normKey))) {
        score = Math.max(score, 0.95);
      }
      if (normName && (normName === normKey || normKey.includes(normName))) {
        score = Math.max(score, 0.85);
      }
      if (normId && (normId === normKey || normKey.includes(normId))) {
        score = Math.max(score, 0.85);
      }
      if (normPlaceholder && normPlaceholder.includes(normKey)) {
        score = Math.max(score, 0.75);
      }
      if (normContext && normContext.includes(normKey)) {
        score = Math.max(score, 0.65);
      }

      // Semantic synonyms for common Chinese statistical forms
      const synonyms: Record<string, string[]> = {
        '单位名称': ['机构名称', '企业名称', '单位全称', '组织名称', '公司名称', '填报单位'],
        '统一社会信用代码': ['统一代码', '信用代码', '税号', '组织机构代码', '注册号', '营业执照号'],
        '法定代表人': ['负责人', '法人代表', '法人', '负责人姓名'],
        '联系电话': ['电话', '手机号码', '手机', '办公电话', '联系方式', '联系人电话'],
        '详细地址': ['住所', '经营地址', '通讯地址', '单位地址', '注册地址', '坐落地址'],
        '成立日期': ['注册时间', '开业时间', '成立时间', '始建年月'],
        '职工人数': ['员工人数', '在编人数', '从业人员', '从业人员数', '期末人数'],
        '资产总计': ['总资产', '年末资产', '资产总额'],
        '营业收入': ['主营业务收入', '年营业额', '收入总计', '销售收入'],
        '机构类型': ['单位性质', '机构类别', '单位类型'],
        '行业门类': ['行业分类', '所属行业', '主营行业'],
        '运营状态': ['营业状态', '经营状态', '现状'],
      };

      for (const [canonical, synList] of Object.entries(synonyms)) {
        const allSyns = [canonical, ...synList];
        const keyMatches = allSyns.some((s) => normKey.includes(normalize(s)));
        if (keyMatches) {
          const targetMatches = allSyns.some(
            (s) =>
              normLabel.includes(normalize(s)) ||
              normName.includes(normalize(s)) ||
              normPlaceholder.includes(normalize(s))
          );
          if (targetMatches) {
            score = Math.max(score, 0.92);
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestElem = elem;

        // If select or radio/checkbox, find best option match
        if (elem.options && elem.options.length > 0) {
          const strVal = String(val).trim();
          const matchOpt = elem.options.find(
            (opt) =>
              normalize(opt.text) === normalize(strVal) ||
              opt.text.includes(strVal) ||
              strVal.includes(opt.text) ||
              opt.value === strVal
          );
          if (matchOpt) {
            expectedOption = matchOpt.text;
            bestScore = Math.max(bestScore, 0.96);
          }
        }
      }
    }

    if (bestElem && bestScore >= 0.5) {
      usedSelectors.add(bestElem.selector);
      mappings.push({
        sourceField: key,
        sourceValue: val,
        targetSelector: bestElem.selector,
        targetLabel: bestElem.label || bestElem.placeholder || bestElem.name || bestElem.id || '表单字段',
        elementType: bestElem.type,
        confidence: Number(bestScore.toFixed(2)),
        fillValue: val,
        expectedOption,
        reason: bestScore >= 0.9 ? '高置信度语义与名称匹配' : '基于语义相似度推断',
      });
    }
  }

  return mappings;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequestBody = await req.json();
    const { formElements = [], pageScreenshot, rowData = {}, ledgerImages = [], url = '', pageTitle = '' } = body;

    if (!Array.isArray(formElements) || formElements.length === 0) {
      return NextResponse.json({ error: '未获取到当前页面的有效表单元素，请确认页面是否包含input/select等表单控件' }, { status: 400 });
    }

    // Prepare system & user prompt for multimodal LLM
    const hasLedgerImages = ledgerImages && ledgerImages.length > 0;
    const hasPageScreenshot = Boolean(pageScreenshot);
    const hasRowData = Object.keys(rowData).length > 0;

    const simplifiedFormElements = formElements.map((el) => ({
      selector: el.selector,
      type: el.type,
      name: el.name,
      id: el.id,
      label: el.label,
      placeholder: el.placeholder,
      options: el.options?.slice(0, 15),
      context: el.contextText?.slice(0, 100),
    }));

    const systemPrompt = `你是一个专业的浏览器表单自动填报AI专家。
任务：将用户的【台账数据】（来自Excel数据行或台账截图表格识别）精准映射到目标网页【表单元素】上。
输入信息包括：
1. 当前表单元素清单（包含selector、type、label、placeholder、options等）
2. 台账数据键值对（若有）
3. (可选) 网页页面截图与台账截图

分析规则：
1. 深入理解政务/统计系统业务术语（如：统一代码对应统一社会信用代码、法人对应法定代表人、职工数对应在编职工人数/从业人员等）。
2. 如果上传了台账截图且未提供Excel或数据不全，请优先从截图中提取出结构化的键值对，与已有数据合并。
3. 对于下拉框(select)或单选(radio)/复选(checkbox)，必须在 mappings 中给出 expectedOption（表单实际支持的选项文本或value），如果台账里的文字有细微差别，请映射到最接近的合法选项。
4. 返回必须是严格合法的 JSON 对象，格式如下：
{
  "extractedImageData": { "识别字段": "值" },
  "mergedData": { "字段": "合并值" },
  "mappings": [
    {
      "sourceField": "统一代码",
      "sourceValue": "12310000400018892K",
      "targetSelector": "#creditCode",
      "targetLabel": "统一社会信用代码",
      "elementType": "text",
      "confidence": 0.98,
      "fillValue": "12310000400018892K",
      "expectedOption": null,
      "reason": "语义完全一致"
    }
  ],
  "unmappedFields": ["未找到对应表单项的字段"],
  "summary": "简述匹配情况"
}
只输出纯JSON，不要包含任何markdown标记外包裹或多余解释。`;

    let userPromptText = `【页面信息】: URL=${url}, 标题=${pageTitle}
【台账当前行数据】:
${JSON.stringify(rowData, null, 2)}

【页面表单元素】(共 ${simplifiedFormElements.length} 个):
${JSON.stringify(simplifiedFormElements, null, 2)}
`;

    if (hasLedgerImages) {
      userPromptText += `\n【提示】: 用户提供了 ${ledgerImages.length} 张台账截图，请同时识别提取图片中的台账字段与数值，并与已有数据结合映射。`;
    }

    // Build multimodal message contents
    const messageContents: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [
      { type: 'text', text: userPromptText }
    ];

    // Add ledger images (if any)
    if (hasLedgerImages) {
      for (const imgUrl of ledgerImages.slice(0, 3)) {
        messageContents.push({
          type: 'image_url',
          image_url: { url: imgUrl }
        });
      }
    }

    // Add page screenshot (if provided)
    if (hasPageScreenshot && pageScreenshot) {
      messageContents.push({
        type: 'image_url',
        image_url: { url: pageScreenshot }
      });
    }

    let parsedResult: any = null;

    try {
      const llmRes = await callOpenAICompatible(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageContents }
        ],
        {
          isVision: hasLedgerImages || hasPageScreenshot,
          temperature: 0.1,
          responseFormatJson: true,
          timeoutMs: 35000,
        }
      );

      // Extract JSON from response
      const rawText = llmRes.text.trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }
    } catch (llmError: any) {
      console.warn('Multimodal LLM call encounter issue, falling back to smart heuristic:', llmError.message);
    }

    // If LLM returned valid mappings, use them, otherwise fallback to heuristic
    if (parsedResult && Array.isArray(parsedResult.mappings) && parsedResult.mappings.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'ai_model',
        extractedImageData: parsedResult.extractedImageData || {},
        mergedData: parsedResult.mergedData || rowData,
        mappings: parsedResult.mappings,
        unmappedFields: parsedResult.unmappedFields || [],
        summary: parsedResult.summary || `AI已完成智能分析，识别出 ${parsedResult.mappings.length} 个字段映射`,
      });
    }

    // Heuristic fallback
    const fallbackMappings = heuristicMatch(formElements, rowData);
    return NextResponse.json({
      success: true,
      source: 'smart_heuristic',
      extractedImageData: {},
      mergedData: rowData,
      mappings: fallbackMappings,
      unmappedFields: Object.keys(rowData).filter((k) => !fallbackMappings.some((m) => m.sourceField === k)),
      summary: `基于字段语义与表单上下文匹配完成，共映射 ${fallbackMappings.length} 个字段`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `表单分析失败: ${err.message}` }, { status: 500 });
  }
}
