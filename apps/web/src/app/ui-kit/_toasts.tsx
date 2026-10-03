'use client';

import { useState, type ReactNode } from 'react';
import { AnimatedPxlKitIcon, PxlKitIcon } from '@pxlkit/core';
import { Bell, CheckCircle, InfoCircle, WarningTriangle } from '@pxlkit/feedback';
import { FireSword } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelSelect,
  PixelSlider,
  PixelToast,
  PxlKitToastProvider,
  useToast,
  type ToastItem,
  type ToastPosition,
} from '@pxlkit/ui-kit';

type Shortcut = 'success' | 'error' | 'info' | 'warning';

const SHORTCUTS: { value: Shortcut; label: string; icon: ReactNode; title: string; message: string }[] = [
  {
    value: 'success',
    label: 'Success',
    icon: <PxlKitIcon icon={CheckCircle} size={14} />,
    title: 'Saved',
    message: 'Your changes were saved.',
  },
  {
    value: 'error',
    label: 'Error',
    icon: <PxlKitIcon icon={WarningTriangle} size={14} />,
    title: 'Not saved',
    message: 'The server did not answer. Try again.',
  },
  {
    value: 'info',
    label: 'Info',
    icon: <PxlKitIcon icon={InfoCircle} size={14} />,
    title: 'Syncing',
    message: 'Fetching the latest updates.',
  },
  {
    value: 'warning',
    label: 'Warning',
    icon: <PxlKitIcon icon={Bell} size={14} />,
    title: 'Heads up',
    message: 'This action needs a confirmation.',
  },
];

const POSITIONS: { value: ToastPosition; label: string }[] = [
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
];

/** Cards that stay until dismissed: tones, an icon, a loading spinner, an action. */
const GALLERY: ToastItem[] = [
  {
    id: 'saved',
    title: 'Saved',
    message: 'Your changes were saved.',
    tone: 'green',
    duration: 0,
    icon: <PxlKitIcon icon={CheckCircle} size={16} />,
  },
  {
    id: 'not-saved',
    title: 'Not saved',
    message: 'The server did not answer. Try again.',
    tone: 'red',
    duration: 0,
    icon: <PxlKitIcon icon={WarningTriangle} size={16} />,
  },
  { id: 'syncing', title: 'Syncing…', message: 'Fetching the latest updates.', tone: 'cyan', loading: true },
  {
    id: 'deleted',
    title: 'File deleted',
    message: 'report.pdf went to the bin.',
    tone: 'gold',
    duration: 0,
    action: (
      <PixelButton size="sm" tone="gold" variant="ghost">
        Undo
      </PixelButton>
    ),
  },
];

/**
 * The card each toast renders as, on its own: the provider draws these in
 * its viewport. Dismissing one takes it away until the reader shows them
 * again.
 */
export function ToastGallery() {
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {GALLERY.filter(({ id }) => !dismissed.has(id)).map((toast) => (
          <PixelToast
            key={toast.id}
            toast={toast}
            onDismiss={() => setDismissed((current) => new Set(current).add(toast.id))}
          />
        ))}
      </div>
      {dismissed.size > 0 && (
        <PixelButton size="sm" tone="neutral" variant="ghost" onClick={() => setDismissed(new Set())}>
          Show every card again
        </PixelButton>
      )}
    </div>
  );
}

/**
 * The UI kit's toasts, live: its `PxlKitToastProvider` around controls that
 * push toasts through `useToast()` — a tone shortcut, a position, a
 * duration, an animated icon and a promise.
 */
export function ToastPlayground() {
  const [position, setPosition] = useState<ToastPosition>('top-right');
  return (
    <PxlKitToastProvider position={position}>
      <ToastControls position={position} onPositionChange={setPosition} />
    </PxlKitToastProvider>
  );
}

function ToastControls({
  position,
  onPositionChange,
}: {
  position: ToastPosition;
  onPositionChange: (position: ToastPosition) => void;
}) {
  const { toast } = useToast();
  const [shortcut, setShortcut] = useState<Shortcut>('success');
  const [duration, setDuration] = useState(4500);
  const picked = SHORTCUTS.find(({ value }) => value === shortcut)!;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <PixelSelect
          label="Shortcut"
          value={shortcut}
          onChange={(value) => setShortcut(value as Shortcut)}
          options={SHORTCUTS.map(({ value, label, icon }) => ({ value, label, icon }))}
        />
        <PixelSelect
          label="Position"
          value={position}
          onChange={(value) => onPositionChange(value as ToastPosition)}
          options={POSITIONS}
        />
        <div className="max-w-sm">
          <PixelSlider
            label="Duration (ms)"
            min={1000}
            max={8000}
            step={250}
            value={duration}
            onChange={setDuration}
            tone="gold"
            showMinMax
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <PixelButton
          tone="green"
          iconLeft={picked.icon}
          onClick={() => toast[shortcut]({ title: picked.title, message: picked.message, duration })}
        >
          {`toast.${shortcut}()`}
        </PixelButton>
        <PixelButton
          tone="purple"
          iconLeft={<AnimatedPxlKitIcon icon={FireSword} size={14} />}
          onClick={() =>
            toast[shortcut]({
              title: 'Pixel event',
              message: `${picked.label} · ${position} · ${duration} ms`,
              duration,
              animatedIcon: <AnimatedPxlKitIcon icon={FireSword} size={16} />,
            })
          }
        >
          Animated icon
        </PixelButton>
        <PixelButton
          tone="cyan"
          variant="ghost"
          onClick={() =>
            void toast.promise(() => new Promise<void>((resolve) => setTimeout(resolve, 1500)), {
              loading: { title: 'Saving…' },
              success: { title: 'Saved', message: 'Done in 1.5 s.', duration },
              error: { title: 'Not saved' },
            })
          }
        >
          toast.promise()
        </PixelButton>
      </div>
    </div>
  );
}
