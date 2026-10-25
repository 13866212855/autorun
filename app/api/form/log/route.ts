import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase, TaskRecord } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetUrl = '未知页面',
      domain = '',
      excelFileName,
      imageFileNames,
      recordIndex = 1,
      totalRecords = 1,
      mappedFieldsCount = 0,
      successCount = 0,
      failCount = 0,
      status = 'success',
      details = [],
    } = body;

    const parsedDomain = domain || (targetUrl.startsWith('http') ? new URL(targetUrl).hostname : 'browser-tab');

    const db = getDatabase();
    const newTask: TaskRecord = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      targetUrl,
      domain: parsedDomain,
      excelFileName,
      imageFileNames,
      recordIndex,
      totalRecords,
      mappedFieldsCount,
      successCount,
      failCount,
      status: failCount > 0 ? (successCount > 0 ? 'partial' : 'failed') : 'success',
      details,
    };

    // Keep the most recent 200 tasks
    db.tasks = [newTask, ...(db.tasks || [])].slice(0, 200);
    saveDatabase(db);

    return NextResponse.json({
      success: true,
      taskId: newTask.id,
      message: '任务填报执行日志已成功归档',
    });
  } catch (err: any) {
    return NextResponse.json({ error: `日志保存失败: ${err.message}` }, { status: 500 });
  }
}
