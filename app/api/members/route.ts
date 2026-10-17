import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Member, MemberRole, MEMBERS_DATA } from '@/data/members';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'members.json');

// Read members: primary from Firebase Firestore, fallback to local JSON file
async function readMembers(): Promise<Member[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && !projectId.startsWith('demo-')) {
    try {
      const colRef = collection(db, 'members');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const firestoreMembers: Member[] = [];
        snapshot.forEach((d) => {
          firestoreMembers.push(d.data() as Member);
        });

        // Sort chronologically by ID (#0001 -> #0024)
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
  }

  // Fallback to local file
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch {
    return MEMBERS_DATA;
  }
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

    return NextResponse.json({
      success: true,
      total: list.length,
      data: list,
    });
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
    let finalId = memberId?.replace('#', '').trim();
    if (!finalId) {
      const numericIds = currentMembers
        .map((m) => parseInt(m.id.replace(/\D/g, ''), 10))
        .filter((n) => !isNaN(n));
      const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
      finalId = String(maxId + 1).padStart(4, '0');
    }

    const newMember: Member = {
      id: finalId,
      memberId: `#${finalId}`,
      name: name.trim().toUpperCase(),
      role: assignedRole,
      facebook: facebook?.trim() || undefined,
      avatar: avatar?.trim() || undefined,
    };

    // 1. Save to Firebase Firestore
    try {
      await setDoc(doc(db, 'members', newMember.id), newMember);
    } catch (fsErr: any) {
      console.warn('Firestore setDoc warning:', fsErr.message);
    }

    // 2. Update local JSON file cache
    const updated = [...currentMembers.filter((m) => m.id !== newMember.id), newMember];
    fs.writeFile(DATA_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8').catch(() => {});

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

    const updatedMember: Member = {
      ...existing,
      name: name ? name.trim().toUpperCase() : existing.name,
      role: validRoles.includes(role) ? role : existing.role,
      memberId: memberId ? (memberId.startsWith('#') ? memberId : `#${memberId}`) : existing.memberId,
      facebook: facebook !== undefined ? facebook.trim() : existing.facebook,
      avatar: avatar !== undefined ? (avatar.trim() || undefined) : existing.avatar,
    };

    // 1. Update in Firebase Firestore
    try {
      await setDoc(doc(db, 'members', cleanId), updatedMember, { merge: true });
    } catch (fsErr: any) {
      console.warn('Firestore update warning:', fsErr.message);
    }

    // 2. Update local JSON file cache
    currentMembers[index] = updatedMember;
    fs.writeFile(DATA_FILE_PATH, JSON.stringify(currentMembers, null, 2), 'utf-8').catch(() => {});

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
      console.warn('Firestore delete warning:', fsErr.message);
    }

    // 2. Update local JSON file cache
    const updated = currentMembers.filter(
      (m) => m.id !== cleanId && m.memberId.replace('#', '') !== cleanId
    );
    fs.writeFile(DATA_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8').catch(() => {});

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
