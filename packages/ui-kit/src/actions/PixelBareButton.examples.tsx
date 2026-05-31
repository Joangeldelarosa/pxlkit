import React from 'react';
import { PixelBareButton } from '../data-display';

export function Default() {
  return <PixelBareButton>Bare button</PixelBareButton>;
}

export function WithCustomClass() {
  return (
    <PixelBareButton className="rounded-md border border-retro-border bg-retro-surface px-3 py-1 text-sm text-retro-text">
      Styled by consumer
    </PixelBareButton>
  );
}

export function Disabled() {
  return (
    <PixelBareButton disabled className="cursor-not-allowed opacity-50">
      Disabled
    </PixelBareButton>
  );
}

export function WithOnClick() {
  const [count, setCount] = React.useState(0);
  return (
    <PixelBareButton onClick={() => setCount((c) => c + 1)}>
      Clicked {count} times
    </PixelBareButton>
  );
}

export function SubmitType() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="flex gap-2"
    >
      <PixelBareButton type="submit">Submit</PixelBareButton>
      <PixelBareButton type="reset">Reset</PixelBareButton>
    </form>
  );
}

export function AsIconTrigger() {
  return (
    <PixelBareButton
      aria-label="Close"
      className="inline-flex h-6 w-6 items-center justify-center text-retro-muted hover:text-retro-text"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </PixelBareButton>
  );
}
