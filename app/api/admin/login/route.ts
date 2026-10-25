import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db';
import { signAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: '请输入账号和密码' }, { status: 400 });
    }

    const db = getDatabase();
    if (username !== db.admin.username) {
      return NextResponse.json({ error: '账号或密码错误' }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, db.admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: '账号或密码错误' }, { status: 401 });
    }

    const token = await signAdminToken(username);

    const response = NextResponse.json({
      success: true,
      token,
      user: { username: db.admin.username },
    });

    // Allow cookies to work inside iframes (e.g. AI Studio development environment)
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '登录异常' }, { status: 500 });
  }
}
