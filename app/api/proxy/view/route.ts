import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');

  if (!urlParam) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  let targetUrl = urlParam.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let html = await res.text();
    const parsedUrl = new URL(targetUrl);
    const origin = parsedUrl.origin;

    // Remove frame-busting scripts & CSP meta tags
    html = html.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
    html = html.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');

    // Inject base href so relative images/css/js load correctly
    const baseTag = `<base href="${origin}${parsedUrl.pathname.substring(0, parsedUrl.pathname.lastIndexOf('/') + 1)}">`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`);
    } else {
      html = `${baseTag}${html}`;
    }

    return new NextResponse(html, {
      status: res.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        // Remove frame-blocking headers
        'X-Frame-Options': 'ALLOWALL',
      },
    });
  } catch (err: any) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:24px;color:#333;background:#f8fafc;">
        <h3>无法直接反向代理该网页</h3>
        <p style="color:#666;">原因: ${err.message || '网络连接超时或目标站点禁止外链加载'}</p>
        <p style="color:#0284c7;font-size:13px;">提示：政务/统计系统通常需要在用户本人浏览器中保持会话。请直接使用已安装的 Chrome 插件在真实标签页中使用！</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
