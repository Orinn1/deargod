import React from 'react';
import { Search, X } from 'lucide-react';
import { MemberRole } from '@/data/members';

interface MembersFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedRoleFilter: 'All' | MemberRole;
  setSelectedRoleFilter: (role: 'All' | MemberRole) => void;
}

export default function MembersFilterBar({
  searchQuery,
  setSearchQuery,
  selectedRoleFilter,
  setSelectedRoleFilter,
}: MembersFilterBarProps) {
  const roles: ('All' | MemberRole)[] = ['All', 'Founder', 'Leader', 'Support', 'Member'];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10">
      {/* Search input */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อ, รหัส ID (#0001)..."
          className="w-full pl-10 pr-8 py-2.5 sm:py-2 bg-black/60 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
            title="ล้างคำค้นหา"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Role filter buttons (horizontally scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar w-full sm:w-auto">
        {roles.map((r) => (
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
  );
}
