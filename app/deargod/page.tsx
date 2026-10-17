'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  Music,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  RefreshCw,
  LogOut,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Play,
  Pause,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Member, MemberRole } from '@/data/members';

const DEFAULT_AVATAR = '/images/deargod-avatar.png';
const PASSCODE = 'deargod'; // Default backoffice passcode

interface MusicState {
  title: string;
  artist: string;
  url: string;
}

export default function DearGodAdminPage() {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'members' | 'music' | 'overview'
  const [activeTab, setActiveTab] = useState<'members' | 'music'>('members');

  // Members data state
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'All' | MemberRole>('All');

  // Music data state
  const [music, setMusic] = useState<MusicState>({
    title: 'ONLY DEARGOD',
    artist: 'DEARGOD',
    url: '/audio/music.mp3',
  });
  const [loadingMusic, setLoadingMusic] = useState(true);
  const [musicTitleInput, setMusicTitleInput] = useState('');
  const [musicArtistInput, setMusicArtistInput] = useState('');
  const [musicUrlInput, setMusicUrlInput] = useState('');
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [savingMusic, setSavingMusic] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Modals
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

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Check session storage on mount
  useEffect(() => {
    const authSession = sessionStorage.getItem('deargod_admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMembers();
      loadMusic();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim().toLowerCase() === PASSCODE || passcodeInput.trim().toLowerCase() === 'deargod2026') {
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
    // Auto-calculate next sequential ID
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

  // Handle Avatar file selection
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
      const data = await res.json();
      if (data.success) {
        showToast(`ลบสมาชิก ${deleteTarget.name} สำเร็จ`);
        setDeleteTarget(null);
        loadMembers();
      } else {
        showToast(data.error || 'ไม่สามารถลบสมาชิกได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการลบสมาชิก', 'error');
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
      formData.append('artist', musicArtistInput.trim() || 'DEARGOD');

      if (musicFile) {
        formData.append('file', musicFile);
      } else if (musicUrlInput.trim()) {
        formData.append('url', musicUrlInput.trim());
      }

      const res = await fetch('/api/music', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        showToast('อัปเดตเพลงประจำเว็บสำเร็จแล้ว!');
        setMusicFile(null);
        loadMusic();
      } else {
        showToast(json.error || 'ไม่สามารถบันทึกเพลงได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการอัปเดตเพลง', 'error');
    } finally {
      setSavingMusic(false);
    }
  };

  // Toggle preview music
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

  // 1. RENDER LOCK SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#060709] text-white flex items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#13151D] via-[#0C0D13] to-[#07080B] p-8 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(255,255,255,0.05)] text-center">
            {/* Logo Emblem */}
            <div className="w-20 h-20 mx-auto rounded-2xl bg-black/80 border border-white/20 p-2.5 flex items-center justify-center shadow-lg mb-6">
              <img
                src="/images/deargod-avatar.png"
                alt="DearGod"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              />
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-widest uppercase text-white">
              DEARGOD BACKOFFICE
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
              [ SECURE CONTROL PANEL ]
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน (Passcode)"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 bg-black/60 border border-white/15 focus:border-white/60 rounded-xl text-sm font-mono text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner text-center"
                />
              </div>

              {authError && (
                <p className="text-xs font-mono text-red-400 flex items-center justify-center gap-1.5 animate-shake">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
              >
                เข้าสู่ระบบ (ACCESS)
              </button>

              <div className="pt-2">
                <span className="text-[11px] font-mono text-zinc-500">
                  รหัสผ่านเริ่มต้น: <code className="text-zinc-300 font-bold">deargod</code>
                </span>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <Link
                href="/members"
                className="text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span>← กลับสู่หน้าเว็บสมาชิก</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. RENDER MAIN BACKOFFICE DASHBOARD
  return (
    <div className="min-h-screen w-full bg-[#060709] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-fade-in ${
            toast.type === 'success'
              ? 'bg-black/90 border-white/40 text-white'
              : 'bg-red-950/90 border-red-500/50 text-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span className="text-xs font-mono font-semibold">{toast.message}</span>
        </div>
      )}

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0C12]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black border border-white/20 p-1 flex items-center justify-center shadow-sm">
            <img src="/images/deargod-avatar.png" alt="DearGod" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white leading-tight">
                DEARGOD BACKOFFICE
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 leading-tight">CONTROL CENTER • 2K26</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/members"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/15 hover:border-white/40 text-xs font-mono text-zinc-300 hover:text-white transition-all"
            title="เปิดหน้ารายชื่อสมาชิกในแท็บใหม่"
          >
            <span>ดูหน้ารายชื่อ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/15 hover:border-white/40 text-xs font-mono text-zinc-300 hover:text-white transition-all"
            title="เปิดหน้าแรก"
          >
            <span>หน้าแรก (Home)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={loadMembers}
            disabled={loadingMembers}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/15 hover:border-white/40 text-zinc-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loadingMembers ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:border-red-500/60 text-xs font-mono text-red-400 hover:text-red-300 transition-all active:scale-95"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* TAB NAVIGATION */}
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

        {/* TAB 1: MEMBERS MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">TOTAL ROSTER</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white">{stats.total}</span>
                  <span className="text-xs font-mono text-zinc-400">PERSONS</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">FOUNDER</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white">{stats.founder}</span>
                  <span className="text-xs font-mono text-zinc-400">TIER 01</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">LEADERS</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white">{stats.leader}</span>
                  <span className="text-xs font-mono text-zinc-400">COMMAND</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MEMBERS</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white">{stats.member}</span>
                  <span className="text-xs font-mono text-zinc-400">OPERATIVE</span>
                </div>
              </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/[0.02] border border-white/10 p-3 sm:p-4 rounded-2xl">
              {/* Search input */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, รหัส ID (#0001)..."
                  className="w-full pl-10 pr-8 py-2 bg-black/60 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role filter buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar w-full sm:w-auto">
                {(['All', 'Founder', 'Leader', 'Support', 'Member'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap active:scale-95 ${
                      selectedRoleFilter === r
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* MEMBERS LIST CONTAINER */}
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
                  {/* 1. MOBILE CARD VIEW (Phone & Small Screens) */}
                  <div className="block md:hidden divide-y divide-white/[0.07]">
                    {filteredMembers.map((m) => (
                      <div key={m.id} className="p-3.5 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-black/80 border border-white/15 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                              src={m.avatar || DEFAULT_AVATAR}
                              alt={m.name}
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_AVATAR;
                              }}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-white tracking-wide uppercase truncate">
                                {m.name}
                              </span>
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                  m.role === 'Founder'
                                    ? 'bg-white/20 border-white/60 text-white'
                                    : m.role === 'Leader'
                                    ? 'bg-white/10 border-white/40 text-zinc-200'
                                    : 'bg-white/[0.04] border-white/15 text-zinc-400'
                                }`}
                              >
                                {m.role}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 mt-1">
                              <span className="text-[10px] font-mono font-bold text-zinc-300 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10">
                                {m.memberId || `#${m.id}`}
                              </span>
                              {m.facebook ? (
                                <a
                                  href={m.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 truncate max-w-[150px]"
                                >
                                  <span>Facebook</span>
                                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                </a>
                              ) : (
                                <span className="text-[10px] font-mono text-zinc-600">ไม่มี Facebook</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mobile Actions: Touch-friendly full-width buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.05]">
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/15 border border-white/15 text-xs font-mono font-semibold text-white transition-all active:scale-95"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-zinc-300" />
                            <span>แก้ไข</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(m)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-mono font-semibold text-red-400 transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบ</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 2. DESKTOP TABLE VIEW (Tablets & Desktops) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 text-[11px] uppercase tracking-widest">
                          <th className="py-3.5 px-4 w-20">ID</th>
                          <th className="py-3.5 px-4 w-16">AVATAR</th>
                          <th className="py-3.5 px-4">NAME</th>
                          <th className="py-3.5 px-4 w-32">ROLE</th>
                          <th className="py-3.5 px-4">FACEBOOK LINK</th>
                          <th className="py-3.5 px-4 text-right w-28">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {filteredMembers.map((m) => (
                          <tr
                            key={m.id}
                            className="hover:bg-white/[0.03] transition-colors group/row"
                          >
                            {/* ID */}
                            <td className="py-3.5 px-4 font-bold text-zinc-400">
                              <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                                {m.memberId || `#${m.id}`}
                              </span>
                            </td>

                            {/* Avatar */}
                            <td className="py-3.5 px-4">
                              <div className="w-10 h-10 rounded-xl bg-black/80 border border-white/15 p-1 flex items-center justify-center overflow-hidden">
                                <img
                                  src={m.avatar || DEFAULT_AVATAR}
                                  alt={m.name}
                                  onError={(e) => {
                                    e.currentTarget.src = DEFAULT_AVATAR;
                                  }}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </td>

                            {/* Name */}
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-sm text-white tracking-wide uppercase">
                                {m.name}
                              </span>
                            </td>

                            {/* Role Badge */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                  m.role === 'Founder'
                                    ? 'bg-white/20 border-white/60 text-white shadow-sm'
                                    : m.role === 'Leader'
                                    ? 'bg-white/10 border-white/40 text-zinc-200'
                                    : 'bg-white/[0.04] border-white/15 text-zinc-400'
                                }`}
                              >
                                {m.role}
                              </span>
                            </td>

                            {/* Facebook */}
                            <td className="py-3.5 px-4 text-zinc-400">
                              {m.facebook ? (
                                <a
                                  href={m.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-white transition-colors flex items-center gap-1.5 max-w-xs truncate"
                                  title={m.facebook}
                                >
                                  <span className="truncate">{m.facebook}</span>
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              ) : (
                                <span className="text-zinc-600">-</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(m)}
                                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/15 border border-white/10 hover:border-white/40 text-zinc-300 hover:text-white transition-all active:scale-95"
                                  title="แก้ไขข้อมูล"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(m)}
                                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 transition-all active:scale-95"
                                  title="ลบสมาชิก"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MUSIC MANAGEMENT */}
        {activeTab === 'music' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-3xl border border-white/15 bg-[#0C0D13]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                    จัดการเพลงประจำเว็บไซต์
                  </h2>
                  <p className="text-xs font-mono text-zinc-400">
                    เปลี่ยนเพลงประกอบพื้นหลังที่จะเล่นอัตโนมัติบนเว็บ
                  </p>
                </div>
              </div>

              {/* Current Active Track Preview */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      CURRENT TRACK
                    </span>
                    <h4 className="text-sm font-bold text-white uppercase">{music.title}</h4>
                    <p className="text-xs font-mono text-zinc-400">{music.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <audio
                    ref={audioPreviewRef}
                    src={music.url}
                    onEnded={() => setIsPlayingPreview(false)}
                    preload="none"
                  />
                  <button
                    onClick={togglePreviewAudio}
                    className="p-3 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-md active:scale-95"
                    title={isPlayingPreview ? 'หยุดฟัง' : 'ลองฟังเสียง'}
                  >
                    {isPlayingPreview ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Form to update song */}
              <form onSubmit={handleSaveMusic} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    ชื่อเพลง (Track Title)
                  </label>
                  <input
                    type="text"
                    value={musicTitleInput}
                    onChange={(e) => setMusicTitleInput(e.target.value)}
                    placeholder="e.g. ONLY DEARGOD"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    ศิลปิน (Artist Name)
                  </label>
                  <input
                    type="text"
                    value={musicArtistInput}
                    onChange={(e) => setMusicArtistInput(e.target.value)}
                    placeholder="e.g. DEARGOD WINTERFELL"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    อัปโหลดไฟล์เพลงใหม่ (.MP3)
                  </label>
                  <div className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03] relative">
                    <input
                      type="file"
                      accept=".mp3,audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setMusicFile(e.target.files[0]);
                          if (!musicTitleInput) {
                            setMusicTitleInput(
                              e.target.files[0].name.replace(/\.[^/.]+$/, '').toUpperCase()
                            );
                          }
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                    {musicFile ? (
                      <p className="text-xs font-mono text-emerald-400 font-bold">
                        เลือกไฟล์: {musicFile.name} ({(musicFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-mono text-white font-bold">
                          คลิกเพื่อเลือกไฟล์ .mp3 จากเครื่อง
                        </p>
                        <p className="text-[11px] font-mono text-zinc-500 mt-1">
                          รองรับไฟล์เพลง .mp3 ทุกขนาด
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    หรือระบุ Direct URL เพลง
                  </label>
                  <input
                    type="text"
                    value={musicUrlInput}
                    onChange={(e) => setMusicUrlInput(e.target.value)}
                    placeholder="https://... หรือ /music.mp3"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingMusic}
                  className="w-full mt-4 py-3 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingMusic && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{savingMusic ? 'กำลังบันทึกเพลง...' : 'บันทึกการตั้งค่าเพลง (SAVE)'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MEMBER MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-white/20 bg-[#0E1017] p-4 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-4 sm:mb-5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  {editingMember ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}
                </h3>
                <p className="text-[11px] sm:text-xs font-mono text-zinc-400">
                  {editingMember ? `ID: ${editingMember.memberId}` : 'กำหนดข้อมูลสมาชิกในคลาน DearGod'}
                </p>
              </div>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMember} className="space-y-4">
              {/* Member ID & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    รหัส ID (#ID)
                  </label>
                  <input
                    type="text"
                    value={memberFormData.id}
                    onChange={(e) => setMemberFormData({ ...memberFormData, id: e.target.value })}
                    placeholder="0001"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    ตำแหน่ง (Role)
                  </label>
                  <select
                    value={memberFormData.role}
                    onChange={(e) =>
                      setMemberFormData({ ...memberFormData, role: e.target.value as MemberRole })
                    }
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="Founder" className="bg-[#0E1017]">
                      Founder
                    </option>
                    <option value="Leader" className="bg-[#0E1017]">
                      Leader
                    </option>
                    <option value="Support" className="bg-[#0E1017]">
                      Support
                    </option>
                    <option value="Member" className="bg-[#0E1017]">
                      Member
                    </option>
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  ชื่อสมาชิก (Name) *
                </label>
                <input
                  type="text"
                  required
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                  placeholder="e.g. SEFT WINTERFELL"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none uppercase font-bold"
                />
              </div>

              {/* Facebook URL */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={memberFormData.facebook}
                  onChange={(e) =>
                    setMemberFormData({ ...memberFormData, facebook: e.target.value })
                  }
                  placeholder="https://www.facebook.com/deargod.fury"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>

              {/* Avatar Preview & Upload */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  รูปอวาตาร์ (Avatar)
                </label>
                <div className="flex items-center gap-4 p-3 bg-black/40 border border-white/10 rounded-2xl">
                  {/* Current Preview */}
                  <div className="w-14 h-14 rounded-xl bg-black border border-white/20 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={avatarPreview || DEFAULT_AVATAR}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white cursor-pointer transition-colors border border-white/15">
                      <Upload className="w-3.5 h-3.5" />
                      <span>เลือกไฟล์รูปภาพจากเครื่อง</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] font-mono text-zinc-500">
                      หรือปล่อยว่างเพื่อใช้โลโก้เริ่มต้น DearGod
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingMember}
                  className="px-5 py-2 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {isSavingMember && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingMember ? 'กำลังบันทึก...' : 'บันทึกข้อมูล (SAVE)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-[#0E1017] p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              ยืนยันการลบสมาชิก?
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-2">
              คุณต้องการลบ <span className="text-white font-bold">{deleteTarget.name}</span> (
              {deleteTarget.memberId}) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteMember}
                disabled={isDeletingMember}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeletingMember ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
