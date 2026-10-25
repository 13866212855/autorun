import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: '未授权访问，请先登录管理后台' }, { status: 401 });
  }

  const db = getDatabase();
  // Return tasks sorted by timestamp descending
  const sortedTasks = [...(db.tasks || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({
    tasks: sortedTasks,
    total: sortedTasks.length,
  });
}
