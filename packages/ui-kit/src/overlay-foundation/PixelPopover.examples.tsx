import React, { useState } from 'react';
import { PixelPopover } from './PixelPopover';

export function Default() {
  const [open, setOpen] = useState(false);
  return (
    <PixelPopover open={open} onOpenChange={setOpen}>
      <PixelPopover.Trigger>
        <button type="button">Open popover</button>
      </PixelPopover.Trigger>
      <PixelPopover.Content aria-labelledby="popover-title">
        <h3 id="popover-title" className="font-bold mb-1">
          Popover
        </h3>
        <p className="text-sm">Floating content anchored to the trigger.</p>
      </PixelPopover.Content>
    </PixelPopover>
  );
}

export function WithArrow() {
  const [open, setOpen] = useState(false);
  return (
    <PixelPopover open={open} onOpenChange={setOpen} side="bottom" align="center">
      <PixelPopover.Trigger>
        <button type="button">With arrow</button>
      </PixelPopover.Trigger>
      <PixelPopover.Content aria-labelledby="popover-arrow-title">
        <h3 id="popover-arrow-title" className="font-bold mb-1">
          Pointed popover
        </h3>
        <p className="text-sm">Includes a decorative arrow.</p>
        <PixelPopover.Arrow />
      </PixelPopover.Content>
    </PixelPopover>
  );
}

export function SidePlacement() {
  const [open, setOpen] = useState(false);
  return (
    <PixelPopover
      open={open}
      onOpenChange={setOpen}
      side="right"
      align="start"
      sideOffset={12}
    >
      <PixelPopover.Trigger>
        <button type="button">Right / start</button>
      </PixelPopover.Trigger>
      <PixelPopover.Content aria-labelledby="popover-side-title">
        <h3 id="popover-side-title" className="font-bold mb-1">
          Side placement
        </h3>
        <p className="text-sm">Anchored to the right of the trigger.</p>
      </PixelPopover.Content>
    </PixelPopover>
  );
}
