import React from 'react';
import { Trash2 } from 'lucide-react';
import { Member } from '@/data/members';

interface DeleteConfirmModalProps {
  member: Member | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  member,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-[#0E1017] p-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white uppercase tracking-wider">
          ยืนยันการลบสมาชิก?
        </h3>
        <p className="text-xs font-mono text-zinc-400 mt-2">
          คุณต้องการลบ <span className="text-white font-bold">{member.name}</span> (
          {member.memberId || `#${member.id}`}) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
          </button>
        </div>
      </div>
    </div>
  );
}
