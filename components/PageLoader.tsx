'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function PageLoader() {
  const router = useRouter();
  const pathname = usePathname();

  // Initial Website Load State
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialProgress, setInitialProgress] = useState(0);
  const [initialStatus, setInitialStatus] = useState('INITIALIZING PROTOCOL...');
  const [initialFadeOut, setInitialFadeOut] = useState(false);

  // Route Navigation Transition State
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);
  const [routeTitle, setRouteTitle] = useState('ACCESSING MEMBER ROSTER');
  const [routeSubtitle, setRouteSubtitle] = useState('SYNCHRONIZING DATABASE...');
  const [routeFadeOut, setRouteFadeOut] = useState(false);

  // Reference to cancel timeouts on unmount
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // 1. Initial Page Load Animation (Cinematic 5-Second Boot Protocol)
  useEffect(() => {
    const startTime = Date.now();
    const TARGET_DURATION = 5000; // ~5 seconds duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(1, elapsed / TARGET_DURATION);
      const current = Math.min(100, Math.floor(progressRatio * 100));

      setInitialProgress(current);

      if (current < 20) {
        setInitialStatus('INITIALIZING PROTOCOL...');
      } else if (current < 45) {
        setInitialStatus('LOADING ASSETS & AUDIO...');
      } else if (current < 70) {
        setInitialStatus('CONNECTING SECURE DATABASE...');
      } else if (current < 90) {
        setInitialStatus('DECRYPTING CLAN DOSSIER...');
      } else if (current < 100) {
        setInitialStatus('VERIFYING CREDENTIALS...');
      } else {
        setInitialStatus('SYSTEM READY');
        clearInterval(interval);

        const t1 = setTimeout(() => {
          setInitialFadeOut(true);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('page-loader-done'));
            document.body.classList.add('page-loaded');
          }
        }, 300);

        const t2 = setTimeout(() => {
          setIsInitialLoading(false);
        }, 1000);

        timeoutsRef.current.push(t1, t2);
      }
    }, 40);

    return () => {
      clearInterval(interval);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // 2. Intercept internal navigation clicks (e.g. to /members or back to /)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Find nearest anchor tag
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Only handle internal navigation links
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        target.target === '_blank'
      ) {
        return;
      }

      // If clicking the current active path, don't re-trigger
      const currentPath = window.location.pathname;
      if (href === currentPath) return;

      // Trigger custom route transition for /members and /
      if (href === '/members' || href === '/') {
        e.preventDefault();

        // Configure destination messages
        if (href === '/members') {
          setRouteTitle('ACCESSING MEMBER ROSTER');
          setRouteSubtitle('SYNCHRONIZING TACTICAL DATA • 2K26');
        } else {
          setRouteTitle('RETURNING TO COMMAND');
          setRouteSubtitle('INITIALIZING MAIN TERMINAL • PORTAL');
        }

        setRouteLoading(true);
        setRouteFadeOut(false);
        setRouteProgress(15);

        // Animate rapid loading bar
        let prog = 15;
        const navInterval = setInterval(() => {
          prog += 25;
          if (prog >= 100) {
            prog = 100;
            clearInterval(navInterval);
            setRouteProgress(100);

            // Execute client-side router navigation
            router.push(href);
          } else {
            setRouteProgress(prog);
          }
        }, 70);
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [router]);

  // 3. When pathname changes, smoothly fade out the route transition loader
  useEffect(() => {
    if (routeLoading) {
      setRouteProgress(100);
      const t1 = setTimeout(() => {
        setRouteFadeOut(true);
      }, 150);

      const t2 = setTimeout(() => {
        setRouteLoading(false);
      }, 550);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [pathname]);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. INITIAL WEBSITE PRELOADER SCREEN (Ultra-Clean Monochrome) */}
      {/* ============================================================ */}
      {isInitialLoading && (
        <div
          className={`fixed inset-0 z-[9999] bg-[#050608] flex flex-col items-center justify-center select-none transition-all duration-700 ease-out ${
            initialFadeOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
          }`}
        >
          {/* Center Minimalist Content: Pure Black & White (No Logo, No Red) */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-xs px-6 text-center select-none">
            {/* Minimalist Title */}
            <div className="text-[11px] font-mono tracking-[0.35em] text-zinc-400 uppercase mb-4 font-semibold">
              DEARGOD • WINTERFELL
            </div>

            {/* Ultra-slim minimal white progress line */}
            <div className="w-56 sm:w-64 h-[2px] bg-white/[0.12] rounded-full overflow-hidden relative mb-2.5">
              <div
                className="h-full bg-white transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: `${initialProgress}%` }}
              />
            </div>

            {/* Minimal Status & Percentage */}
            <div className="w-56 sm:w-64 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
              <span className="text-zinc-500 font-normal truncate max-w-[170px] text-left">
                {initialStatus}
              </span>
              <span className="text-white font-bold tabular-nums text-right">
                {initialProgress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. ROUTE TRANSITION SCREEN (Clean Monochrome)                */}
      {/* ============================================================ */}
      {routeLoading && (
        <div
          className={`fixed inset-0 z-[9998] bg-[#050608]/95 backdrop-blur-xl flex flex-col items-center justify-center select-none transition-all duration-300 ease-out ${
            routeFadeOut ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div className="relative z-10 flex flex-col items-center w-full max-w-xs px-6 text-center select-none">
            {/* Destination Heading */}
            <h3 className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-white uppercase mb-1">
              {routeTitle}
            </h3>

            {/* Subtitle */}
            <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-4">
              {routeSubtitle}
            </p>

            {/* Slim White Progress Line */}
            <div className="w-56 sm:w-64 h-[2px] bg-white/[0.12] rounded-full overflow-hidden relative mb-2">
              <div
                className="h-full bg-white transition-all duration-100 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: `${routeProgress}%` }}
              />
            </div>

            <div className="w-56 sm:w-64 flex items-center justify-between text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
              <span>LOADING ROSTER</span>
              <span className="text-white font-bold tabular-nums">{routeProgress}%</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
