import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   PixelBareButton — unstyled <button> passthrough for escape-hatch composition.
   ───────────────────────────────────────────────────────────────────────── */

export type PixelBareButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PixelBareButton = React.forwardRef<HTMLButtonElement, PixelBareButtonProps>(
  ({ type = 'button', ...props }, ref) => <button ref={ref} type={type} {...props} />,
);
PixelBareButton.displayName = 'PixelBareButton';
