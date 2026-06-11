import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   PixelBareTextarea — unstyled <textarea> passthrough for escape-hatch composition.
   ───────────────────────────────────────────────────────────────────────── */

export type PixelBareTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const PixelBareTextarea = React.forwardRef<HTMLTextAreaElement, PixelBareTextareaProps>(
  (props, ref) => <textarea ref={ref} {...props} />,
);
PixelBareTextarea.displayName = 'PixelBareTextarea';
