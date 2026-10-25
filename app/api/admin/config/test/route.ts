import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { testModelConnection } from '@/lib/llm';
import { getDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json().catch(() => ({}));
    const { baseUrl, apiKey, textModel, imageModel } = body;

    // If user is not authenticated and did not pass direct test credentials, require login
    if (!user && (!baseUrl || !apiKey)) {
      return NextResponse.json(
        {
          success: false,
          latencyMs: 0,
          message: '未检测到有效登录凭证，请先登录后台或传入完整的 Base URL 与 API Key。',
        },
        { status: 401 }
      );
    }

    const db = getDatabase();
    const testConfig = {
      baseUrl: (baseUrl || db.config.baseUrl).trim(),
      apiKey: apiKey && !apiKey.includes('****') ? apiKey.trim() : db.config.apiKey,
      textModel: (textModel || db.config.textModel).trim(),
      imageModel: (imageModel || db.config.imageModel).trim(),
    };

    const result = await testModelConnection(testConfig);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, latencyMs: 0, message: `测试连接过程发生未知错误: ${err.message || '未知异常'}` },
      { status: 200 }
    );
  }
}
