import { getDatabase } from './db';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

export interface LLMResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  durationMs: number;
}

export function normalizeBaseUrl(url: string): string {
  if (!url) return 'https://apihub.agnes-ai.com/v1';
  let clean = url.trim().replace(/\/+$/, '');
  // Automatically ensure /v1 endpoint suffix if standard OpenAI format
  if (!clean.endsWith('/v1') && !clean.includes('/v1/')) {
    clean = `${clean}/v1`;
  }
  return clean;
}

export function normalizeModelName(model: string): string {
  if (!model) return 'agnes-2.5-flash';
  const trimmed = model.trim();
  // Agnes AI models must be lowercase
  if (trimmed.toLowerCase().startsWith('agnes-')) {
    return trimmed.toLowerCase();
  }
  return trimmed;
}

export async function fetchAvailableModels(overrideConfig?: {
  baseUrl: string;
  apiKey: string;
}): Promise<{ success: boolean; models: string[]; message?: string }> {
  const db = getDatabase();
  const config = overrideConfig || db.config;
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const endpoint = `${baseUrl}/models`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${(config.apiKey || '').trim()}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        models: [],
        message: `获取模型列表失败 (HTTP ${res.status}): ${errText.slice(0, 180)}`,
      };
    }

    const data = await res.json();
    let modelList: string[] = [];

    if (Array.isArray(data.data)) {
      modelList = data.data.map((m: any) => m.id || m.name).filter(Boolean);
    } else if (Array.isArray(data)) {
      modelList = data.map((m: any) => m.id || m.name || m).filter(Boolean);
    }

    return {
      success: true,
      models: modelList,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      models: [],
      message: err.name === 'AbortError' ? '获取模型列表请求超时' : (err.message || '网络请求异常'),
    };
  }
}

export async function callOpenAICompatible(
  messages: ChatMessage[],
  options?: {
    modelOverride?: string;
    temperature?: number;
    responseFormatJson?: boolean;
    timeoutMs?: number;
    isVision?: boolean;
  }
): Promise<LLMResponse> {
  const db = getDatabase();
  const config = db.config;

  let rawModel = options?.modelOverride || (options?.isVision ? config.imageModel : config.textModel);
  const model = normalizeModelName(rawModel);
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const endpoint = `${baseUrl}/chat/completions`;
  const timeoutMs = options?.timeoutMs || 45000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = Date.now();

  try {
    const payload: Record<string, any> = {
      model,
      messages,
      temperature: options?.temperature ?? 0.1,
    };

    if (options?.responseFormatJson) {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(config.apiKey || '').trim()}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`大模型服务接口返回异常 (HTTP ${res.status}): ${errBody.slice(0, 300)}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';

    return {
      text: content,
      usage: data?.usage,
      durationMs,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;
    if (err.name === 'AbortError') {
      throw new Error(`大模型调用超时 (${Math.round(timeoutMs / 1000)}秒)，请检查网络或后端大模型接口状态`);
    }
    throw new Error(err.message || '大模型请求异常');
  }
}

export async function testModelConnection(overrideConfig?: {
  baseUrl: string;
  apiKey: string;
  textModel: string;
  imageModel: string;
}): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
  reply?: string;
  availableModels?: string[];
  httpStatus?: number;
}> {
  const db = getDatabase();
  const config = overrideConfig || db.config;

  const rawApiKey = (config.apiKey || '').trim();
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const model = normalizeModelName(config.textModel);

  // Validate API Key format
  if (rawApiKey.startsWith('http://') || rawApiKey.startsWith('https://')) {
    return {
      success: false,
      latencyMs: 0,
      message: '输入格式错误：检测到您在“API Key (接口密钥)”中填写了网址。API Key 应为 sk- 开头的密钥字符串，例如 sk-vWM7RHG5n7bljBNi3GgHfygxqiKlUYrPWZLLSUByIGm4BiM9',
    };
  }

  if (!rawApiKey) {
    return {
      success: false,
      latencyMs: 0,
      message: '请输入有效的 API Key 密钥',
    };
  }

  const endpoint = `${baseUrl}/chat/completions`;
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rawApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: '测试连接，请回复：OK' }],
        max_tokens: 20,
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(errText);
      } catch (e) {}

      const errMsg = parsedErr?.error?.message || errText.slice(0, 200) || `HTTP ${res.status}`;

      // Attempt to fetch models to assist user
      const modelsResult = await fetchAvailableModels({ baseUrl, apiKey: rawApiKey });

      let solutionHint = '';
      if (res.status === 404 && errMsg.includes('model_not_found')) {
        solutionHint = `模型名称 [${model}] 在当前分组不可用。请将模型名称改为可用模型（如 agnes-2.5-flash）。`;
      } else if (res.status === 401 || res.status === 403) {
        solutionHint = 'API Key 鉴权失败，请检查密钥是否准确复制、是否有多余空格。';
      }

      return {
        success: false,
        latencyMs,
        httpStatus: res.status,
        message: `HTTP ${res.status}: ${errMsg} ${solutionHint ? `\n💡 建议：${solutionHint}` : ''}`,
        availableModels: modelsResult.models,
      };
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content || 'OK';

    return {
      success: true,
      latencyMs,
      httpStatus: 200,
      message: `大模型通信测试成功！响应耗时 ${latencyMs}ms`,
      reply: reply.trim(),
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: err.name === 'AbortError' ? '连接超时(>25s)，请检查 Base URL 是否可访问' : (err.message || '网络连接异常'),
    };
  }
}
