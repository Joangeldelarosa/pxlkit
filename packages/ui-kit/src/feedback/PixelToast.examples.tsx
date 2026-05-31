import React from 'react';
import { PixelToast, type ToastItem } from '../toast';
import { PixelButton } from '../actions';

const noop = () => {};

const baseToast = (overrides: Partial<ToastItem> = {}): ToastItem => ({
  id: 'demo',
  title: 'Saved',
  message: 'Your changes have been persisted.',
  tone: 'cyan',
  duration: 0,
  ...overrides,
});

export function Default() {
  return <PixelToast toast={baseToast()} onDismiss={noop} />;
}

export function Tones() {
  return (
    <div className="flex flex-col gap-3">
      <PixelToast
        toast={baseToast({ id: 't-neutral', tone: 'neutral', title: 'Heads up', message: 'Neutral notification.' })}
        onDismiss={noop}
      />
      <PixelToast
        toast={baseToast({ id: 't-green', tone: 'green', title: 'Saved', message: 'Changes synced.' })}
        onDismiss={noop}
      />
      <PixelToast
        toast={baseToast({ id: 't-cyan', tone: 'cyan', title: 'Info', message: 'Heads up — new build available.' })}
        onDismiss={noop}
      />
      <PixelToast
        toast={baseToast({ id: 't-gold', tone: 'gold', title: 'Warning', message: 'Storage almost full.' })}
        onDismiss={noop}
      />
      <PixelToast
        toast={baseToast({ id: 't-red', tone: 'red', title: 'Error', message: 'Upload failed.' })}
        onDismiss={noop}
      />
      <PixelToast
        toast={baseToast({ id: 't-purple', tone: 'purple', title: 'Tip', message: 'Press ⌘K to search.' })}
        onDismiss={noop}
      />
      <PixelToast
        toast={baseToast({ id: 't-pink', tone: 'pink', title: 'Unlocked', message: 'You earned a badge.' })}
        onDismiss={noop}
      />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelToast
        surface="linear"
        toast={baseToast({ id: 't-linear', tone: 'cyan', title: 'Linear surface', message: 'Rounded card.' })}
        onDismiss={noop}
      />
      <PixelToast
        surface="pixel"
        toast={baseToast({ id: 't-pixel', tone: 'cyan', title: 'Pixel surface', message: 'Chamfered + HP bar.' })}
        onDismiss={noop}
      />
    </div>
  );
}

export function Loading() {
  return (
    <PixelToast
      toast={baseToast({
        id: 't-loading',
        tone: 'cyan',
        title: 'Uploading…',
        message: 'Hang tight while we sync your files.',
        loading: true,
      })}
      onDismiss={noop}
    />
  );
}

export function WithAction() {
  return (
    <PixelToast
      toast={baseToast({
        id: 't-action',
        tone: 'red',
        title: 'Connection lost',
        message: 'We could not reach the server.',
        action: (
          <PixelButton size="sm" tone="red" variant="outline">
            Retry
          </PixelButton>
        ),
      })}
      onDismiss={noop}
    />
  );
}

const DotIcon = () => (
  <span
    aria-hidden
    style={{
      width: 10,
      height: 10,
      borderRadius: 9999,
      background: 'currentColor',
      display: 'inline-block',
    }}
  />
);

export function WithIcon() {
  return (
    <PixelToast
      toast={baseToast({
        id: 't-icon',
        tone: 'green',
        title: 'Deployed',
        message: 'Build #482 is live.',
        icon: <DotIcon />,
      })}
      onDismiss={noop}
    />
  );
}

export function Assertive() {
  return (
    <PixelToast
      toast={baseToast({
        id: 't-assertive',
        tone: 'cyan',
        title: 'Important',
        message: 'Forced assertive announcement.',
        assertive: true,
      })}
      onDismiss={noop}
    />
  );
}

export function WithProgress() {
  return (
    <PixelToast
      toast={baseToast({
        id: 't-progress',
        tone: 'green',
        title: 'Auto-dismiss',
        message: 'Hover to pause the countdown bar.',
        duration: 4500,
      })}
      onDismiss={noop}
    />
  );
}
