import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const extensionDir = path.join(process.cwd(), 'extension');
    if (!fs.existsSync(extensionDir)) {
      return NextResponse.json({ error: '扩展目录不存在' }, { status: 404 });
    }

    const zip = new JSZip();

    function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) {
            addDirectoryToZip(fullPath, subFolder);
          }
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(item, content);
        }
      }
    }

    addDirectoryToZip(extensionDir, zip);

    // Also include a README.md for extension installation
    const readme = `# AI 驱动的浏览器表单自动填写助手 - Chrome 插件安装指南

## 安装步骤：
1. 解压本 ZIP 压缩包到任意文件夹（例如 D:\\ai-form-filler-extension 或 ~/ai-form-filler-extension）
2. 打开 Google Chrome 或 Edge 浏览器，在地址栏输入：
   chrome://extensions/  （或 edge://extensions/）
3. 开启右上角的【开发者模式】(Developer Mode 开关)
4. 点击左上角的【加载已解压的扩展程序】(Load unpacked)
5. 选择解压后的文件夹（包含 manifest.json 的目录）
6. 安装完成！点击浏览器右上角扩展拼图图标，将【AI驱动的浏览器表单自动填写助手】固定到工具栏

## 使用说明：
1. 手动登录您的业务/统计系统（输入账号、密码、验证码），打开填报页面
2. 点击插件图标，右侧滑出 Side Panel 智能面板
3. 上传 Excel 台账或截图，点击【分析表单】
4. 核对字段映射关系，点击【开始填写】即可实现自动注入与受控触发！
`;
    zip.file('README_安装说明.txt', readme);

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="ai-form-autofiller-extension.zip"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: `生成插件压缩包失败: ${err.message}` }, { status: 500 });
  }
}
