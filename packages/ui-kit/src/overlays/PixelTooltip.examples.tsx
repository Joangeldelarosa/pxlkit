import React, { useState } from 'react';
import { PixelTooltip } from './PixelTooltip';
import { PixelButton } from '../actions';

export function Default() {
  return (
    <PixelTooltip label="Save your changes">
      <PixelButton>Save</PixelButton>
    </PixelTooltip>
  );
}

export function Positions() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <PixelTooltip label="Top tooltip" position="top">
        <PixelButton>Top</PixelButton>
      </PixelTooltip>
      <PixelTooltip label="Bottom tooltip" position="bottom">
        <PixelButton>Bottom</PixelButton>
      </PixelTooltip>
      <PixelTooltip label="Left tooltip" position="left">
        <PixelButton>Left</PixelButton>
      </PixelTooltip>
      <PixelTooltip label="Right tooltip" position="right">
        <PixelButton>Right</PixelButton>
      </PixelTooltip>
    </div>
  );
}

export function Triggers() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <PixelTooltip label="Opens on hover or focus" trigger="hover">
        <PixelButton>Hover</PixelButton>
      </PixelTooltip>
      <PixelTooltip label="Opens on focus only" trigger="focus">
        <PixelButton>Focus</PixelButton>
      </PixelTooltip>
      <PixelTooltip label="Click to toggle, Escape to close" trigger="click">
        <PixelButton>Click</PixelButton>
      </PixelTooltip>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <PixelTooltip label="Pixel surface" surface="pixel">
        <PixelButton surface="pixel">Pixel</PixelButton>
      </PixelTooltip>
      <PixelTooltip label="Linear surface" surface="linear">
        <PixelButton surface="linear">Linear</PixelButton>
      </PixelTooltip>
    </div>
  );
}

export function RichContent() {
  return (
    <PixelTooltip
      content={
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">Keyboard shortcut</span>
          <span className="opacity-80">Press ⌘K to open the command palette</span>
        </span>
      }
    >
      <PixelButton>Hover for details</PixelButton>
    </PixelTooltip>
  );
}

export function CustomDelay() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <PixelTooltip label="Opens instantly" delay={{ open: 0, close: 0 }}>
        <PixelButton>Instant</PixelButton>
      </PixelTooltip>
      <PixelTooltip label="Slow open, fast close" delay={{ open: 600, close: 0 }}>
        <PixelButton>Slow open</PixelButton>
      </PixelTooltip>
    </div>
  );
}

export function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <PixelTooltip open={open} onOpenChange={setOpen} label="Controlled tooltip">
        <PixelButton>Anchor</PixelButton>
      </PixelTooltip>
      <PixelButton tone="cyan" variant="outline" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide' : 'Show'}
      </PixelButton>
    </div>
  );
}

export function Uncontrolled() {
  return (
    <PixelTooltip defaultOpen label="Open by default" trigger="click">
      <PixelButton>Click to toggle</PixelButton>
    </PixelTooltip>
  );
}

export function SideOffset() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <PixelTooltip label="Tight (2px)" sideOffset={2}>
        <PixelButton>Tight</PixelButton>
      </PixelTooltip>
      <PixelTooltip label="Roomy (16px)" sideOffset={16}>
        <PixelButton>Roomy</PixelButton>
      </PixelTooltip>
    </div>
  );
}
