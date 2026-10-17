import React from 'react';
import Link from 'next/link';
import { ExternalLink, RefreshCw, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  loadingMembers: boolean;
  loadMembers: () => void;
  handleLogout: () => void;
}

export default function DashboardHeader({
  loadingMembers,
  loadMembers,
  handleLogout,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0C12]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-black border border-white/20 p-1 flex items-center justify-center shadow-sm">
          <img src="/deargod-avatar.png" alt="DearGod" className="w-full h-full object-contain" />
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
  );
}
