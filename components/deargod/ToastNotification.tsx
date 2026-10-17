import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  toast: { message: string; type: 'success' | 'error' } | null;
}

export default function ToastNotification({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-fade-in ${
        toast.type === 'success'
          ? 'bg-black/90 border-white/40 text-white'
          : 'bg-red-950/90 border-red-500/50 text-red-200'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
      )}
      <span className="text-xs font-mono font-semibold">{toast.message}</span>
    </div>
  );
}
