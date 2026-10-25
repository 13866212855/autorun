import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { fetchAvailableModels } from '@/lib/llm';
import { getDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: '未授权访问，请先登录管理后台' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { baseUrl, apiKey } = body;

    const db = getDatabase();
    const configToUse = {
      baseUrl: (baseUrl || db.config.baseUrl).trim(),
      apiKey: apiKey && !apiKey.includes('****') ? apiKey.trim() : db.config.apiKey,
    };

    const result = await fetchAvailableModels(configToUse);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, models: [], message: err.message || '获取模型列表异常' },
      { status: 500 }
    );
  }
}
