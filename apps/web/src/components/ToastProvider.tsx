'use client';

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import type { PxlKitData, AnimatedPxlKitData } from '@pxlkit/core';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
export type ToastTone = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastOptions {
  tone?: ToastTone;
  title: string;
  message?: string;
  icon?: PxlKitData;
  animatedIcon?: AnimatedPxlKitData;
  duration?: number;
  position?: ToastPosition;
}

interface ToastItem extends Required<Pick<ToastOptions, 'tone' | 'title' | 'duration' | 'position'>> {
  id: string;
  message?: string;
  icon?: PxlKitData;
  animatedIcon?: AnimatedPxlKitData;
  createdAt: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  success: (title: string, message?: string, icon?: PxlKitData) => string;
  error: (title: string, message?: string, icon?: PxlKitData) => string;
  info: (title: string, message?: string, icon?: PxlKitData) => string;
  warning: (title: string, message?: string, icon?: PxlKitData) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ────────────────────────────────────────────
// Context
// ────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
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
  warning: {
    bg: '#1f1a0c',
    border: '#4a3a1a',
    accent: '#ffa300',
    text: '#e8e6e3',
    glow: 'rgba(255, 163, 0, 0.15)',
    progressFrom: '#ffa300',
    progressTo: '#cc8200',
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
// Position CSS classes
// ────────────────────────────────────────────
const POSITION_CLASSES: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

function getSlideDirection(pos: ToastPosition): { x: number; y: number } {
  if (pos.includes('right')) return { x: 120, y: 0 };
  if (pos.includes('left')) return { x: -120, y: 0 };
  if (pos.startsWith('top')) return { x: 0, y: -60 };
  return { x: 0, y: 60 };
}

function isBottomPosition(pos: ToastPosition): boolean {
  return pos.startsWith('bottom');
}

// ────────────────────────────────────────────
// Individual Toast Card
// ────────────────────────────────────────────
function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const theme = TONE_THEME[item.tone];
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
    if (item.duration <= 0) return;

    progressMV.set(1);
    animRef.current = animate(progressMV, 0, {
      duration: item.duration / 1000,
      ease: 'linear',
    });
    timerRef.current = setTimeout(onDismiss, item.duration);

    return cleanup;
    // Only run once on mount — timer is independent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slide = getSlideDirection(item.position);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: slide.x, y: slide.y, scale: 0.85, filter: 'blur(8px)' }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { type: 'spring', stiffness: 400, damping: 28, mass: 0.8 },
      }}
      exit={{
        opacity: 0,
        x: slide.x * 0.6,
        scale: 0.9,
        filter: 'blur(4px)',
        transition: { duration: 0.25, ease: [0.36, 0, 0.66, -0.56] },
      }}
      className="pointer-events-auto relative"
    >
      {/* Glow */}
      <div
        className="absolute -inset-2 rounded-2xl opacity-50 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top right, ${theme.glow}, transparent 70%)` }}
      />

      {/* Card */}
      <div
        className="relative min-w-[280px] max-w-[380px] rounded-lg overflow-hidden"
        style={{
          backgroundColor: theme.bg,
          border: `2px solid ${theme.border}`,
          boxShadow: `0 0 0 1px ${theme.border}44, 0 4px 24px -4px rgba(0,0,0,0.6), 0 0 40px -8px ${theme.accent}15`,
        }}
      >
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] rounded-lg"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)' }}
        />

        {/* Content */}
        <div className="relative px-3.5 py-3">
          {/* Decorative corners */}
          <div className="flex items-center justify-between mb-2">
            <PixelCorner color={theme.accent} />
            <div className="flex-1 mx-2 h-px" style={{ backgroundColor: `${theme.border}66` }} />
            <PixelCorner color={theme.accent} flip />
          </div>

          <div className="flex items-start gap-3">
            {/* Icon */}
            {(item.icon || item.animatedIcon) && (
              <motion.div
                className="mt-0.5 shrink-0"
                initial={{ opacity: 0, scale: 0, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
              >
                {item.animatedIcon ? (
                  <AnimatedPxlKitIcon icon={item.animatedIcon} size={22} colorful />
                ) : item.icon ? (
                  <PxlKitIcon icon={item.icon} size={22} colorful color={theme.accent} />
                ) : null}
              </motion.div>
            )}

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="font-pixel text-[10px] leading-relaxed tracking-wide" style={{ color: theme.accent }}>
                {item.title}
              </p>
              {item.message && (
                <p className="font-mono text-xs leading-relaxed opacity-80 mt-1 break-words" style={{ color: theme.text }}>
                  {item.message}
                </p>
              )}
            </div>

            {/* Close */}
            <motion.button
              type="button"
              aria-label="Close"
              onClick={() => { cleanup(); onDismiss(); }}
              className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded border transition-colors hover:bg-white/5"
              style={{ borderColor: `${theme.accent}55`, color: theme.accent }}
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

        {/* Progress bar */}
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
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────
let toastCounter = 0;

export function ToastProvider({
  children,
  defaultPosition = 'top-right',
  maxToasts = 5,
}: {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  maxToasts?: number;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (options: ToastOptions): string => {
      const id = `toast-${++toastCounter}-${Date.now()}`;
      const item: ToastItem = {
        id,
        tone: options.tone ?? 'info',
        title: options.title,
        message: options.message,
        icon: options.icon,
        animatedIcon: options.animatedIcon,
        duration: options.duration ?? 2500,
        position: options.position ?? defaultPosition,
        createdAt: Date.now(),
      };
      setToasts((prev) => {
        const next = [...prev, item];
        // Enforce max — remove oldest first
        if (next.length > maxToasts) return next.slice(next.length - maxToasts);
        return next;
      });
      return id;
    },
    [defaultPosition, maxToasts]
  );

  const success = useCallback(
    (title: string, message?: string, icon?: PxlKitData) =>
      addToast({ tone: 'success', title, message, icon }),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, icon?: PxlKitData) =>
      addToast({ tone: 'error', title, message, icon }),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, icon?: PxlKitData) =>
      addToast({ tone: 'info', title, message, icon }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, icon?: PxlKitData) =>
      addToast({ tone: 'warning', title, message, icon }),
    [addToast]
  );

  const value: ToastContextValue = { toast: addToast, success, error, info, warning, dismiss, dismissAll };

  // Group by position
  const grouped = toasts.reduce<Record<string, ToastItem[]>>((acc, t) => {
    (acc[t.position] ??= []).push(t);
    return acc;
  }, {});

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Render one container per active position */}
      {Object.entries(grouped).map(([pos, items]) => {
        const bottom = isBottomPosition(pos as ToastPosition);
        return (
          <div
            key={pos}
            className={`fixed z-[200] flex flex-col gap-2 pointer-events-none ${POSITION_CLASSES[pos as ToastPosition]}`}
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            <AnimatePresence mode="popLayout">
              {(bottom ? [...items].reverse() : items).map((item) => (
                <ToastCard
                  key={item.id}
                  item={item}
                  onDismiss={() => dismiss(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </ToastContext.Provider>
  );
}
