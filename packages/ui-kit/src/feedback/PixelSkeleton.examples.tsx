import React from 'react';
import { PixelSkeleton } from '../feedback';

export function Default() {
  return <PixelSkeleton width="12rem" height="1rem" />;
}

export function TextBlock() {
  return (
    <div className="flex flex-col gap-2">
      <PixelSkeleton width="14rem" height="0.75rem" />
      <PixelSkeleton width="11rem" height="0.75rem" />
      <PixelSkeleton width="9rem" height="0.75rem" />
    </div>
  );
}

export function Rounded() {
  return (
    <div className="flex items-center gap-3">
      <PixelSkeleton width="2.5rem" height="2.5rem" rounded />
      <div className="flex flex-col gap-1.5">
        <PixelSkeleton width="8rem" height="0.75rem" />
        <PixelSkeleton width="5rem" height="0.75rem" />
      </div>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelSkeleton surface="linear" width="14rem" height="1rem" />
      <PixelSkeleton surface="pixel" width="14rem" height="1rem" />
    </div>
  );
}

export function CardPlaceholder() {
  return (
    <div className="flex w-72 flex-col gap-3 rounded border border-retro-border/60 p-4">
      <PixelSkeleton width="100%" height="8rem" />
      <PixelSkeleton width="80%" height="0.875rem" />
      <PixelSkeleton width="60%" height="0.75rem" />
    </div>
  );
}

export function CustomLabel() {
  return <PixelSkeleton width="10rem" height="1rem" ariaLabel="Loading user profile" />;
}
