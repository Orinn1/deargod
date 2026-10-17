import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Member, MEMBERS_DATA } from '@/data/members';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'members.json');

async function getMember(id: string): Promise<Member | undefined> {
  const cleanId = id.replace('#', '').trim().toLowerCase();
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const list: Member[] = JSON.parse(raw);
    const found = list.find(
      (m) => m.id.toLowerCase() === cleanId || m.memberId.replace('#', '').toLowerCase() === cleanId
    );
    if (found) return found;
  } catch {}

  return MEMBERS_DATA.find(
    (m) => m.id.toLowerCase() === cleanId || m.memberId.replace('#', '').toLowerCase() === cleanId
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    return NextResponse.json(
      { success: false, error: 'Member not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: member,
  });
}
