import React from 'react';
import { X, Upload, RefreshCw } from 'lucide-react';
import { Member, MemberRole } from '@/data/members';

const DEFAULT_AVATAR = '/deargod-avatar.png';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember: Member | null;
  formData: {
    id: string;
    name: string;
    role: MemberRole;
    facebook: string;
    avatar: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      role: MemberRole;
      facebook: string;
      avatar: string;
    }>
  >;
  avatarPreview: string;
  onAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

export default function MemberModal({
  isOpen,
  onClose,
  editingMember,
  formData,
  setFormData,
  avatarPreview,
  onAvatarFileChange,
  onSubmit,
  isSaving,
}: MemberModalProps) {
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95"
            title="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Member ID & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                รหัส ID (#ID)
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="0001"
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                ตำแหน่ง (Role)
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as MemberRole })
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.facebook}
              onChange={(e) =>
                setFormData({ ...formData, facebook: e.target.value })
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
                    onChange={onAvatarFileChange}
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
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 shadow-md"
            >
              {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล (SAVE)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
