import { NextRequest, NextResponse } from 'next/server';
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

    const uploadedImages: Array<{
      id: string;
      fileName: string;
      dataUrl: string;
      size: number;
    }> = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files = formData.getAll('images') as File[];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file || typeof file === 'string') continue;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9._\u4e00-\u9fa5]/g, '_')}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, fileName), buffer);

        const mime = file.type || 'image/png';
        const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
        uploadedImages.push({
          id: `img_${Date.now()}_${i}`,
          fileName: file.name,
          dataUrl,
          size: buffer.length,
        });
      }
    } else {
      // JSON format with base64 images array
      const body = await req.json();
      const images = body.images || (body.dataUrl ? [body] : []);

      images.forEach((img: any, idx: number) => {
        const dataUrl = img.dataUrl || img;
        const fileName = img.fileName || `screenshot_${Date.now()}_${idx}.png`;
        const cleanBase64 = dataUrl.replace(/^data:.*?;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        const savedName = `${Date.now()}_${idx}_${fileName.replace(/[^a-zA-Z0-9._\u4e00-\u9fa5]/g, '_')}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, savedName), buffer);

        uploadedImages.push({
          id: `img_${Date.now()}_${idx}`,
          fileName,
          dataUrl,
          size: buffer.length,
        });
      });
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json({ error: '未接收到有效图片数据' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      count: uploadedImages.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `图片处理失败: ${err.message}` }, { status: 500 });
  }
}
