import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Member, MemberRole, MEMBERS_DATA } from '@/data/members';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'members.json');
const DEFAULT_AVATAR = '/images/deargod-avatar.png';

// Sanitize member object so no properties are undefined (Firestore forbids undefined values)
function cleanMemberDoc(m: any): Member {
  const id = String(m.id || '').replace('#', '').trim();
  const memberId = m.memberId && String(m.memberId).startsWith('#') ? String(m.memberId) : `#${id}`;
  return {
    id,
    memberId,
    name: String(m.name || '').trim().toUpperCase(),
    role: (m.role as MemberRole) || 'Member',
    facebook: m.facebook ? String(m.facebook).trim() : '',
    avatar: m.avatar && String(m.avatar).trim() ? String(m.avatar).trim() : DEFAULT_AVATAR,
  };
}

// Read members: primary from Firebase Firestore, fallback to local JSON file
async function readMembers(): Promise<Member[]> {
  try {
    const colRef = collection(db, 'members');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const firestoreMembers: Member[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        firestoreMembers.push(cleanMemberDoc({ ...data, id: data.id || d.id }));
      });

      // Sort chronologically by ID (#0001 -> #0056)
      firestoreMembers.sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      // Keep local cache in sync asynchronously
      fs.writeFile(DATA_FILE_PATH, JSON.stringify(firestoreMembers, null, 2), 'utf-8').catch(() => {});
      return firestoreMembers;
    }
  } catch (err: any) {
    console.warn('Firestore read error, falling back to local file:', err.message);
  }

  // Fallback to local file
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}

  return MEMBERS_DATA;
}

// GET all members (supports ?search= and ?role=)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim();
    const role = searchParams.get('role');

    let list = await readMembers();

    if (search) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.id.toLowerCase().includes(search) ||
          m.memberId.toLowerCase().includes(search) ||
          m.role.toLowerCase().includes(search)
      );
    }

    if (role && role !== 'All') {
      list = list.filter((m) => m.role.toLowerCase() === role.toLowerCase());
    }

    return NextResponse.json(
      {
        success: true,
        total: list.length,
        data: list,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST - Add new member
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, facebook, avatar, memberId } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Member name is required' },
        { status: 400 }
      );
    }

    const validRoles: MemberRole[] = ['Founder', 'Leader', 'Support', 'Member'];
    const assignedRole: MemberRole = validRoles.includes(role) ? role : 'Member';

    const currentMembers = await readMembers();

    // Auto calculate next sequential ID if not provided
    let finalId = memberId ? String(memberId).replace('#', '').trim() : '';
    if (!finalId) {
      const numericIds = currentMembers
        .map((m) => parseInt(m.id.replace(/\D/g, ''), 10))
        .filter((n) => !isNaN(n));
      const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
      finalId = String(maxId + 1).padStart(4, '0');
    }

    const newMember = cleanMemberDoc({
      id: finalId,
      memberId: `#${finalId}`,
      name: name.trim().toUpperCase(),
      role: assignedRole,
      facebook: facebook || '',
      avatar: avatar || DEFAULT_AVATAR,
    });

    // 1. Save to Firebase Firestore
    try {
      await setDoc(doc(db, 'members', newMember.id), newMember);
    } catch (fsErr: any) {
      console.error('Firestore setDoc error:', fsErr);
      return NextResponse.json(
        { success: false, error: `Firestore error: ${fsErr.message}` },
        { status: 500 }
      );
    }

    // 2. Update local JSON file cache
    const updated = [...currentMembers.filter((m) => m.id !== newMember.id), newMember];
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
      // Ignored on serverless read-only disk
    }

    return NextResponse.json({
      success: true,
      message: 'Member added successfully',
      data: newMember,
      total: updated.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add member' },
      { status: 500 }
    );
  }
}

// PUT - Update existing member
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, role, facebook, avatar, memberId } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required for update' },
        { status: 400 }
      );
    }

    const currentMembers = await readMembers();
    const cleanId = String(id).replace('#', '').trim();

    const index = currentMembers.findIndex(
      (m) => m.id === cleanId || m.memberId.replace('#', '') === cleanId
    );

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    const existing = currentMembers[index];
    const validRoles: MemberRole[] = ['Founder', 'Leader', 'Support', 'Member'];

    const updatedMember = cleanMemberDoc({
      ...existing,
      id: cleanId,
      name: name ? name.trim().toUpperCase() : existing.name,
      role: validRoles.includes(role) ? role : existing.role,
      memberId: memberId ? (String(memberId).startsWith('#') ? String(memberId) : `#${memberId}`) : existing.memberId,
      facebook: facebook !== undefined ? facebook : existing.facebook,
      avatar: avatar !== undefined && avatar ? avatar : existing.avatar,
    });

    // 1. Update in Firebase Firestore
    try {
      await setDoc(doc(db, 'members', cleanId), updatedMember, { merge: true });
    } catch (fsErr: any) {
      console.error('Firestore update error:', fsErr);
      return NextResponse.json(
        { success: false, error: `Firestore error: ${fsErr.message}` },
        { status: 500 }
      );
    }

    // 2. Update local JSON file cache
    currentMembers[index] = updatedMember;
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(currentMembers, null, 2), 'utf-8');
    } catch {
      // Ignored on serverless
    }

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a member
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required for deletion' },
        { status: 400 }
      );
    }

    const cleanId = String(id).replace('#', '').trim();
    const currentMembers = await readMembers();

    const exists = currentMembers.some(
      (m) => m.id === cleanId || m.memberId.replace('#', '') === cleanId
    );

    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // 1. Delete in Firebase Firestore
    try {
      await deleteDoc(doc(db, 'members', cleanId));
    } catch (fsErr: any) {
      console.error('Firestore delete error:', fsErr);
      return NextResponse.json(
        { success: false, error: `Firestore error: ${fsErr.message}` },
        { status: 500 }
      );
    }

    // 2. Update local JSON file cache
    const updated = currentMembers.filter(
      (m) => m.id !== cleanId && m.memberId.replace('#', '') !== cleanId
    );
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
      // Ignored on serverless
    }

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully',
      total: updated.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete member' },
      { status: 500 }
    );
  }
}
