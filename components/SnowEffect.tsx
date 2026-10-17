'use client';

import React, { useEffect, useState } from 'react';
import { Snowflake as SnowflakeIcon } from 'lucide-react';

interface SnowflakeItem {
  id: number;
  type: 'crystal' | 'dot';
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState<SnowflakeItem[]>([]);

  useEffect(() => {
    // Generate static snowflake configuration on client side to avoid hydration mismatch
    // Use clean SVG icons and CSS particles instead of Unicode characters to prevent iOS Apple Color Emoji rendering
    const flakes: SnowflakeItem[] = Array.from({ length: 36 }, (_, i) => ({
      id: i,
      type: i % 3 === 0 ? 'crystal' : 'dot',
      left: Math.random() * 100, // 0% to 100%
      size: i % 3 === 0 ? Math.random() * 6 + 11 : Math.random() * 3 + 2.5, // crystal 11-17px, dot 2.5-5.5px
      duration: Math.random() * 7 + 8, // 8s to 15s
      delay: Math.random() * 10, // 0s to 10s
      opacity: Math.random() * 0.45 + 0.35, // 0.35 to 0.80
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake text-white"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            opacity: flake.opacity,
          }}
        >
          {flake.type === 'crystal' ? (
            <SnowflakeIcon
              style={{
                width: `${flake.size}px`,
                height: `${flake.size}px`,
              }}
              strokeWidth={1.6}
              className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]"
            />
          ) : (
            <div
              style={{
                width: `${flake.size}px`,
                height: `${flake.size}px`,
              }}
              className="rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            />
          )}
        </div>
      ))}
    </div>
  );
}
