import React from 'react';

interface StatsOverviewProps {
  stats: {
    total: number;
    founder: number;
    leader: number;
    support: number;
    member: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">TOTAL ROSTER</span>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-xl sm:text-3xl font-black text-white">{stats.total}</span>
          <span className="text-[10px] sm:text-xs font-mono text-zinc-400">PERSONS</span>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">FOUNDERS</span>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-xl sm:text-3xl font-black text-white">{stats.founder}</span>
          <span className="text-[10px] sm:text-xs font-mono text-zinc-400">CHIEFS</span>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">LEADERS</span>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-xl sm:text-3xl font-black text-white">{stats.leader}</span>
          <span className="text-[10px] sm:text-xs font-mono text-zinc-400">OFFICERS</span>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MEMBERS</span>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-xl sm:text-3xl font-black text-white">{stats.member}</span>
          <span className="text-[10px] sm:text-xs font-mono text-zinc-400">ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
