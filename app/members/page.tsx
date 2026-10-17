'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, ArrowLeft } from 'lucide-react';
import SnowEffect from '@/components/SnowEffect';
import { MEMBERS_DATA, Member, MemberRole } from '@/data/members';

export default function MembersPage() {
  const [selectedRole, setSelectedRole] = useState<'All' | MemberRole>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [membersList, setMembersList] = useState<Member[]>(MEMBERS_DATA);

  // Fetch latest members dynamically on mount
  useEffect(() => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setMembersList(resData.data);
        }
      })
      .catch(() => {});
  }, []);

  // Counts by role
  const counts = useMemo(() => {
    return {
      all: membersList.length,
      founder: membersList.filter((m) => m.role === 'Founder').length,
      leader: membersList.filter((m) => m.role === 'Leader').length,
      support: membersList.filter((m) => m.role === 'Support').length,
      member: membersList.filter((m) => m.role === 'Member').length,
    };
  }, [membersList]);

  // Filtered members based on role and search query
  const filteredMembers = useMemo(() => {
    return membersList.filter((m) => {
      const matchesRole = selectedRole === 'All' || m.role === selectedRole;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        m.id.includes(q) ||
        m.role.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [selectedRole, searchQuery, membersList]);

  // Group by role
  const founderList = filteredMembers.filter((m) => m.role === 'Founder');
  const leaderList = filteredMembers.filter((m) => m.role === 'Leader');
  const supportList = filteredMembers.filter((m) => m.role === 'Support');
  const regularMemberList = filteredMembers.filter((m) => m.role === 'Member');

  return (
    <div className="relative min-h-screen w-full bg-[#060709] text-[#F3F4F6] flex flex-col justify-between overflow-x-hidden select-none">
      {/* Falling Snowflakes Particle Effect */}
      <SnowEffect />

      {/* Background with GTA5 Noir Scene */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/deargod-bg.png"
          alt="DEARGOD Background"
          className="w-full h-full object-cover object-center select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/90" />
        <div className="absolute inset-0 cinematic-vignette opacity-80" />
      </div>

      {/* TOP NAVBAR */}
      <header className="relative z-30 w-full px-4 sm:px-12 md:px-16 pt-5 sm:pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/30 text-xs font-mono text-zinc-300 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>HOME</span>
        </Link>

        <div className="text-[10px] sm:text-xs font-mono tracking-widest text-zinc-500 uppercase">
          DEARGOD • WINTERFELL
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-20 flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-10">
        {/* 1. TOP CENTER: DEARGOD & MEMBERS */}
        <div className="flex flex-col items-center text-center mt-2 sm:mt-4 mb-6 sm:mb-12">
          <h1 
            style={{ fontFamily: 'var(--font-anton), "Anton", sans-serif' }}
            className="text-4xl sm:text-7xl md:text-8xl font-anton tracking-[0.14em] sm:tracking-[0.2em] text-white uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
          >
            DEARGOD
          </h1>
          <div 
            style={{ fontFamily: 'var(--font-anton), "Anton", sans-serif' }}
            className="text-lg sm:text-2xl md:text-3xl font-anton tracking-[0.3em] sm:tracking-[0.38em] text-white uppercase leading-none mt-2 sm:mt-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
          >
            MEMBERS
          </div>
        </div>

        {/* 2. THREE STATS COUNTERS: FOUNDERS / LEADERS / MEMBERS */}
        <div className="flex items-center justify-center gap-6 sm:gap-16 md:gap-24 mb-8 sm:mb-10 select-none">
          {/* Stat 1: FOUNDERS */}
          <button 
            type="button"
            onClick={() => setSelectedRole(selectedRole === 'Founder' ? 'All' : 'Founder')}
            className="flex flex-col items-center group transition-all active:scale-95 cursor-pointer"
            title="กรองเฉพาะ FOUNDERS"
          >
            <span className="text-3xl sm:text-5xl md:text-6xl font-anton text-white tabular-nums group-hover:scale-110 transition-transform">
              {counts.founder}
            </span>
            <span className={`text-xs sm:text-sm font-anton tracking-[0.2em] uppercase mt-1 transition-colors ${
              selectedRole === 'Founder' ? 'text-white' : 'text-zinc-400 group-hover:text-white'
            }`}>
              FOUNDERS
            </span>
            <div className={`h-0.5 rounded-full mt-1.5 transition-all duration-200 ${
              selectedRole === 'Founder' ? 'w-8 bg-white' : 'w-0 bg-transparent group-hover:w-4 group-hover:bg-zinc-600'
            }`} />
          </button>

          {/* Stat 2: LEADERS */}
          <button 
            type="button"
            onClick={() => setSelectedRole(selectedRole === 'Leader' ? 'All' : 'Leader')}
            className="flex flex-col items-center group transition-all active:scale-95 cursor-pointer"
            title="กรองเฉพาะ LEADERS"
          >
            <span className="text-3xl sm:text-5xl md:text-6xl font-anton text-white tabular-nums group-hover:scale-110 transition-transform">
              {counts.leader}
            </span>
            <span className={`text-xs sm:text-sm font-anton tracking-[0.2em] uppercase mt-1 transition-colors ${
              selectedRole === 'Leader' ? 'text-white' : 'text-zinc-400 group-hover:text-white'
            }`}>
              LEADERS
            </span>
            <div className={`h-0.5 rounded-full mt-1.5 transition-all duration-200 ${
              selectedRole === 'Leader' ? 'w-8 bg-white' : 'w-0 bg-transparent group-hover:w-4 group-hover:bg-zinc-600'
            }`} />
          </button>

          {/* Stat 3: MEMBERS */}
          <button 
            type="button"
            onClick={() => setSelectedRole(selectedRole === 'Member' ? 'All' : 'Member')}
            className="flex flex-col items-center group transition-all active:scale-95 cursor-pointer"
            title="กรองเฉพาะ MEMBERS"
          >
            <span className="text-3xl sm:text-5xl md:text-6xl font-anton text-white tabular-nums group-hover:scale-110 transition-transform">
              {counts.member}
            </span>
            <span className={`text-xs sm:text-sm font-anton tracking-[0.2em] uppercase mt-1 transition-colors ${
              selectedRole === 'Member' ? 'text-white' : 'text-zinc-400 group-hover:text-white'
            }`}>
              MEMBERS
            </span>
            <div className={`h-0.5 rounded-full mt-1.5 transition-all duration-200 ${
              selectedRole === 'Member' ? 'w-8 bg-white' : 'w-0 bg-transparent group-hover:w-4 group-hover:bg-zinc-600'
            }`} />
          </button>
        </div>

        {/* 3. SEARCH BAR (ค้นหาสมาชิก) */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto mb-10 sm:mb-14 relative px-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสมาชิก"
              className="w-full pl-11 pr-10 py-2.5 sm:py-3 bg-[#0A0C12]/90 backdrop-blur-md border border-white/15 hover:border-white/30 focus:border-white/60 rounded-full text-xs sm:text-sm font-sans text-white placeholder-zinc-400 focus:outline-none transition-all shadow-xl text-center focus:text-left focus:pl-11"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                title="ล้างคำค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* MEMBERS CONTENT */}
        {filteredMembers.length === 0 ? (
          <div className="py-16 sm:py-20 text-center flex flex-col items-center justify-center">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
              [ NO MEMBERS FOUND ]
            </p>
            <button
              onClick={() => {
                setSelectedRole('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-1.5 rounded-xl bg-white/[0.06] text-xs font-mono text-white hover:bg-white/15 transition-colors uppercase active:scale-95"
            >
              RESET FILTER
            </button>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-16">
            {/* 1. FOUNDER SECTION (Elite VIP Showcase) */}
            {(selectedRole === 'All' || selectedRole === 'Founder') && founderList.length > 0 && (
              <section>
                <SectionHeader title="FOUNDER" count={founderList.length} />
                <div className="flex justify-center max-w-xl mx-auto px-2">
                  {founderList.map((m) => (
                    <FounderShowcaseCard key={m.id} member={m} />
                  ))}
                </div>
              </section>
            )}

            {/* 2. LEADER SECTION (Dual Executive Showcase) */}
            {(selectedRole === 'All' || selectedRole === 'Leader') && leaderList.length > 0 && (
              <section>
                <SectionHeader title="LEADERS" count={leaderList.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-2">
                  {leaderList.map((m) => (
                    <LeaderShowcaseCard key={m.id} member={m} />
                  ))}
                </div>
              </section>
            )}

            {/* 3. SUPPORT SECTION (if any) */}
            {(selectedRole === 'All' || selectedRole === 'Support') && supportList.length > 0 && (
              <section>
                <SectionHeader title="SUPPORT" count={supportList.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-2">
                  {supportList.map((m) => (
                    <LeaderShowcaseCard key={m.id} member={m} />
                  ))}
                </div>
              </section>
            )}

            {/* 4. MEMBERS SECTION (Vertical Identity Roster Grid) */}
            {(selectedRole === 'All' || selectedRole === 'Member') && regularMemberList.length > 0 && (
              <section>
                <SectionHeader title="MEMBERS" count={regularMemberList.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-w-[1500px] mx-auto px-2">
                  {regularMemberList.map((m) => (
                    <MemberGridCard key={m.id} member={m} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* FOOTER (Matching Home Page) */}
      <footer className="relative z-20 w-full px-4 sm:px-12 md:px-16 py-6 pb-24 sm:pb-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs font-mono text-zinc-500 text-center sm:text-left">
        <div>
          COMMUNITY • 2K26
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-white transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-zinc-400">MEMBERS</span>
        </div>
      </footer>
    </div>
  );
}

// Section Header with sleek glowing tactical pill badge and counter
function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 my-8 sm:my-12 select-none px-2">
      <div className="h-[1px] w-10 sm:w-24 md:w-36 bg-gradient-to-r from-transparent via-white/20 to-white/50" />
      <div className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-1.5 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <h2 className="font-mono text-xs sm:text-sm font-bold tracking-[0.25em] sm:tracking-[0.3em] text-white uppercase">
          {title}
        </h2>
        <span className="text-[10px] sm:text-xs font-mono font-semibold text-zinc-400 border-l border-white/15 pl-2">
          {String(count).padStart(2, '0')}
        </span>
      </div>
      <div className="h-[1px] w-10 sm:w-24 md:w-36 bg-gradient-to-l from-transparent via-white/20 to-white/50" />
    </div>
  );
}

// Role-specific metallic gradient border, background, and glow themes (Clean Pure White Monochrome)
const getRoleTheme = (role: MemberRole) => {
  switch (role) {
    case 'Founder':
      // Platinum White / Brilliant Silver
      return {
        cardBorder: 'border-white/40 hover:border-white',
        cardBg: 'bg-gradient-to-r from-white/[0.06] via-[#0C0D12]/95 to-[#08090C]/95',
        glow: 'shadow-[0_4px_25px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_35px_rgba(255,255,255,0.2)]',
        avatarBorder: 'border-white/60',
        avatarBg: 'bg-gradient-to-br from-white/10 via-zinc-900/40 to-black',
        avatarText: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]',
        roleText: 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]',
        headingText: 'text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.5)]',
        headingLineLeft: 'bg-gradient-to-r from-transparent via-white/50 to-white shadow-[0_0_12px_rgba(255,255,255,0.3)]',
        headingLineRight: 'bg-gradient-to-l from-transparent via-white/50 to-white shadow-[0_0_12px_rgba(255,255,255,0.3)]',
        idColor: 'text-zinc-300 font-bold',
      };
    case 'Leader':
      // Crisp Chrome Silver / Pure Monochrome
      return {
        cardBorder: 'border-white/30 hover:border-white/70',
        cardBg: 'bg-gradient-to-r from-white/[0.04] via-[#0C0D12]/95 to-[#08090C]/95',
        glow: 'shadow-[0_4px_25px_rgba(255,255,255,0.06)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.15)]',
        avatarBorder: 'border-white/40',
        avatarBg: 'bg-gradient-to-br from-white/[0.05] via-zinc-900/40 to-black',
        avatarText: 'text-zinc-100',
        roleText: 'text-zinc-200 font-bold',
        headingText: 'text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.4)]',
        headingLineLeft: 'bg-gradient-to-r from-transparent via-white/40 to-white/70 shadow-[0_0_10px_rgba(255,255,255,0.25)]',
        headingLineRight: 'bg-gradient-to-l from-transparent via-white/40 to-white/70 shadow-[0_0_10px_rgba(255,255,255,0.25)]',
        idColor: 'text-zinc-400 font-semibold',
      };
    case 'Support':
      // Clean Ice Silver
      return {
        cardBorder: 'border-white/20 hover:border-white/50',
        cardBg: 'bg-gradient-to-r from-white/[0.03] via-[#0C0D12]/95 to-[#08090C]/95',
        glow: 'shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.1)]',
        avatarBorder: 'border-white/25',
        avatarBg: 'bg-gradient-to-br from-white/[0.04] via-zinc-900/40 to-black',
        avatarText: 'text-zinc-200',
        roleText: 'text-zinc-300 font-bold',
        headingText: 'text-zinc-200 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]',
        headingLineLeft: 'bg-gradient-to-r from-transparent via-white/30 to-white/50 shadow-[0_0_8px_rgba(255,255,255,0.2)]',
        headingLineRight: 'bg-gradient-to-l from-transparent via-white/30 to-white/50 shadow-[0_0_8px_rgba(255,255,255,0.2)]',
        idColor: 'text-zinc-400 font-medium',
      };
    case 'Member':
      // Smoked Noir / Minimalist Matte Black & White
      return {
        cardBorder: 'border-white/15 hover:border-white/40',
        cardBg: 'bg-gradient-to-r from-white/[0.02] via-[#0C0D12]/95 to-[#08090C]/95',
        glow: 'shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.08)]',
        avatarBorder: 'border-white/20',
        avatarBg: 'bg-gradient-to-br from-zinc-800/40 via-zinc-900/40 to-black',
        avatarText: 'text-zinc-300',
        roleText: 'text-zinc-400',
        headingText: 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]',
        headingLineLeft: 'bg-gradient-to-r from-transparent via-white/30 to-white/50 shadow-[0_0_8px_rgba(255,255,255,0.2)]',
        headingLineRight: 'bg-gradient-to-l from-transparent via-white/30 to-white/50 shadow-[0_0_8px_rgba(255,255,255,0.2)]',
        idColor: 'text-zinc-400',
      };
  }
};

// Format Facebook handle for display
const getFacebookHandle = (url?: string, name?: string) => {
  if (!url) return 'facebook.com';
  try {
    const clean = url.replace(/^https?:\/\/(www\.)?facebook\.com\//, '');
    if (clean.startsWith('profile.php') || clean.startsWith('share/')) {
      const slug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '.') : 'profile';
      return `facebook.com/${slug}`;
    }
    return `facebook.com/${clean.split('?')[0].replace(/\/$/, '')}`;
  } catch {
    return 'facebook.com';
  }
};

const DEFAULT_AVATAR = "/deargod-avatar.png";

// Clean Facebook Direct Link Button (No hover popup)
function FacebookButton({
  url,
  size = 'normal',
}: {
  url?: string;
  size?: 'normal' | 'compact';
}) {
  if (!url) return null;
  const btnClasses = size === 'compact'
    ? 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg'
    : 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl';
  const iconClasses = size === 'compact' ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Facebook Profile"
      aria-label="Facebook Profile"
      className={`${btnClasses} bg-white/[0.04] border border-white/15 hover:border-white/50 hover:bg-white/[0.1] active:scale-90 text-zinc-400 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm flex-shrink-0`}
    >
      <svg className={`${iconClasses} fill-current`} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    </a>
  );
}

// 1. Founder Showcase Card (Elite VIP Supreme Card)
function FounderShowcaseCard({ member }: { member: Member }) {
  const avatarSrc = member.avatar || DEFAULT_AVATAR;

  return (
    <div className="w-full max-w-xl relative group/founder">
      {/* Outer ambient glow behind card */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-white/20 via-white/5 to-transparent blur-xl opacity-40 group-hover/founder:opacity-75 transition-opacity duration-500 pointer-events-none" />

      {/* Main VIP Founder Card */}
      <div className="relative rounded-3xl border border-white/30 hover:border-white/70 bg-gradient-to-b from-[#13151D] via-[#0C0D13] to-[#07080B] p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        {/* Top Tactical Status Bar */}
        <div className="flex items-center justify-between gap-3 mb-6 relative z-10 border-b border-white/[0.08] pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/20 text-[11px] font-mono tracking-widest text-white uppercase shadow-sm">
            <span className="font-bold">FOUNDER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 bg-black/40 px-2.5 py-0.5 rounded-md border border-white/10">
              {member.memberId}
            </span>
            {member.facebook && (
              <FacebookButton url={member.facebook} size="normal" />
            )}
          </div>
        </div>

        {/* Card Center: Avatar & Info in sleek architectural composition */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 relative z-10">
          {/* Glowing Avatar Frame */}
          <div className="relative flex-shrink-0">
            {/* Halo ring */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-[2px] bg-gradient-to-b from-white via-zinc-400 to-zinc-800 shadow-[0_0_25px_rgba(255,255,255,0.25)] group-hover/founder:shadow-[0_0_35px_rgba(255,255,255,0.4)] transition-all duration-300">
              <div className="w-full h-full rounded-2xl bg-black/80 flex items-center justify-center overflow-hidden border border-black/40 p-2">
                <img
                  src={avatarSrc}
                  alt={member.name}
                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] group-hover/founder:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* Member Typography */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider leading-tight break-words drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              {member.name}
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-1 truncate">
              {getFacebookHandle(member.facebook, member.name)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Leader Showcase Card (Dual Executive Showcase)
function LeaderShowcaseCard({ member }: { member: Member }) {
  const avatarSrc = member.avatar || DEFAULT_AVATAR;

  return (
    <div className="relative group/leader w-full">
      {/* Outer subtle glow */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-white/10 to-transparent blur-md opacity-30 group-hover/leader:opacity-60 transition-opacity duration-300 pointer-events-none" />

      {/* Main Leader Card */}
      <div className="relative rounded-2xl border border-white/20 hover:border-white/50 bg-gradient-to-b from-[#12131A] via-[#0C0D12] to-[#07080B] p-5 sm:p-6 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.7),0_0_20px_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        {/* Top Tactical Status Bar */}
        <div className="flex items-center justify-between gap-3 mb-4 relative z-10 border-b border-white/[0.06] pb-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/15 text-[10px] font-mono tracking-widest text-zinc-200 uppercase">
            <span className="font-bold">{member.role}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
              {member.memberId}
            </span>
            {member.facebook && (
              <FacebookButton url={member.facebook} size="normal" />
            )}
          </div>
        </div>

        {/* Center: Avatar & Details */}
        <div className="flex items-center gap-4 sm:gap-5 relative z-10">
          {/* Avatar with Metallic Ring */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-[2px] bg-gradient-to-b from-white/80 via-zinc-400 to-zinc-800 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex-shrink-0 group-hover/leader:scale-105 transition-all duration-300">
            <div className="w-full h-full rounded-2xl bg-black/80 flex items-center justify-center overflow-hidden border border-black/40 p-1.5">
              <img
                src={avatarSrc}
                alt={member.name}
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
              />
            </div>
          </div>

          {/* Leader Name */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white uppercase tracking-wider leading-snug truncate group-hover:text-zinc-100 transition-colors">
              {member.name}
            </h3>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate">
              {getFacebookHandle(member.facebook, member.name)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Member Grid Card (Vertical Identity Player Card)
function MemberGridCard({ member }: { member: Member }) {
  const avatarSrc = member.avatar || DEFAULT_AVATAR;

  return (
    <div className="relative group/mcard w-full">
      {/* Outer subtle glow on hover */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-white/10 to-transparent blur-sm opacity-0 group-hover/mcard:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Main Vertical Player Card */}
      <div className="relative rounded-2xl border border-white/10 hover:border-white/35 bg-gradient-to-b from-[#111218]/90 via-[#0B0C10]/95 to-[#060709]/95 backdrop-blur-md p-3.5 sm:p-4 pt-3 pb-3 flex flex-col items-center justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.06)] overflow-hidden">
        {/* Top Micro-Bar: Tactical ID + Facebook direct button */}
        <div className="w-full flex items-center justify-between gap-2 relative z-10 mb-2">
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.08]">
            {member.memberId}
          </span>
          {member.facebook && (
            <FacebookButton url={member.facebook} size="compact" />
          )}
        </div>

        {/* Center: Avatar Frame with subtle glowing rim */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/70 border border-white/15 p-2 flex items-center justify-center group-hover/mcard:border-white/40 group-hover/mcard:scale-105 group-hover/mcard:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 shadow-md relative my-1">
          <img
            src={avatarSrc}
            alt={member.name}
            onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
            className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]"
          />
        </div>

        {/* Bottom Info: Player Name */}
        <div className="w-full text-center relative z-10 mt-1">
          <h4
            className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate w-full group-hover:text-zinc-100 transition-colors"
            title={member.name}
          >
            {member.name}
          </h4>
          <p className="text-[10px] sm:text-[11px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
            MEMBER
          </p>

          {/* Micro Laser Line Accent */}
          <div className="w-8 group-hover/mcard:w-14 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-2 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
