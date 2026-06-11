import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   PixelBareInput — unstyled <input> passthrough for escape-hatch composition.
   ───────────────────────────────────────────────────────────────────────── */

export type PixelBareInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const PixelBareInput = React.forwardRef<HTMLInputElement, PixelBareInputProps>(
  (props, ref) => <input ref={ref} {...props} />,
);
PixelBareInput.displayName = 'PixelBareInput';
