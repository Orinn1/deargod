import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const AVATARS_DIR = path.join(process.cwd(), 'public', 'avatars');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file !== 'object' || file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกไฟล์รูปภาพ (No image file provided)' },
        { status: 400 }
      );
    }

    // Validate file type
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const originalName = file.name.toLowerCase();
    const ext = path.extname(originalName) || '.png';

    if (!validExtensions.includes(ext.toLowerCase()) && !file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'รองรับไฟล์รูปภาพนามสกุล .png, .jpg, .jpeg, .webp เท่านั้น' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Try saving to public/avatars (works on local environment)
    try {
      await fs.mkdir(AVATARS_DIR, { recursive: true });
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const fileName = `avatar-${timestamp}-${random}${ext}`;
      const filePath = path.join(AVATARS_DIR, fileName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        message: 'อัปโหลดรูปภาพสำเร็จ',
        url: `/avatars/${fileName}`,
      });
    } catch (fsErr: any) {
      // 2. Fallback for serverless (Vercel read-only filesystem): Return base64 Data URL
      const mimeType = file.type || (ext === '.png' ? 'image/png' : 'image/jpeg');
      const base64Url = `data:${mimeType};base64,${buffer.toString('base64')}`;

      return NextResponse.json({
        success: true,
        message: 'อัปโหลดรูปภาพสำเร็จ (Base64 Cloud Data)',
        url: base64Url,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
