import React from 'react';
import { PixelAlert } from '../feedback';
import { PixelButton } from '../actions';

export function Default() {
  return (
    <PixelAlert
      title="Something went wrong"
      message="Your session expired. Please sign in again to continue."
    />
  );
}

const InfoIcon = () => (
  <span
    aria-hidden
    style={{
      width: 14,
      height: 14,
      borderRadius: 9999,
      background: 'currentColor',
      display: 'inline-block',
    }}
  />
);

export function Tones() {
  return (
    <div className="flex flex-col gap-3">
      <PixelAlert tone="neutral" title="Heads up" message="Neutral informational banner." />
      <PixelAlert tone="green" title="Saved" message="Your changes have been persisted." />
      <PixelAlert tone="cyan" title="New feature" message="Try the redesigned inbox." />
      <PixelAlert tone="gold" title="Warning" message="Storage is almost full." />
      <PixelAlert tone="red" title="Error" message="Failed to upload the file." />
      <PixelAlert tone="purple" title="Tip" message="Use ⌘K to jump anywhere." />
      <PixelAlert tone="pink" title="Highlight" message="You unlocked a new badge." />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelAlert
        surface="linear"
        tone="cyan"
        title="Linear surface"
        message="Soft border with rounded corners."
      />
      <PixelAlert
        surface="pixel"
        tone="cyan"
        title="Pixel surface"
        message="Chamfered border with a left accent stripe."
      />
    </div>
  );
}

export function WithIcon() {
  return (
    <PixelAlert
      tone="cyan"
      title="Pro tip"
      message="You can drag-and-drop files anywhere on the page."
      icon={<InfoIcon />}
    />
  );
}

export function WithAction() {
  return (
    <PixelAlert
      tone="red"
      title="Connection lost"
      message="We couldn't reach the server. Check your network and retry."
      icon={<InfoIcon />}
      action={
        <PixelButton size="sm" tone="red" variant="outline">
          Retry
        </PixelButton>
      }
    />
  );
}

export function PoliteLive() {
  return (
    <PixelAlert
      tone="green"
      live="polite"
      title="Auto-saved"
      message="Drafts are saved every few seconds."
    />
  );
}
