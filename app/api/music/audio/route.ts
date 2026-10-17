import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

// In-memory cache to serve audio at lightning speed without repeated Firestore reads
let memoryCache: {
  buffer: Buffer;
  mimeType: string;
  updatedAt: number;
} | null = null;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reqTimestamp = searchParams.get('t') ? parseInt(searchParams.get('t')!, 10) : 0;

    let audioBuffer: Buffer | null = null;
    let mimeType = 'audio/mpeg';

    // 1. Check if memory cache is valid
    if (memoryCache && (!reqTimestamp || memoryCache.updatedAt >= reqTimestamp)) {
      audioBuffer = memoryCache.buffer;
      mimeType = memoryCache.mimeType;
    }

    // 2. If not in memory, fetch from Firestore chunks
    if (!audioBuffer) {
      try {
        const metaSnap = await getDoc(doc(db, 'settings', 'music_audio_meta'));
        if (metaSnap.exists()) {
          const meta = metaSnap.data();
          const totalChunks = Number(meta.totalChunks) || 0;
          mimeType = meta.mimeType || 'audio/mpeg';
          const updatedAt = Number(meta.updatedAt) || Date.now();

          if (totalChunks > 0) {
            const chunkPromises = [];
            for (let i = 0; i < totalChunks; i++) {
              chunkPromises.push(getDoc(doc(db, 'music_chunks', `chunk_${i}`)));
            }
            const chunkSnaps = await Promise.all(chunkPromises);
            const slices: Buffer[] = [];
            for (const s of chunkSnaps) {
              if (s.exists() && s.data().data) {
                slices.push(Buffer.from(s.data().data, 'base64'));
              }
            }

            if (slices.length === totalChunks && totalChunks > 0) {
              audioBuffer = Buffer.concat(slices);
              memoryCache = {
                buffer: audioBuffer,
                mimeType,
                updatedAt,
              };

              // Keep local file in sync with cloud chunks (safely ignored on serverless)
              const localPath = path.join(process.cwd(), 'public', 'music.mp3');
              fs.writeFile(localPath, audioBuffer).catch(() => {});
            }
          }
        }
      } catch (fsErr: any) {
        console.warn('Firestore audio read error:', fsErr.message);
      }
    }

    // 3. Fallback: Local public/music.mp3
    if (!audioBuffer) {
      try {
        const localPath = path.join(process.cwd(), 'public', 'music.mp3');
        audioBuffer = await fs.readFile(localPath);
        mimeType = 'audio/mpeg';
      } catch {}
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return new NextResponse('Audio file not found', { status: 404 });
    }

    const totalSize = audioBuffer.length;
    const rangeHeader = request.headers.get('range');

    // 4. Handle HTTP Range Requests (HTML5 Audio seeking & streaming)
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (isNaN(start) || start >= totalSize) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${totalSize}`,
          },
        });
      }

      const chunkEnd = Math.min(end, totalSize - 1);
      const chunksize = chunkEnd - start + 1;
      const sliced = audioBuffer.subarray(start, chunkEnd + 1);

      return new Response(new Uint8Array(sliced), {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${chunkEnd}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Full audio response
    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': totalSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    return new NextResponse('Internal server error loading audio: ' + err.message, {
      status: 500,
    });
  }
}
