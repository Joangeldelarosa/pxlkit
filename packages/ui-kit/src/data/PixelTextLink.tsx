import React from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelTextLink — anchor or button styled as a tone-coloured underline.
   ───────────────────────────────────────────────────────────────────────── */

type PixelTextLinkCommon = {
  /** Link content. */
  children: React.ReactNode;
  /** Tone tint. Defaults to `'cyan'`. */
  tone?: Tone;
  /** Extra class names. */
  className?: string;
  /** Visual surface override. */
  surface?: Surface;
};

type PixelTextLinkAnchorProps = PixelTextLinkCommon
  & { href: string }
  & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;

type PixelTextLinkButtonProps = PixelTextLinkCommon
  & { href?: undefined }
  & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export type PixelTextLinkProps = PixelTextLinkAnchorProps | PixelTextLinkButtonProps;

export function PixelTextLink({
  children,
  tone = 'cyan',
  className,
  href,
  surface: surfaceProp,
  ...props
}: PixelTextLinkProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const cls = cn(
    'underline underline-offset-2 decoration-current/40 transition-colors cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
    toneMap[tone].ring,
    s.font,
    toneMap[tone].text,
    tone === 'cyan' && 'hover:text-retro-green',
    tone !== 'cyan' && 'hover:opacity-80',
    className,
  );

  if (href) {
    const anchorProps = props as PixelTextLinkAnchorProps;
    const { href: _href, ...anchorRest } = anchorProps;
    return <a href={href} className={cls} {...anchorRest}>{children}</a>;
  }

  const buttonProps = props as PixelTextLinkButtonProps;
  return <button type="button" className={cls} {...buttonProps}>{children}</button>;
}
