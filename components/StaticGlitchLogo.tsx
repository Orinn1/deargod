'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface StaticGlitchLogoProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function StaticGlitchLogo({
  src,
  alt = 'DEARGOD Spiky Metal Logo',
  className = '',
}: StaticGlitchLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States:
  // hasPageLoaded: false while page preloader is on screen
  // glitchState: 'none' | 'initial' | 'loop'
  const [hasPageLoaded, setHasPageLoaded] = useState(false);
  const [glitchState, setGlitchState] = useState<'none' | 'initial' | 'loop'>('none');
  const [glitchKey, setGlitchKey] = useState(0);

  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 1. Wait for page loader to finish loading before starting
  useEffect(() => {
    // If page is already loaded
    if (typeof document !== 'undefined' && document.body.classList.contains('page-loaded')) {
      setHasPageLoaded(true);
      return;
    }

    const onLoaderDone = () => {
      setHasPageLoaded(true);
    };

    window.addEventListener('page-loader-done', onLoaderDone);

    // Fallback timer: in case event is missed or page loaded instantly
    const fallbackTimer = setTimeout(() => {
      setHasPageLoaded(true);
    }, 3500);

    return () => {
      window.removeEventListener('page-loader-done', onLoaderDone);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // 2. Trigger initial static fade-in immediately after page loader completes
  useEffect(() => {
    if (!hasPageLoaded) return;

    // Trigger initial entrance
    setGlitchState('initial');
    setGlitchKey((k) => k + 1);

    // After initial intro finishes (1300ms), switch to idle and start the 3-5s loop
    const introDoneTimer = setTimeout(() => {
      setGlitchState('none');
      scheduleNextGlitch();
    }, 1350);

    return () => {
      clearTimeout(introDoneTimer);
    };
  }, [hasPageLoaded]);

  // 3. Schedule next glitch loop every 3 to 5 seconds
  const scheduleNextGlitch = useCallback(() => {
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);

    // Random interval between 3000ms and 5000ms (every 3-5 seconds)
    const nextInterval = Math.floor(Math.random() * 2000) + 3000;

    loopTimerRef.current = setTimeout(() => {
      // Trigger recurring loop glitch
      setGlitchState('loop');
      setGlitchKey((k) => k + 1);

      // Duration of loop wave is ~850ms
      const endWaveTimer = setTimeout(() => {
        setGlitchState('none');
        scheduleNextGlitch(); // Loop again in 3-5 seconds
      }, 850);

      loopTimerRef.current = endWaveTimer;
    }, nextInterval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // 4. TV Static White Noise Canvas Generation (Active during 'initial' or 'loop')
  useEffect(() => {
    if (glitchState === 'none') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isInitial = glitchState === 'initial';
    const duration = isInitial ? 1300 : 850;
    const startTime = performance.now();

    const w = 320;
    const h = 180;
    canvas.width = w;
    canvas.height = h;

    const renderNoise = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Intensity curve
      let opacity = 1;
      if (isInitial) {
        if (progress > 0.55) {
          opacity = 1 - (progress - 0.55) / 0.45;
        }
      } else {
        // Recurring loop wave
        if (progress > 0.6) {
          opacity = 1 - (progress - 0.6) / 0.4;
        } else {
          opacity = 0.85;
        }
      }

      if (progress >= 1 || opacity <= 0.02) {
        ctx.clearRect(0, 0, w, h);
        return;
      }

      const imgData = ctx.createImageData(w, h);
      const buffer = new Uint32Array(imgData.data.buffer);
      const len = buffer.length;

      for (let i = 0; i < len; i++) {
        if (Math.random() > 0.38) {
          const val = (Math.random() * 255) | 0;
          const alphaVal = ((Math.random() * 210 + 45) * opacity) | 0;
          buffer[i] = (alphaVal << 24) | (val << 16) | (val << 8) | val;
        } else {
          buffer[i] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Horizontal TV scan glitch bands
      if (Math.random() > 0.6) {
        const bandY = Math.random() * h;
        const bandH = Math.random() * 10 + 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * opacity})`;
        ctx.fillRect(0, bandY, w, bandH);
      }

      animFrameRef.current = requestAnimationFrame(renderNoise);
    };

    animFrameRef.current = requestAnimationFrame(renderNoise);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [glitchState, glitchKey]);

  // Click on logo immediately fires glitch and resets timer
  const handleLogoClick = () => {
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    setGlitchState('loop');
    setGlitchKey((k) => k + 1);

    setTimeout(() => {
      setGlitchState('none');
      scheduleNextGlitch();
    }, 850);
  };

  return (
    <div
      onClick={handleLogoClick}
      className={`relative flex items-center justify-center w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[460px] select-none cursor-default group bg-transparent ${className}`}
    >
      {/* 100% Transparent Container */}
      <div 
        key={glitchKey} 
        className="relative w-full aspect-[16/9] flex items-center justify-center bg-transparent"
      >
        {/* RED CHANNEL CLONE: active during glitch */}
        {glitchState !== 'none' && (
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-screen opacity-0 ${
              glitchState === 'initial' ? 'logo-glitch-red' : 'logo-glitch-red-loop'
            }`}
          />
        )}

        {/* CYAN CHANNEL CLONE: active during glitch */}
        {glitchState !== 'none' && (
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-screen opacity-0 ${
              glitchState === 'initial' ? 'logo-glitch-cyan' : 'logo-glitch-cyan-loop'
            }`}
          />
        )}

        {/* MAIN LOGO: 
            - Hidden initially until page loader is done
            - Runs initial static fade-in on first entry
            - Runs glitch wave on periodic loop
            - Crisp at idle
        */}
        <img
          src={src}
          alt={alt}
          className={`relative z-10 w-full h-full object-contain filter drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] transition-transform duration-300 transform group-hover:scale-[1.03] ${
            !hasPageLoaded
              ? 'opacity-0'
              : glitchState === 'initial'
              ? 'logo-static-flicker'
              : glitchState === 'loop'
              ? 'logo-glitch-loop opacity-100'
              : 'opacity-100'
          }`}
        />

        {/* TV NOISE STATIC CANVAS: MASKED TO LOGO SPIKES (Zero Square Box) */}
        {glitchState !== 'none' && (
          <div
            className="absolute inset-0 z-20 pointer-events-none mix-blend-screen"
            style={{
              WebkitMaskImage: `url("${src}")`,
              maskImage: `url("${src}")`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        )}

        {/* SCANLINES: MASKED TO LOGO SPIKES */}
        <div 
          className={`absolute inset-0 z-20 pointer-events-none scanlines-overlay transition-opacity duration-200 ${
            glitchState !== 'none' ? 'opacity-40' : 'opacity-15 group-hover:opacity-30'
          }`}
          style={{
            WebkitMaskImage: `url("${src}")`,
            maskImage: `url("${src}")`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </div>
    </div>
  );
}
