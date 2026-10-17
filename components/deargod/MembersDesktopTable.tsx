import React from 'react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Member } from '@/data/members';

const DEFAULT_AVATAR = '/deargod-avatar.png';

interface MembersDesktopTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export default function MembersDesktopTable({
  members,
  onEdit,
  onDelete,
}: MembersDesktopTableProps) {
  return (
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
          {members.map((m) => (
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
                    onClick={() => onEdit(m)}
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/15 border border-white/10 hover:border-white/40 text-zinc-300 hover:text-white transition-all active:scale-95"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(m)}
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
  );
}
