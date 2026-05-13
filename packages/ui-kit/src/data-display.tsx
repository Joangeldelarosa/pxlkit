import React, { useState } from 'react';
import {
  Tone, Size, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon, CloseIcon,
} from './common';
import { PixelButton } from './actions';
import { usePxlKitLocale } from './locale';

/* ──────────────────────────────────────────────────────────────────────────
   PixelCard — container with title, icon, body, optional footer.
   Pixel surface uses thick border + offset shadow as signature.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelCard({
  title,
  icon,
  children,
  footer,
  surface: surfaceProp,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <article className={cn('bg-retro-surface/60 p-4 transition-colors', s.border, s.radiusLg, 'border-retro-border/40 hover:border-retro-border/60')}>
      <header className="mb-3 flex items-center gap-2 border-b border-retro-border/30 pb-3">
        {icon && <span className="inline-flex items-center justify-center shrink-0">{icon}</span>}
        <h4 className={cn('text-sm font-semibold text-retro-text', s.font)}>{title}</h4>
      </header>
      <div className="text-sm text-retro-muted">{children}</div>
      {footer && <footer className="mt-4 border-t border-retro-border/30 pt-3">{footer}</footer>}
    </article>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelStatCard — compact metric card.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelStatCard({
  label,
  value,
  icon,
  tone = 'gold',
  trend,
  surface: surfaceProp,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: Tone;
  trend?: string;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div className={cn('p-4', s.border, s.radiusLg, toneMap[tone].border, toneMap[tone].soft)}>
      <div className="mb-3 flex items-center justify-between">
        <p className={cn('text-xs text-retro-muted', s.font)}>{label}</p>
        {icon && <span className={cn('inline-flex items-center justify-center shrink-0 text-sm', toneMap[tone].text)}>{icon}</span>}
      </div>
      <p className={cn('text-sm text-retro-text', surface === 'pixel' ? 'font-pixel' : 'font-semibold text-base')}>{value}</p>
      {trend && <p className={cn('mt-2 text-xs text-retro-muted', s.font)}>{trend}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelTable — data table with striped rows + hover highlight.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelTable({
  columns,
  data,
  striped = true,
  surface: surfaceProp,
}: {
  columns: Array<{ key: string; header: string; className?: string }>;
  data: Array<Record<string, React.ReactNode>>;
  striped?: boolean;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div className={cn('overflow-x-auto', s.border, s.radius, 'border-retro-border')}>
      <table className={cn('w-full text-left text-sm', s.font)}>
        <thead>
          <tr className={cn('bg-retro-surface/60', surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border')}>
            {columns.map((col) => (
              <th key={col.key} className={cn('whitespace-nowrap px-4 py-2.5 text-xs font-semibold text-retro-muted', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={cn(
                'border-b border-retro-border/20 transition-colors hover:bg-retro-surface/30',
                striped && idx % 2 === 1 && 'bg-retro-surface/15',
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-2.5 text-retro-text', col.className)}>
                  {row[col.key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelAvatar — initials/image with bordered square (pixel) or circle (linear).
   ────────────────────────────────────────────────────────────────────────── */

export function PixelAvatar({
  name,
  src,
  size = 'md',
  tone = 'green',
  surface: surfaceProp,
}: {
  name: string;
  src?: string;
  size?: Size;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  const dim = size === 'sm' ? 'h-8 w-8 text-[9px]' : size === 'lg' ? 'h-12 w-12 text-xs' : 'h-10 w-10 text-[10px]';
  const initials = upper(name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2));
  const radius = surface === 'pixel' ? 'rounded-[3px]' : 'rounded-lg';
  const fontFamily = surface === 'pixel' ? 'font-pixel' : 'font-semibold';
  return (
    <div
      className={cn('inline-flex items-center justify-center overflow-hidden', s.border, radius, dim, toneMap[tone].border, toneMap[tone].soft, toneMap[tone].text, fontFamily)}
      title={name}
    >
      {src ? <img src={src} alt={name} className={cn('h-full w-full object-cover', radius)} /> : initials}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelBadge — read-only status badge. Pixel surface = chamfered, linear = pill.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelBadge({
  children,
  tone = 'green',
  surface: surfaceProp,
}: {
  children: React.ReactNode;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 text-[11px] leading-none', s.border, s.radiusFull, s.font, toneMap[tone].text, toneMap[tone].border, toneMap[tone].soft)}>
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelChip — removable label tag.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelChip({
  label,
  tone = 'cyan',
  onRemove,
  surface: surfaceProp,
}: {
  label: string;
  tone?: Tone;
  onRemove?: () => void;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs', s.border, s.radius, s.font, toneMap[tone].text, toneMap[tone].border, toneMap[tone].soft)}>
      {label}
      {onRemove && (
        <button
          type="button"
          className={cn('p-0.5 transition-colors hover:bg-retro-bg/50', s.radius)}
          onClick={onRemove}
          aria-label={`Remove ${label}`}
        >
          <CloseIcon className="h-2 w-2" />
        </button>
      )}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelTextLink — anchor or button styled as a tone-coloured underline.
   ────────────────────────────────────────────────────────────────────────── */

type PixelTextLinkCommon = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  surface?: Surface;
};

type PixelTextLinkAnchorProps = PixelTextLinkCommon
  & { href: string }
  & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;

type PixelTextLinkButtonProps = PixelTextLinkCommon
  & { href?: undefined }
  & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

type PixelTextLinkProps = PixelTextLinkAnchorProps | PixelTextLinkButtonProps;

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

/* ──────────────────────────────────────────────────────────────────────────
   PixelCollapsible — toggleable details block with a chevron header.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelCollapsible({
  label,
  children,
  defaultOpen = false,
  tone = 'neutral',
  surface: surfaceProp,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <PixelButton
        type="button"
        size="sm"
        tone={tone}
        surface={surface}
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        iconRight={<ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />}
        className="h-auto px-1.5 py-0.5 text-xs"
      >
        {label}
      </PixelButton>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelCodeInline — inline <code> with tone tinting.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelCodeInline({
  children,
  tone = 'cyan',
  surface: surfaceProp,
}: {
  children: React.ReactNode;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <code className={cn('px-1.5 py-0.5 text-xs', s.border, s.radius, s.font, toneMap[tone].border, toneMap[tone].soft, toneMap[tone].text)}>
      {children}
    </code>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelKbd — styled keyboard shortcut indicator.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelKbd({
  children,
  surface: surfaceProp,
}: {
  children: React.ReactNode;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center px-1.5 text-[10px] text-retro-muted',
        s.border, s.radius, s.font,
        'border-retro-border bg-retro-surface',
        surface === 'pixel'
          ? 'shadow-[0_2px_0_0_rgba(0,0,0,0.25)]'
          : 'shadow-[0_1px_0_0_rgba(0,0,0,0.15)]',
      )}
    >
      {children}
    </kbd>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelColorSwatch — design token preview with CSS var label.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelColorSwatch({
  name,
  cssVar,
  surface: surfaceProp,
}: {
  name: string;
  cssVar: string;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn('h-8 w-8', s.border, s.radius, 'border-retro-border/50')}
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <p className={cn('text-xs text-retro-text', s.font)}>{name}</p>
        <p className={cn('text-[10px] text-retro-muted', s.font)}>{cssVar}</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Bare primitives — unstyled passthroughs used for escape-hatch composition.
   ────────────────────────────────────────────────────────────────────────── */

export const PixelBareButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ type = 'button', ...props }, ref) => <button ref={ref} type={type} {...props} />,
);
PixelBareButton.displayName = 'PixelBareButton';

export const PixelBareInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} {...props} />,
);
PixelBareInput.displayName = 'PixelBareInput';

export const PixelBareTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => <textarea ref={ref} {...props} />,
);
PixelBareTextarea.displayName = 'PixelBareTextarea';
