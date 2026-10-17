import React from 'react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Member } from '@/data/members';

const DEFAULT_AVATAR = '/deargod-avatar.png';

interface MembersMobileCardsProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export default function MembersMobileCards({
  members,
  onEdit,
  onDelete,
}: MembersMobileCardsProps) {
  return (
    <div className="block md:hidden divide-y divide-white/[0.07]">
      {members.map((m) => (
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
              onClick={() => onEdit(m)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/15 border border-white/15 text-xs font-mono font-semibold text-white transition-all active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5 text-zinc-300" />
              <span>แก้ไข</span>
            </button>
            <button
              onClick={() => onDelete(m)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-mono font-semibold text-red-400 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบ</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
