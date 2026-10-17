import React from 'react';
import { Volume2, Upload, RefreshCw, Play, Pause } from 'lucide-react';

interface MusicState {
  title: string;
  artist: string;
  url: string;
}

interface MusicSettingsTabProps {
  music: MusicState;
  musicTitleInput: string;
  setMusicTitleInput: (val: string) => void;
  musicArtistInput: string;
  setMusicArtistInput: (val: string) => void;
  musicUrlInput: string;
  setMusicUrlInput: (val: string) => void;
  musicFile: File | null;
  setMusicFile: (file: File | null) => void;
  savingMusic: boolean;
  handleSaveMusic: (e: React.FormEvent) => void;
  isPlayingPreview: boolean;
  togglePreviewAudio: () => void;
  audioPreviewRef: React.RefObject<HTMLAudioElement | null>;
  setIsPlayingPreview: (val: boolean) => void;
}

export default function MusicSettingsTab({
  music,
  musicTitleInput,
  setMusicTitleInput,
  musicArtistInput,
  setMusicArtistInput,
  musicUrlInput,
  setMusicUrlInput,
  musicFile,
  setMusicFile,
  savingMusic,
  handleSaveMusic,
  isPlayingPreview,
  togglePreviewAudio,
  audioPreviewRef,
  setIsPlayingPreview,
}: MusicSettingsTabProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl border border-white/15 bg-[#0C0D13]/90 backdrop-blur-xl p-5 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              ตั้งค่าเพลงประจำเว็บ (THEME MUSIC)
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              เปลี่ยนเพลงประกอบพื้นหลังที่จะเล่นอัตโนมัติบนเว็บ
            </p>
          </div>
        </div>

        {/* Current Active Track Preview */}
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white flex-shrink-0">
              <Volume2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                CURRENT TRACK
              </span>
              <h4 className="text-sm font-bold text-white uppercase truncate">{music.title}</h4>
              <p className="text-xs font-mono text-zinc-400 truncate">{music.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <audio
              ref={audioPreviewRef}
              src={music.url}
              onEnded={() => setIsPlayingPreview(false)}
              preload="none"
            />
            <button
              onClick={togglePreviewAudio}
              className="p-3 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-md active:scale-95"
              title={isPlayingPreview ? 'หยุดฟัง' : 'ลองฟังเสียง'}
            >
              {isPlayingPreview ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Form to update song */}
        <form onSubmit={handleSaveMusic} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              ชื่อเพลง (Track Title)
            </label>
            <input
              type="text"
              value={musicTitleInput}
              onChange={(e) => setMusicTitleInput(e.target.value)}
              placeholder="e.g. ONLY DEARGOD"
              className="w-full px-4 py-2.5 bg-black/50 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              ศิลปิน (Artist Name)
            </label>
            <input
              type="text"
              value={musicArtistInput}
              onChange={(e) => setMusicArtistInput(e.target.value)}
              placeholder="e.g. DEARGOD WINTERFELL"
              className="w-full px-4 py-2.5 bg-black/50 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              อัปโหลดไฟล์เพลงใหม่ (.MP3)
            </label>
            <div className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03] relative">
              <input
                type="file"
                accept=".mp3,audio/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setMusicFile(e.target.files[0]);
                    if (!musicTitleInput) {
                      setMusicTitleInput(
                        e.target.files[0].name.replace(/\.[^/.]+$/, '').toUpperCase()
                      );
                    }
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              {musicFile ? (
                <p className="text-xs font-mono text-emerald-400 font-bold">
                  เลือกไฟล์: {musicFile.name} ({(musicFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              ) : (
                <>
                  <p className="text-xs font-mono text-white font-bold">
                    คลิกเพื่อเลือกไฟล์ .mp3 จากเครื่อง
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">
                    รองรับไฟล์เพลง .mp3 ทุกขนาด
                  </p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              หรือระบุ Direct URL เพลง
            </label>
            <input
              type="text"
              value={musicUrlInput}
              onChange={(e) => setMusicUrlInput(e.target.value)}
              placeholder="https://... หรือ /music.mp3"
              className="w-full px-4 py-2.5 bg-black/50 border border-white/15 focus:border-white/50 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={savingMusic}
            className="w-full mt-4 py-3 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {savingMusic && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>{savingMusic ? 'กำลังบันทึกเพลง...' : 'บันทึกการตั้งค่าเพลง (SAVE)'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
