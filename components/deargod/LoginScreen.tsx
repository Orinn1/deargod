import React from 'react';
import Link from 'next/link';
import { Lock, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  passcodeInput: string;
  setPasscodeInput: (val: string) => void;
  authError: string;
  handleLogin: (e: React.FormEvent) => void;
}

export default function LoginScreen({
  passcodeInput,
  setPasscodeInput,
  authError,
  handleLogin,
}: LoginScreenProps) {
  return (
    <div className="min-h-screen w-full bg-[#060709] text-white flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#13151D] via-[#0C0D13] to-[#07080B] p-8 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(255,255,255,0.05)] text-center">
          {/* Logo Emblem */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-black/80 border border-white/20 p-2.5 flex items-center justify-center shadow-lg mb-6">
            <img
              src="/deargod-avatar.png"
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
              href="/"
              className="text-xs font-mono text-zinc-500 hover:text-white transition-colors"
            >
              ← กลับไปยังหน้าแรก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
