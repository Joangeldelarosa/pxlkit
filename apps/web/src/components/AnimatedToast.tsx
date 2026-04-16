'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import type { PxlKitData, AnimatedPxlKitData } from '@pxlkit/core';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
export type ToastTone = 'success' | 'error' | 'info';

export interface AnimatedToastProps {
  visible: boolean;
  tone: ToastTone;
  title: string;
  message?: string;
  icon?: PxlKitData | AnimatedPxlKitData;
  duration?: number;
  onClose: () => void;
}

function isAnimatedIcon(
  icon: PxlKitData | AnimatedPxlKitData
): icon is AnimatedPxlKitData {
  return 'frames' in icon;
}

// ────────────────────────────────────────────
// Theme map
// ────────────────────────────────────────────
const TONE_THEME: Record<ToastTone, {
  bg: string;
  border: string;
  accent: string;
  text: string;
  glow: string;
  progressFrom: string;
  progressTo: string;
}> = {
  success: {
    bg: '#0c1f14',
    border: '#1a4a2e',
    accent: '#00ff88',
    text: '#e8e6e3',
    glow: 'rgba(0, 255, 136, 0.15)',
    progressFrom: '#00ff88',
    progressTo: '#00cc6a',
  },
  error: {
    bg: '#1f0c0c',
    border: '#4a1a1a',
    accent: '#ff6b6b',
    text: '#e8e6e3',
    glow: 'rgba(255, 107, 107, 0.15)',
    progressFrom: '#ff6b6b',
    progressTo: '#cc4444',
  },
  info: {
    bg: '#0c1a1f',
    border: '#1a3a4a',
    accent: '#4ecdc4',
    text: '#e8e6e3',
    glow: 'rgba(78, 205, 196, 0.15)',
    progressFrom: '#4ecdc4',
    progressTo: '#3ab3aa',
  },
};

// ────────────────────────────────────────────
// Pixel-art decorative corner SVG
// ────────────────────────────────────────────
function PixelCorner({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 4 4"
      className="w-2 h-2 shrink-0"
      shapeRendering="crispEdges"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <rect x="0" y="0" width="1" height="4" fill={color} />
      <rect x="1" y="0" width="3" height="1" fill={color} />
    </svg>
  );
}

// ────────────────────────────────────────────
// Variants
// ────────────────────────────────────────────

/** Container: slides in from right with a spring + slight Y translate */
const containerVariants = {
  hidden: {
    opacity: 0,
    x: 120,
    y: -8,
    scale: 0.85,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 28,
      mass: 0.8,
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    x: 80,
    y: -4,
    scale: 0.9,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: [0.36, 0, 0.66, -0.56], // ease-in-back
    },
  },
};

/** Staggered children: each element fades + slides up */
const childVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },
};

/** Icon entrance: pops with a bounce scale */
const iconVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 600,
      damping: 20,
      delay: 0.04,
    },
  },
};

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────
export function AnimatedToast({
  visible,
  tone,
  title,
  message,
  icon,
  duration = 2500,
  onClose,
}: AnimatedToastProps) {
  const theme = TONE_THEME[tone];
  const progressMV = useMotionValue(1);
  const progressWidth = useTransform(progressMV, [0, 1], ['0%', '100%']);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animRef.current) animRef.current.stop();
  }, []);

  useEffect(() => {
    cleanup();
    if (!visible || duration <= 0) return;

    // Reset progress
    progressMV.set(1);

    // Animate progress bar drain
    animRef.current = animate(progressMV, 0, {
      duration: duration / 1000,
      ease: 'linear',
    });

    // Auto-close timer
    timerRef.current = setTimeout(() => onClose(), duration);

    return cleanup;
  }, [visible, duration, onClose, cleanup, progressMV]);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="animated-toast"
          className="fixed z-[200] top-20 right-4 pointer-events-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          layout
        >
          {/* ── Glow backdrop ── */}
          <motion.div
            className="absolute -inset-2 rounded-2xl opacity-60 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at top right, ${theme.glow}, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.4 }}
          />

          {/* ── Toast card ── */}
          <motion.div
            className="relative min-w-[280px] max-w-[380px] rounded-lg overflow-hidden"
            style={{
              backgroundColor: theme.bg,
              border: `2px solid ${theme.border}`,
              boxShadow: `
                0 0 0 1px ${theme.border}44,
                0 4px 24px -4px rgba(0,0,0,0.6),
                0 0 40px -8px ${theme.accent}15
              `,
            }}
          >
            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.08] rounded-lg"
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
              }}
            />

            {/* Content */}
            <div className="relative px-3.5 py-3">
              {/* Top decorative row */}
              <motion.div
                className="flex items-center justify-between mb-2"
                variants={childVariants}
              >
                <PixelCorner color={theme.accent} />
                <div className="flex-1 mx-2 h-px" style={{ backgroundColor: `${theme.border}66` }} />
                <PixelCorner color={theme.accent} flip />
              </motion.div>

              {/* Main content row */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                {icon && (
                  <motion.div className="mt-0.5 shrink-0" variants={iconVariants}>
                    {isAnimatedIcon(icon) ? (
                      <AnimatedPxlKitIcon icon={icon} size={22} colorful />
                    ) : (
                      <PxlKitIcon icon={icon} size={22} colorful color={theme.accent} />
                    )}
                  </motion.div>
                )}

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <motion.p
                    className="font-pixel text-[10px] leading-relaxed tracking-wide"
                    style={{ color: theme.accent }}
                    variants={childVariants}
                  >
                    {title}
                  </motion.p>
                  {message && (
                    <motion.p
                      className="font-mono text-xs leading-relaxed opacity-80 mt-1 break-words"
                      style={{ color: theme.text }}
                      variants={childVariants}
                    >
                      {message}
                    </motion.p>
                  )}
                </div>

                {/* Close button */}
                <motion.button
                  type="button"
                  aria-label="Close"
                  onClick={() => {
                    cleanup();
                    onClose();
                  }}
                  className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded border transition-colors hover:bg-white/5"
                  style={{ borderColor: `${theme.accent}55`, color: theme.accent }}
                  variants={childVariants}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                >
                  <svg viewBox="0 0 6 6" className="w-2.5 h-2.5" shapeRendering="crispEdges" fill="currentColor">
                    <rect x="0" y="0" width="1" height="1" />
                    <rect x="5" y="0" width="1" height="1" />
                    <rect x="1" y="1" width="1" height="1" />
                    <rect x="4" y="1" width="1" height="1" />
                    <rect x="2" y="2" width="2" height="2" />
                    <rect x="1" y="4" width="1" height="1" />
                    <rect x="4" y="4" width="1" height="1" />
                    <rect x="0" y="5" width="1" height="1" />
                    <rect x="5" y="5" width="1" height="1" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Progress bar at bottom */}
            <div className="h-[3px] w-full" style={{ backgroundColor: `${theme.border}55` }}>
              <motion.div
                className="h-full"
                style={{
                  width: progressWidth,
                  background: `linear-gradient(90deg, ${theme.progressFrom}, ${theme.progressTo})`,
                  boxShadow: `0 0 8px ${theme.accent}66`,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
