import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'static', 'file');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureUploadDir();
    const contentType = req.headers.get('content-type') || '';

    let buffer: Buffer;
    let fileName = `ledger_${Date.now()}.xlsx`;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: '请上传有效的Excel文件' }, { status: 400 });
      }

      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // JSON base64 support (handy for chrome extension background scripts)
      const json = await req.json();
      if (!json.base64) {
        return NextResponse.json({ error: '缺少Excel数据' }, { status: 400 });
      }
      fileName = json.fileName || fileName;
      const cleanBase64 = json.base64.replace(/^data:.*?;base64,/, '');
      buffer = Buffer.from(cleanBase64, 'base64');
    }

    // Save to static/file for archival
    const savedPath = path.join(UPLOAD_DIR, `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._\u4e00-\u9fa5]/g, '_')}`);
    fs.writeFileSync(savedPath, buffer);

    // Parse Excel workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ error: 'Excel工作表为空' }, { status: 400 });
    }

    const worksheet = workbook.Sheets[sheetName];
    // Convert to JSON with header row
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ error: '工作表中未发现有效数据行' }, { status: 400 });
    }

    // Extract headers
    const headers = Object.keys(rawData[0]);

    return NextResponse.json({
      success: true,
      fileName,
      sheetName,
      headers,
      rowCount: rawData.length,
      preview: rawData.slice(0, 5),
      rows: rawData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Excel解析失败: ${err.message}` }, { status: 500 });
  }
}
