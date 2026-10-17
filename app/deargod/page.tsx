'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Users, Music, Plus, RefreshCw } from 'lucide-react';
import { Member, MemberRole } from '@/data/members';

import ToastNotification from '@/components/deargod/ToastNotification';
import LoginScreen from '@/components/deargod/LoginScreen';
import DashboardHeader from '@/components/deargod/DashboardHeader';
import StatsOverview from '@/components/deargod/StatsOverview';
import MembersFilterBar from '@/components/deargod/MembersFilterBar';
import MembersMobileCards from '@/components/deargod/MembersMobileCards';
import MembersDesktopTable from '@/components/deargod/MembersDesktopTable';
import MemberModal from '@/components/deargod/MemberModal';
import DeleteConfirmModal from '@/components/deargod/DeleteConfirmModal';
import MusicSettingsTab from '@/components/deargod/MusicSettingsTab';

const DEFAULT_AVATAR = '/deargod-avatar.png';
const PASSCODE = 'deargod'; // Default backoffice passcode

interface MusicState {
  title: string;
  artist: string;
  url: string;
}

export default function DearGodAdminPage() {
  // 1. Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // 2. Navigation Tab: 'members' | 'music'
  const [activeTab, setActiveTab] = useState<'members' | 'music'>('members');

  // 3. Members State
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'All' | MemberRole>('All');

  // 4. Music State
  const [music, setMusic] = useState<MusicState>({
    title: 'ONLY DEARGOD',
    artist: 'DEARGOD',
    url: '/music.mp3',
  });
  const [loadingMusic, setLoadingMusic] = useState(true);
  const [musicTitleInput, setMusicTitleInput] = useState('');
  const [musicArtistInput, setMusicArtistInput] = useState('');
  const [musicUrlInput, setMusicUrlInput] = useState('');
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [savingMusic, setSavingMusic] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // 5. Member Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    id: '',
    name: '',
    role: 'Member' as MemberRole,
    facebook: '',
    avatar: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSavingMember, setIsSavingMember] = useState(false);

  // 6. Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // 7. Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Check auth session
  useEffect(() => {
    const authSession = sessionStorage.getItem('deargod_admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadMembers();
      loadMusic();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      passcodeInput.trim().toLowerCase() === PASSCODE ||
      passcodeInput.trim().toLowerCase() === 'deargod2026'
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('deargod_admin_auth', 'true');
      setAuthError('');
      showToast('เข้าสู่ระบบหลังบ้าน DEARGOD สำเร็จ');
    } else {
      setAuthError('รหัสผ่านไม่ถูกต้อง (ลองใช้ deargod)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('deargod_admin_auth');
    setPasscodeInput('');
  };

  // Load Members
  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMembers(data.data);
      } else {
        showToast('ไม่สามารถดึงข้อมูลสมาชิกได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดสมาชิก', 'error');
    } finally {
      setLoadingMembers(false);
    }
  };

  // Load Music
  const loadMusic = async () => {
    setLoadingMusic(true);
    try {
      const res = await fetch('/api/music');
      const data = await res.json();
      if (data.success && data.data) {
        setMusic(data.data);
        setMusicTitleInput(data.data.title || '');
        setMusicArtistInput(data.data.artist || '');
        setMusicUrlInput(data.data.url || '');
      }
    } catch {
      // Ignored
    } finally {
      setLoadingMusic(false);
    }
  };

  // Counts summary
  const stats = useMemo(() => {
    return {
      total: members.length,
      founder: members.filter((m) => m.role === 'Founder').length,
      leader: members.filter((m) => m.role === 'Leader').length,
      support: members.filter((m) => m.role === 'Support').length,
      member: members.filter((m) => m.role === 'Member').length,
    };
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchRole = selectedRoleFilter === 'All' || m.role === selectedRoleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [members, selectedRoleFilter, searchQuery]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    const numericIds = members
      .map((m) => parseInt(m.id.replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    const defaultNextId = String(nextNum).padStart(4, '0');

    setEditingMember(null);
    setMemberFormData({
      id: defaultNextId,
      name: '',
      role: 'Member',
      facebook: '',
      avatar: DEFAULT_AVATAR,
    });
    setAvatarFile(null);
    setAvatarPreview(DEFAULT_AVATAR);
    setIsMemberModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setMemberFormData({
      id: member.id,
      name: member.name,
      role: member.role,
      facebook: member.facebook || '',
      avatar: member.avatar || DEFAULT_AVATAR,
    });
    setAvatarFile(null);
    setAvatarPreview(member.avatar || DEFAULT_AVATAR);
    setIsMemberModalOpen(true);
  };

  // Avatar file selection
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Save Member (Create or Update)
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormData.name.trim()) {
      showToast('กรุณากรอกชื่อสมาชิก', 'error');
      return;
    }

    setIsSavingMember(true);
    try {
      let finalAvatarUrl = memberFormData.avatar;

      // Upload avatar file if selected
      if (avatarFile) {
        const uploadData = new FormData();
        uploadData.append('file', avatarFile);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        const upJson = await upRes.json();
        if (upJson.success && upJson.url) {
          finalAvatarUrl = upJson.url;
        }
      }

      if (editingMember) {
        // PUT update
        const payload = {
          id: editingMember.id,
          name: memberFormData.name.trim().toUpperCase(),
          role: memberFormData.role,
          memberId: `#${memberFormData.id.replace('#', '').trim()}`,
          facebook: memberFormData.facebook.trim(),
          avatar: finalAvatarUrl,
        };

        const res = await fetch('/api/members', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resJson = await res.json();
        if (resJson.success) {
          showToast(`แก้ไขข้อมูล ${memberFormData.name} เรียบร้อยแล้ว`);
          setIsMemberModalOpen(false);
          loadMembers();
        } else {
          showToast(resJson.error || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
        }
      } else {
        // POST create
        const payload = {
          name: memberFormData.name.trim().toUpperCase(),
          role: memberFormData.role,
          memberId: memberFormData.id.replace('#', '').trim(),
          facebook: memberFormData.facebook.trim(),
          avatar: finalAvatarUrl,
        };

        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resJson = await res.json();
        if (resJson.success) {
          showToast(`เพิ่มสมาชิก ${memberFormData.name} เรียบร้อยแล้ว`);
          setIsMemberModalOpen(false);
          loadMembers();
        } else {
          showToast(resJson.error || 'เกิดข้อผิดพลาดในการเพิ่มสมาชิก', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setIsSavingMember(false);
    }
  };

  // Confirm delete member
  const handleDeleteMember = async () => {
    if (!deleteTarget) return;
    setIsDeletingMember(true);
    try {
      const res = await fetch(`/api/members?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(`ลบสมาชิก ${deleteTarget.name} ออกจากระบบแล้ว`);
        setDeleteTarget(null);
        loadMembers();
      } else {
        showToast(resJson.error || 'เกิดข้อผิดพลาดในการลบสมาชิก', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setIsDeletingMember(false);
    }
  };

  // Save Music Settings
  const handleSaveMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMusic(true);
    try {
      const formData = new FormData();
      formData.append('title', musicTitleInput.trim() || 'ONLY DEARGOD');
      formData.append('artist', musicArtistInput.trim() || 'DEARGOD WINTERFELL');

      if (musicFile) {
        formData.append('file', musicFile);
      } else if (musicUrlInput.trim()) {
        formData.append('url', musicUrlInput.trim());
      }

      const res = await fetch('/api/music', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMusic(data.data);
        showToast('อัปเดตเพลงประจำเว็บสำเร็จแล้ว!');
        setMusicFile(null);
      } else {
        showToast(data.error || 'เกิดข้อผิดพลาดในการบันทึกเพลง', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setSavingMusic(false);
    }
  };

  // Preview Audio Toggle
  const togglePreviewAudio = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch(() => showToast('ไม่สามารถเล่นไฟล์เสียงได้', 'error'));
    }
  };

  // If not logged in, render clean lock screen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        passcodeInput={passcodeInput}
        setPasscodeInput={setPasscodeInput}
        authError={authError}
        handleLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#060709] text-[#F3F4F6] flex flex-col font-sans select-none">
      {/* Toast Notification */}
      <ToastNotification toast={toast} />

      {/* Top Navbar */}
      <DashboardHeader
        loadingMembers={loadingMembers}
        loadMembers={loadMembers}
        handleLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                activeTab === 'members'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>สมาชิก ({members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                activeTab === 'music'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>เพลงเว็บ</span>
            </button>
          </div>

          {activeTab === 'members' && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 active:scale-95 transition-all shadow-md w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มสมาชิกใหม่</span>
            </button>
          )}
        </div>

        {/* Tab 1: Members Management */}
        {activeTab === 'members' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Overview */}
            <StatsOverview stats={stats} />

            {/* Search & Filter Bar */}
            <MembersFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedRoleFilter={selectedRoleFilter}
              setSelectedRoleFilter={setSelectedRoleFilter}
            />

            {/* Members List Container */}
            <div className="rounded-2xl border border-white/10 bg-[#0C0D13]/80 backdrop-blur-md overflow-hidden shadow-xl">
              {loadingMembers ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-white" />
                  <span>กำลังโหลดข้อมูลสมาชิก...</span>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 font-mono text-xs">
                  <span>[ ไม่พบข้อมูลสมาชิกตามที่ค้นหา ]</span>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <MembersMobileCards
                    members={filteredMembers}
                    onEdit={handleOpenEditModal}
                    onDelete={(m) => setDeleteTarget(m)}
                  />

                  {/* Desktop Table View */}
                  <MembersDesktopTable
                    members={filteredMembers}
                    onEdit={handleOpenEditModal}
                    onDelete={(m) => setDeleteTarget(m)}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Music Management */}
        {activeTab === 'music' && (
          <MusicSettingsTab
            music={music}
            musicTitleInput={musicTitleInput}
            setMusicTitleInput={setMusicTitleInput}
            musicArtistInput={musicArtistInput}
            setMusicArtistInput={setMusicArtistInput}
            musicUrlInput={musicUrlInput}
            setMusicUrlInput={setMusicUrlInput}
            musicFile={musicFile}
            setMusicFile={setMusicFile}
            savingMusic={savingMusic}
            handleSaveMusic={handleSaveMusic}
            isPlayingPreview={isPlayingPreview}
            togglePreviewAudio={togglePreviewAudio}
            audioPreviewRef={audioPreviewRef}
            setIsPlayingPreview={setIsPlayingPreview}
          />
        )}
      </div>

      {/* Create / Edit Member Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        editingMember={editingMember}
        formData={memberFormData}
        setFormData={setMemberFormData}
        avatarPreview={avatarPreview}
        onAvatarFileChange={handleAvatarFileChange}
        onSubmit={handleSaveMember}
        isSaving={isSavingMember}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        member={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteMember}
        isDeleting={isDeletingMember}
      />
    </div>
  );
}
