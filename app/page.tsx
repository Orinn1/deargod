'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SnowEffect from '@/components/SnowEffect';
import MembersModal from '@/components/MembersModal';
import StaticGlitchLogo from '@/components/StaticGlitchLogo';

export default function LandingPage() {
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-[#060709] text-[#F3F4F6] flex flex-col justify-between items-center overflow-x-hidden select-none py-8 sm:py-12 px-4">
      {/* Falling Snowflakes Particle Effect */}
      <SnowEffect />

      {/* GTA 5 Atmospheric Dark Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Background Image */}
        <img
          src="/deargod-bg.png"
          alt="DEARGOD Background"
          className="w-full h-full object-cover object-center select-none"
        />

        {/* Cinematic Darkness Overlay tuned for the black & white GTA scene */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 cinematic-vignette opacity-60" />
      </div>

      {/* 1. TOP CENTER: DEARGOD & UNFAIR */}
      <header className="relative z-20 flex flex-col items-center text-center mt-2 sm:mt-4">
        {/* DEARGOD */}
        <h1 
          style={{ fontFamily: 'var(--font-anton), "Anton", sans-serif' }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-anton tracking-[0.15em] sm:tracking-[0.2em] text-white uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
        >
          DEARGOD
        </h1>

        {/* WINTERFELL (Dynamic Red Metallic Shimmer) */}
        <div 
          style={{ fontFamily: 'var(--font-anton), "Anton", sans-serif' }}
          className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-anton tracking-[0.22em] sm:tracking-[0.28em] uppercase leading-none mt-2 sm:mt-3"
        >
          <span 
            className="hero-brand-39 select-none"
            data-shine-text="WINTERFELL"
          >
            WINTERFELL
          </span>
        </div>
      </header>

      {/* 2. CENTER: SPIKY DEARGOD METAL LOGO (Static Noise / Glitch Fade-In) */}
      <main className="relative z-20 my-auto py-4 sm:py-6 w-full flex flex-col items-center justify-center px-4">
        <StaticGlitchLogo 
          src="/deargod-metal-logo.png" 
          alt="DEARGOD Metal Logo" 
        />
      </main>

      {/* 3. BOTTOM CENTER: LIST NAME & ICO FACEBOOK */}
      <footer className="relative z-20 flex flex-col items-center text-center mb-4 sm:mb-6 gap-3 sm:gap-3.5 pb-20 sm:pb-0">
        {/* LIST NAME (Button linking to /members) */}
        <div className="flex items-center gap-3">
          <Link
            href="/members"
            className="group inline-flex items-center gap-2.5 px-6 sm:px-8 py-2.5 rounded-full bg-[#0E1015]/95 backdrop-blur-md border border-white/20 hover:border-white/60 text-xs sm:text-sm font-mono font-bold tracking-widest text-white uppercase transition-all duration-200 hover:bg-[#151821] hover:shadow-lg hover:shadow-white/[0.08] active:scale-95"
          >
            <span>LIST NAME</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ICO FACEBOOK */}
        <a
          href="https://www.facebook.com/deargod.fury"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="DEARGOD Facebook"
          title="DEARGOD Facebook"
          className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 hover:border-white/50 text-zinc-400 hover:text-white hover:bg-white/[0.12] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
      </footer>

      {/* MEMBERS DIRECTORY MODAL */}
      <MembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
      />
    </div>
  );
}
