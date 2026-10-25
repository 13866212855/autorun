import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase, saveDatabase, maskApiKey } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: '未授权访问，请先登录管理后台' }, { status: 401 });
  }

  const db = getDatabase();
  return NextResponse.json({
    baseUrl: db.config.baseUrl,
    apiKeyMasked: maskApiKey(db.config.apiKey),
    textModel: db.config.textModel,
    imageModel: db.config.imageModel,
    updatedAt: db.config.updatedAt,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: '未授权访问，请先登录管理后台' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { baseUrl, apiKey, textModel, imageModel } = body;

    const db = getDatabase();

    // If apiKey is provided and does not contain masking asterisks, update it
    let newApiKey = db.config.apiKey;
    if (apiKey && typeof apiKey === 'string' && !apiKey.includes('****')) {
      newApiKey = apiKey.trim();
    }

    db.config = {
      baseUrl: (baseUrl || db.config.baseUrl).trim(),
      apiKey: newApiKey,
      textModel: (textModel || db.config.textModel).trim(),
      imageModel: (imageModel || db.config.imageModel).trim(),
      updatedAt: new Date().toISOString(),
    };

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: '大模型配置已更新并持久化保存',
      config: {
        baseUrl: db.config.baseUrl,
        apiKeyMasked: maskApiKey(db.config.apiKey),
        textModel: db.config.textModel,
        imageModel: db.config.imageModel,
        updatedAt: db.config.updatedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '更新配置失败' }, { status: 500 });
  }
}
