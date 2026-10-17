import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MUSIC_CONFIG_PATH = path.join(process.cwd(), 'data', 'music.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

interface MusicConfig {
  title: string;
  artist: string;
  url: string;
}

const DEFAULT_CONFIG: MusicConfig = {
  title: 'ONLY DEARGOD',
  artist: 'DEARGOD',
  url: '/audio/music.mp3?v=deargod',
};

async function getMusicConfig(): Promise<MusicConfig> {
  // 1. Try reading from Firebase Firestore
  try {
    const snap = await getDoc(doc(db, 'settings', 'music'));
    if (snap.exists()) {
      const data = snap.data() as MusicConfig;
      // Best-effort local file cache (safe on serverless)
      fs.writeFile(MUSIC_CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8').catch(() => {});
      return data;
    }
  } catch (err: any) {
    console.warn('Firestore music read warning:', err.message);
  }

  // 2. Fallback to local JSON file
  try {
    const raw = await fs.readFile(MUSIC_CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function GET() {
  const config = await getMusicConfig();
  return NextResponse.json(
    {
      success: true,
      data: config,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string | null;
    const artist = formData.get('artist') as string | null;
    const directUrl = formData.get('url') as string | null;
    const file = formData.get('file') as File | null;

    const currentConfig = await getMusicConfig();
    let musicUrl = currentConfig.url;

    // Option A: Direct URL provided
    if (directUrl && directUrl.trim().length > 0) {
      musicUrl = directUrl.trim();
    }

    // Option B: MP3 File uploaded
    if (file && typeof file === 'object' && file.size > 0) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.mp3') && !file.type.includes('audio')) {
        return NextResponse.json(
          { success: false, error: 'กรุณาอัปโหลดไฟล์นามสกุล .mp3 เท่านั้น (Only .mp3 files allowed)' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const now = Date.now();

      // 1. Attempt writing to local filesystem for local dev (ignore EROFS on Vercel)
      try {
        const audioDir = path.join(PUBLIC_DIR, 'audio');
        await fs.mkdir(audioDir, { recursive: true }).catch(() => {});
        const targetFilePath = path.join(audioDir, 'music.mp3');
        await fs.writeFile(targetFilePath, buffer);
      } catch (fsErr: any) {
        // Expected on Vercel serverless (read-only filesystem)
        console.log('Serverless environment: disk is read-only, storing to Firestore cloud chunks.');
      }

      // 2. Save audio into Firestore chunks (works 100% on Vercel and all clouds)
      const CHUNK_SIZE = 400 * 1024; // 400 KB per chunk (safely below Firestore 1MB limit)
      const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);

      const writePromises = [];
      for (let i = 0; i < totalChunks; i++) {
        const slice = buffer.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        writePromises.push(
          setDoc(doc(db, 'music_chunks', `chunk_${i}`), {
            data: slice.toString('base64'),
            index: i,
          })
        );
      }
      await Promise.all(writePromises);

      // Save audio metadata
      await setDoc(doc(db, 'settings', 'music_audio_meta'), {
        totalChunks,
        totalSize: buffer.length,
        mimeType: file.type || 'audio/mpeg',
        fileName: file.name,
        updatedAt: now,
      });

      musicUrl = `/api/music/audio?t=${now}`;
    }

    const updatedConfig: MusicConfig = {
      title: title?.trim() || currentConfig.title || 'Audio Track',
      artist: artist?.trim() || currentConfig.artist || 'Official Sound',
      url: musicUrl,
    };

    // 1. Save to Firebase Firestore
    try {
      await setDoc(doc(db, 'settings', 'music'), updatedConfig, { merge: true });
    } catch (fsErr: any) {
      console.warn('Firestore music setDoc warning:', fsErr.message);
    }

    // 2. Save to local JSON file (safe for serverless)
    try {
      await fs.writeFile(MUSIC_CONFIG_PATH, JSON.stringify(updatedConfig, null, 2), 'utf-8');
    } catch {
      // Ignored on serverless
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตเพลงสำเร็จเรียบร้อย',
      data: updatedConfig,
    });
  } catch (err: any) {
    console.error('Error in /api/music POST:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to upload music' },
      { status: 500 }
    );
  }
}
