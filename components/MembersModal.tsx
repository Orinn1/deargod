'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { MEMBERS_DATA, Member } from '@/data/members';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MembersModal({ isOpen, onClose }: MembersModalProps) {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<Member[]>(MEMBERS_DATA);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setMembers(data.data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-[#0C0D12] border border-white/[0.1] rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <h3 
                style={{ fontFamily: 'var(--font-anton), "Anton", sans-serif' }}
                className="text-lg font-anton font-normal text-white uppercase tracking-wider"
              >
                WINTERFELL • ROSTER
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5 uppercase tracking-wide">
              OFFICIAL ROSTER DIRECTORY
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            [CLOSE]
          </button>
        </div>

        {/* Search */}
        <div className="my-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH BY NAME OR #ID..."
            className="w-full px-4 py-2.5 bg-[#14161F] border border-white/[0.08] rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 uppercase font-sans"
          />
        </div>

        {/* Members Grid / List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
              [ NO MEMBERS FOUND ]
            </div>
          ) : (
            filtered.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#14161F]/80 border border-white/[0.06] hover:border-white/[0.15] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/[0.04] flex items-center justify-center">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full object-contain p-0.5" 
                      />
                    ) : (
                      <User className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        {member.memberId || member.id}
                      </span>
                      <span 
                        style={{ fontFamily: 'var(--font-anton), "Anton", sans-serif' }}
                        className="text-base font-normal text-white font-anton uppercase tracking-wide"
                      >
                        {member.name}
                      </span>
                    </div>
                  </div>
                </div>

                {member.facebook && (
                  <a
                    href={member.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook Profile"
                    aria-label="Facebook Profile"
                    className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/40 text-zinc-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Link to Dedicated Page */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            WINTERFELL 2K26
          </span>
          <Link
            href="/members"
            onClick={onClose}
            className="text-xs font-mono text-zinc-300 hover:text-white transition-colors"
          >
            [ FULL DIRECTORY &rarr; ]
          </Link>
        </div>
      </div>
    </div>
  );
}
