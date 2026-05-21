/* ═══════════════════════════════════════════════════════════════
 *  useFrameStats — rolling FPS / frame-time histogram
 *
 *  Independent of R3F's useFrame. Counts requestAnimationFrame
 *  callbacks, maintains a rolling 60-sample window of frame deltas,
 *  and exposes both instantaneous and averaged stats.
 *
 *  Why not r3f's useFrame? We want stats even when the canvas is
 *  paused or not rendering — and we don't want to add reactive
 *  dependencies on the chunk system.
 * ═══════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from 'react';

const WINDOW = 60;

export interface FrameStats {
  fps: number;
  avgMs: number;
  worstMs: number;
  frameCount: number;
}

export function useFrameStats(enabled: boolean = true): FrameStats {
  const [stats, setStats] = useState<FrameStats>({
    fps: 0, avgMs: 0, worstMs: 0, frameCount: 0,
  });
  const samplesRef = useRef<number[]>([]);
  const lastRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);
  const frameCountRef = useRef(0);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let stopped = false;

    const loop = (t: number) => {
      const dt = t - lastRef.current;
      lastRef.current = t;
      frameCountRef.current++;

      const samples = samplesRef.current;
      samples.push(dt);
      if (samples.length > WINDOW) samples.shift();

      // Throttle setState to 5 Hz so React doesn't churn
      if (t - lastUpdateRef.current > 200) {
        lastUpdateRef.current = t;
        const sum = samples.reduce((a, b) => a + b, 0);
        const avg = sum / Math.max(1, samples.length);
        const worst = Math.max(...samples);
        setStats({
          fps: avg > 0 ? Math.round(1000 / avg) : 0,
          avgMs: avg,
          worstMs: worst,
          frameCount: frameCountRef.current,
        });
      }

      if (!stopped) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return stats;
}

/**
 * Imperative variant: same loop, but exposes a snapshot getter ref
 * instead of triggering React re-renders. Used by the debug global
 * to expose FPS without coupling render cadence.
 */
export function useFrameStatsRef(enabled: boolean = true) {
  const ref = useRef<FrameStats>({ fps: 0, avgMs: 0, worstMs: 0, frameCount: 0 });
  const samplesRef = useRef<number[]>([]);
  const lastRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let stopped = false;
    const loop = (t: number) => {
      const dt = t - lastRef.current;
      lastRef.current = t;
      const samples = samplesRef.current;
      samples.push(dt);
      if (samples.length > WINDOW) samples.shift();
      const sum = samples.reduce((a, b) => a + b, 0);
      const avg = sum / Math.max(1, samples.length);
      const worst = samples.reduce((a, b) => Math.max(a, b), 0);
      ref.current = {
        fps: avg > 0 ? Math.round(1000 / avg) : 0,
        avgMs: avg,
        worstMs: worst,
        frameCount: ref.current.frameCount + 1,
      };
      if (!stopped) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return ref;
}
