import React from 'react';
import { PixelScrollArea } from './PixelScrollArea';

export function Default() {
  return (
    <PixelScrollArea aria-label="Sample scrollable region" maxHeight={160}>
      <div className="space-y-2 p-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <p key={i} className="text-sm text-retro-muted">
            Scroll item {i + 1}
          </p>
        ))}
      </div>
    </PixelScrollArea>
  );
}

export function AlwaysVisible() {
  return (
    <PixelScrollArea
      aria-label="Always-visible scrollbar"
      type="always"
      maxHeight={140}
      offsetScrollbars
    >
      <div className="space-y-2 p-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <p key={i} className="text-sm text-retro-muted">
            Row {i + 1}
          </p>
        ))}
      </div>
    </PixelScrollArea>
  );
}

export function CustomScrollbarSize() {
  return (
    <PixelScrollArea
      aria-label="Custom scrollbar size"
      type="hover"
      maxHeight={140}
      scrollbarSize={10}
    >
      <div className="space-y-2 p-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <p key={i} className="text-sm text-retro-muted">
            Hover row {i + 1}
          </p>
        ))}
      </div>
    </PixelScrollArea>
  );
}
