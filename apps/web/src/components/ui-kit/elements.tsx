'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */

type Tone = 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'neutral';
type Size = 'sm' | 'md' | 'lg';
type Option = { value: string; label: string; icon?: React.ReactNode };
type TabItem = { id: string; label: string; icon?: React.ReactNode; content: React.ReactNode };
type AccordionItem = { id: string; title: string; content: React.ReactNode };

/* ═══════════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════════ */

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════════════════════ */

const toneMap: Record<Tone, { ring: string; text: string; border: string; bg: string; soft: string; hover: string; fill: string }> = {
  green: {
    ring: 'focus-visible:ring-retro-green/40',
    text: 'text-retro-green',
    border: 'border-retro-green/40',
    bg: 'bg-retro-green/10',
    soft: 'bg-retro-green/5',
    hover: 'hover:bg-retro-green/15',
    fill: 'bg-retro-green',
  },
  cyan: {
    ring: 'focus-visible:ring-retro-cyan/40',
    text: 'text-retro-cyan',
    border: 'border-retro-cyan/40',
    bg: 'bg-retro-cyan/10',
    soft: 'bg-retro-cyan/5',
    hover: 'hover:bg-retro-cyan/15',
    fill: 'bg-retro-cyan',
  },
  gold: {
    ring: 'focus-visible:ring-retro-gold/40',
    text: 'text-retro-gold',
    border: 'border-retro-gold/40',
    bg: 'bg-retro-gold/10',
    soft: 'bg-retro-gold/5',
    hover: 'hover:bg-retro-gold/15',
    fill: 'bg-retro-gold',
  },
  red: {
    ring: 'focus-visible:ring-retro-red/40',
    text: 'text-retro-red',
    border: 'border-retro-red/40',
    bg: 'bg-retro-red/10',
    soft: 'bg-retro-red/5',
    hover: 'hover:bg-retro-red/15',
    fill: 'bg-retro-red',
  },
  purple: {
    ring: 'focus-visible:ring-retro-purple/40',
    text: 'text-retro-purple',
    border: 'border-retro-purple/40',
    bg: 'bg-retro-purple/10',
    soft: 'bg-retro-purple/5',
    hover: 'hover:bg-retro-purple/15',
    fill: 'bg-retro-purple',
  },
  neutral: {
    ring: 'focus-visible:ring-retro-border/60',
    text: 'text-retro-text',
    border: 'border-retro-border',
    bg: 'bg-retro-surface',
    soft: 'bg-retro-surface/50',
    hover: 'hover:bg-retro-surface/80',
    fill: 'bg-retro-text',
  },
};

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-sm gap-2.5',
};

const focusRing = 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg';

const inputBase =
  'w-full rounded-md border bg-retro-bg/70 text-retro-text font-mono transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed';

/* ═══════════════════════════════════════════════════════════════════════════════
   PIXEL MICRO-ICONS  (inline SVG, no external deps)
   ═══════════════════════════════════════════════════════════════════════════════ */

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('h-2.5 w-2.5 shrink-0', className)} shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="2" width="1" height="1" />
      <rect x="2" y="3" width="1" height="1" />
      <rect x="3" y="4" width="2" height="1" />
      <rect x="5" y="3" width="1" height="1" />
      <rect x="6" y="2" width="1" height="1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('h-3 w-3', className)} shapeRendering="crispEdges" fill="currentColor">
      <rect x="6" y="1" width="1" height="1" />
      <rect x="5" y="2" width="1" height="1" />
      <rect x="4" y="3" width="1" height="1" />
      <rect x="3" y="4" width="1" height="1" />
      <rect x="2" y="4" width="1" height="1" />
      <rect x="1" y="3" width="1" height="1" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('h-3 w-3', className)} shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="1" width="1" height="1" />
      <rect x="2" y="2" width="1" height="1" />
      <rect x="5" y="2" width="1" height="1" />
      <rect x="6" y="1" width="1" height="1" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="1" y="6" width="1" height="1" />
      <rect x="2" y="5" width="1" height="1" />
      <rect x="5" y="5" width="1" height="1" />
      <rect x="6" y="6" width="1" height="1" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   INTERNALS
   ═══════════════════════════════════════════════════════════════════════════════ */

function FieldShell({ label, hint, error, children }: { label?: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-xs font-mono text-retro-muted">{label}</span>}
      {children}
      {error ? (
        <span className="text-xs font-mono text-retro-red">{error}</span>
      ) : hint ? (
        <span className="text-xs font-mono text-retro-muted">{hint}</span>
      ) : null}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LAYOUT
   ═══════════════════════════════════════════════════════════════════════════════ */

export function PixelSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-retro-border/40 bg-retro-card/40 p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="font-pixel text-xs text-retro-green">{title.toUpperCase()}</h3>
        {subtitle && <p className="mt-2 text-sm text-retro-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function PixelDivider({ label, tone = 'neutral', spacing = 'none', className }: { label?: string; tone?: Tone; /** Symmetric vertical padding. */ spacing?: 'none' | 'sm' | 'md' | 'lg'; className?: string }) {
  const spacingClass = spacing === 'lg' ? 'py-10' : spacing === 'md' ? 'py-6' : spacing === 'sm' ? 'py-3' : '';
  if (!label) return <hr className={cn('border-retro-border/40', spacingClass, className)} />;
  return (
    <div className={cn('flex items-center gap-3', spacingClass, className)}>
      <hr className="flex-1 border-retro-border/40" />
      <span className={cn('text-[10px] font-pixel uppercase tracking-wider', toneMap[tone].text)}>{label}</span>
      <hr className="flex-1 border-retro-border/40" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ACTIONS
   ═══════════════════════════════════════════════════════════════════════════════ */

export function PixelButton({
  tone = 'green',
  size = 'md',
  variant = 'solid',
  iconLeft,
  iconRight,
  loading,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  size?: Size;
  variant?: 'solid' | 'ghost';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}) {
  const t = toneMap[tone];
  const isGhost = variant === 'ghost';
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-mono font-medium transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClass[size],
        focusRing,
        t.ring,
        t.text,
        isGhost
          ? cn('border border-transparent bg-transparent', t.hover)
          : cn('border', t.border, t.bg, t.hover),
        !props.disabled && 'active:scale-[0.97]',
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" /> : iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}

export function PxlKitButton({
  label,
  tone = 'cyan',
  size = 'md',
  icon,
  className,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string;
  tone?: Tone;
  size?: Size;
  icon: React.ReactNode;
}) {
  const t = toneMap[tone];
  const dim = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md border transition-all outline-none active:scale-95',
        dim,
        t.text, t.border, t.bg, t.hover,
        focusRing, t.ring,
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

export function PixelSplitButton({
  label,
  options,
  tone = 'purple',
  onPrimary,
  onSelect,
}: {
  label: string;
  options: Option[];
  tone?: Tone;
  onPrimary?: () => void;
  onSelect?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative inline-flex">
      <div className="inline-flex overflow-hidden rounded-md border border-retro-border/50">
        <PixelButton tone={tone} className="rounded-none border-0" onClick={onPrimary}>
          {label}
        </PixelButton>
        <button
          type="button"
          aria-label="More options"
          className={cn(
            'flex items-center border-0 border-l border-retro-border/50 px-2 transition-colors',
            toneMap[tone].bg, toneMap[tone].hover, toneMap[tone].text,
          )}
          onClick={() => setOpen(!open)}
        >
          <ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-1 min-w-40 rounded-md border border-retro-border bg-retro-bg p-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="flex w-full items-center rounded px-3 py-2 text-left text-xs font-mono text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text"
              onClick={() => { onSelect?.(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DATA DISPLAY
   ═══════════════════════════════════════════════════════════════════════════════ */

export function PixelCard({
  title,
  icon,
  children,
  footer,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-retro-border/40 bg-retro-surface/60 p-4 transition-colors hover:border-retro-border/60">
      <header className="mb-3 flex items-center gap-2 border-b border-retro-border/30 pb-3">
        {icon}
        <h4 className="font-mono text-sm font-semibold text-retro-text">{title}</h4>
      </header>
      <div className="text-sm text-retro-muted">{children}</div>
      {footer && <footer className="mt-4 border-t border-retro-border/30 pt-3">{footer}</footer>}
    </article>
  );
}

export function PixelStatCard({
  label,
  value,
  icon,
  tone = 'gold',
  trend,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: Tone;
  trend?: string;
}) {
  return (
    <div className={cn('rounded-xl border p-4', toneMap[tone].border, toneMap[tone].soft)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-mono text-retro-muted">{label}</p>
        <span className={cn('text-sm', toneMap[tone].text)}>{icon}</span>
      </div>
      <p className="font-pixel text-sm text-retro-text">{value}</p>
      {trend && <p className="mt-2 text-xs font-mono text-retro-muted">{trend}</p>}
    </div>
  );
}

export function PixelTable({
  columns,
  data,
  striped = true,
}: {
  columns: Array<{ key: string; header: string; className?: string }>;
  data: Array<Record<string, React.ReactNode>>;
  striped?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-retro-border">
      <table className="w-full text-left font-mono text-sm">
        <thead>
          <tr className="border-b border-retro-border bg-retro-surface/60">
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

export function PixelAvatar({
  name,
  src,
  size = 'md',
  tone = 'green',
}: {
  name: string;
  src?: string;
  size?: Size;
  tone?: Tone;
}) {
  const dim = size === 'sm' ? 'h-8 w-8 text-[9px]' : size === 'lg' ? 'h-12 w-12 text-xs' : 'h-10 w-10 text-[10px]';
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={cn('inline-flex items-center justify-center rounded-lg border font-pixel', dim, toneMap[tone].border, toneMap[tone].soft, toneMap[tone].text)}
      title={name}
    >
      {src ? <img src={src} alt={name} className="h-full w-full rounded-lg object-cover" /> : initials}
    </div>
  );
}

export function PixelBadge({ children, tone = 'green' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-mono leading-none', toneMap[tone].text, toneMap[tone].border, toneMap[tone].soft)}>
      {children}
    </span>
  );
}

export function PixelChip({
  label,
  tone = 'cyan',
  onRemove,
}: {
  label: string;
  tone?: Tone;
  onRemove?: () => void;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono', toneMap[tone].text, toneMap[tone].border, toneMap[tone].soft)}>
      {label}
      {onRemove && (
        <button
          type="button"
          className="rounded p-0.5 transition-colors hover:bg-retro-bg/50"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
        >
          <CloseIcon className="h-2 w-2" />
        </button>
      )}
    </span>
  );
}

type PixelTextLinkCommon = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
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
  ...props
}: PixelTextLinkProps) {
  const cls = cn(
    'underline underline-offset-2 decoration-current/40 transition-colors cursor-pointer',
    toneMap[tone].text,
    tone === 'cyan' && 'hover:text-retro-green',
    tone !== 'cyan' && 'hover:opacity-80',
    className,
  );

  if (href) {
    const anchorProps = props as PixelTextLinkAnchorProps;
    const { href: _href, ...anchorRest } = anchorProps;
    return (
      <a href={href} className={cls} {...anchorRest}>
        {children}
      </a>
    );
  }

  const buttonProps = props as PixelTextLinkButtonProps;
  return (
    <button type="button" className={cls} {...buttonProps}>
      {children}
    </button>
  );
}

export function PixelCollapsible({
  label,
  children,
  defaultOpen = false,
  tone = 'neutral',
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tone?: Tone;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <PixelButton
        type="button"
        size="sm"
        tone={tone}
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

export function PixelCodeInline({ children, tone = 'cyan' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <code className={cn('rounded border px-1.5 py-0.5 font-mono text-xs', toneMap[tone].border, toneMap[tone].soft, toneMap[tone].text)}>
      {children}
    </code>
  );
}

export function PixelKbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-retro-border bg-retro-surface px-1.5 font-mono text-[10px] text-retro-muted shadow-[0_1px_0_1px_rgba(var(--retro-border)/0.6)]">
      {children}
    </kbd>
  );
}

export function PixelColorSwatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-md border border-retro-border/50" style={{ backgroundColor: `rgb(var(${cssVar}))` }} />
      <div>
        <p className="text-xs font-mono text-retro-text">{name}</p>
        <p className="text-[10px] font-mono text-retro-muted">{cssVar}</p>
      </div>
    </div>
  );
}

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

/* ═══════════════════════════════════════════════════════════════════════════════
   INPUTS
   ═══════════════════════════════════════════════════════════════════════════════ */

export function PixelInput({
  label,
  hint,
  error,
  tone = 'neutral',
  size = 'md',
  icon,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  size?: Size;
  icon?: React.ReactNode;
}) {
  const h = size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12 text-sm' : 'h-10 text-sm';
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-retro-muted">{icon}</span>}
        <input
          className={cn(inputBase, h, focusRing, toneMap[tone].ring, error ? 'border-retro-red/60' : 'border-retro-border', icon ? 'pl-10 pr-3' : 'px-3', className)}
          {...props}
        />
      </span>
    </FieldShell>
  );
}

export function PixelPasswordInput({
  label,
  hint,
  tone = 'neutral',
  size = 'md',
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: string;
  hint?: string;
  tone?: Tone;
  size?: Size;
}) {
  const [visible, setVisible] = useState(false);
  const h = size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12 text-sm' : 'h-10 text-sm';
  return (
    <FieldShell label={label} hint={hint}>
      <span className="relative block">
        <input
          type={visible ? 'text' : 'password'}
          className={cn(inputBase, h, focusRing, toneMap[tone].ring, 'border-retro-border px-3 pr-16')}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md border border-retro-border/40 bg-retro-surface/60 px-2 py-0.5 text-[10px] font-mono uppercase text-retro-muted transition-colors hover:text-retro-text"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </span>
    </FieldShell>
  );
}

export function PixelTextarea({
  label,
  hint,
  error,
  tone = 'neutral',
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
}) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <textarea
        className={cn(inputBase, focusRing, toneMap[tone].ring, 'min-h-24 border-retro-border px-3 py-2 text-sm', className)}
        {...props}
      />
    </FieldShell>
  );
}

export function PixelSelect({
  label,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select...',
  hint,
  error,
  tone = 'neutral',
  size = 'md',
}: {
  label?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  size?: Size;
}) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const value = isControlled ? controlledValue : internalValue;
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useClickOutside(containerRef, () => setOpen(false));

  const handleSelect = (v: string) => {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && highlighted >= 0) { handleSelect(options[highlighted].value); }
      else { setOpen(true); }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); setHighlighted(0); return; }
      setHighlighted((p) => Math.min(p + 1, options.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((p) => Math.max(p - 1, 0));
    }
  };

  const h = size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12 text-sm' : 'h-10 text-sm';

  return (
    <FieldShell label={label} hint={hint} error={error}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            'flex w-full items-center justify-between rounded-md border bg-retro-bg/70 px-3 font-mono transition-all outline-none',
            h, focusRing, toneMap[tone].ring,
            error ? 'border-retro-red/60' : 'border-retro-border',
          )}
          onClick={() => setOpen(!open)}
          onKeyDown={handleKeyDown}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected?.icon && <span className="flex-shrink-0 opacity-80">{selected.icon}</span>}
            <span className={cn('truncate', selected ? 'text-retro-text' : 'text-retro-muted')}>{selected?.label ?? placeholder}</span>
          </span>
          <ChevronDownIcon className={cn('ml-2 flex-shrink-0 text-retro-muted transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div role="listbox" className="absolute left-0 top-full z-40 mt-1 w-full rounded-md border border-retro-border bg-retro-bg p-1 shadow-xl">
            {options.map((opt, idx) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={cn(
                  'flex w-full items-center rounded px-3 py-2 text-left text-xs font-mono transition-colors',
                  opt.value === value ? cn(toneMap[tone].text, toneMap[tone].soft) : 'text-retro-muted',
                  idx === highlighted && 'bg-retro-surface',
                  'hover:bg-retro-surface hover:text-retro-text',
                )}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="flex flex-1 min-w-0 items-center gap-2">
                  {opt.icon && <span className="flex-shrink-0 opacity-80">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </span>
                {opt.value === value && <CheckIcon className="ml-auto flex-shrink-0 h-2.5 w-2.5" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldShell>
  );
}

export function PixelCheckbox({
  label,
  checked,
  onChange,
  disabled,
  tone = 'green',
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  tone?: Tone;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'group flex items-center gap-2.5 text-sm font-mono outline-none',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 transition-all',
          checked ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border bg-retro-bg',
          !disabled && 'group-hover:border-retro-muted',
          'group-focus-visible:ring-2 group-focus-visible:ring-retro-green/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-retro-bg',
        )}
      >
        {checked && <CheckIcon className={toneMap[tone].text} />}
      </span>
      <span className="text-retro-text select-none">{label}</span>
    </button>
  );
}

export function PixelRadioGroup({
  label,
  value,
  options,
  onChange,
  tone = 'cyan',
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  tone?: Tone;
}) {
  return (
    <fieldset className="space-y-2" role="radiogroup">
      <legend className="mb-1.5 text-xs font-mono text-retro-muted">{label}</legend>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className="group flex items-center gap-2.5 text-sm font-mono outline-none cursor-pointer"
        >
          <span
            className={cn(
              'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all',
              value === opt.value ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border bg-retro-bg',
              'group-hover:border-retro-muted',
              'group-focus-visible:ring-2 group-focus-visible:ring-retro-cyan/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-retro-bg',
            )}
          >
            {value === opt.value && <span className={cn('block h-2 w-2 rounded-full', toneMap[tone].fill)} />}
          </span>
          <span className="text-retro-text select-none">{opt.label}</span>
        </button>
      ))}
    </fieldset>
  );
}

export function PixelSwitch({
  label,
  checked,
  onChange,
  tone = 'green',
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  tone?: Tone;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('group inline-flex items-center gap-3 text-sm font-mono text-retro-text outline-none', focusRing, toneMap[tone].ring)}
    >
      <span
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
          checked ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border bg-retro-surface',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 h-4 w-4 rounded-full transition-transform',
            checked ? cn('translate-x-5', toneMap[tone].fill) : 'translate-x-0 bg-retro-muted',
          )}
        />
      </span>
      <span className="select-none">{label}</span>
    </button>
  );
}

export function PixelSlider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  tone = 'cyan',
  showMinMax = false,
}: {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (next: number) => void;
  tone?: Tone;
  showMinMax?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const computeValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      onChange(Math.max(min, Math.min(max, stepped)));
    },
    [min, max, step, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragging.current = true;
      computeValue(e.clientX);
    },
    [computeValue],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      computeValue(e.clientX);
    },
    [computeValue],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next = value;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, value + step);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(min, value - step);
      else return;
      e.preventDefault();
      onChange(next);
    },
    [min, max, step, value, onChange],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-retro-muted">
        <span>{label}</span>
        <span className={toneMap[tone].text}>{value}</span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        className={cn(
          'group relative h-2.5 cursor-pointer rounded-full border border-retro-border/60 bg-retro-surface/50 outline-none touch-none',
          focusRing, toneMap[tone].ring,
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-[width]', toneMap[tone].bg)}
          style={{ width: `${pct}%`, opacity: 0.8 }}
        />
        <div
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 bg-retro-bg shadow-md transition-shadow group-hover:shadow-[0_0_0_3px_rgba(0,0,0,.15)]',
            toneMap[tone].border,
          )}
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      {showMinMax && (
        <div className="flex justify-between font-mono text-[10px] text-retro-muted/50">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

export function PixelSegmented({
  label,
  value,
  options,
  onChange,
  tone = 'green',
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  tone?: Tone;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-mono text-retro-muted">{label}</p>
      <div className="inline-flex rounded-md border border-retro-border/50 bg-retro-surface/50 p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cn(
              'rounded-[5px] px-3 py-1.5 text-xs font-mono transition-all outline-none',
              focusRing, toneMap[tone].ring,
              value === opt.value
                ? cn(toneMap[tone].bg, toneMap[tone].text, 'border border-transparent shadow-sm')
                : 'border border-transparent text-retro-muted hover:text-retro-text',
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FEEDBACK
   ═══════════════════════════════════════════════════════════════════════════════ */

export function PixelAlert({
  title,
  message,
  tone = 'red',
  icon,
  action,
}: {
  title: string;
  message: string;
  tone?: Tone;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-lg border p-3', toneMap[tone].border, toneMap[tone].soft)} role="alert">
      <div className="flex items-start gap-2.5">
        {icon && <span className={cn('mt-0.5 shrink-0', toneMap[tone].text)}>{icon}</span>}
        <div className="flex-1">
          <p className={cn('font-mono text-xs font-semibold', toneMap[tone].text)}>{title}</p>
          <p className="mt-1 text-sm text-retro-muted">{message}</p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}

export function PixelProgress({
  value,
  tone = 'green',
  label,
  showValue = true,
}: {
  value: number;
  tone?: Tone;
  label?: string;
  showValue?: boolean;
}) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-mono text-retro-muted">
          {label && <span>{label}</span>}
          {showValue && <span className={toneMap[tone].text}>{safe}%</span>}
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full border border-retro-border bg-retro-surface/80">
        <div className={cn('h-full rounded-full transition-all duration-500', toneMap[tone].bg)} style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

export function PixelSkeleton({
  width,
  height = '1rem',
  rounded = false,
  className,
}: {
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn('animate-pulse bg-retro-surface/80', rounded ? 'rounded-full' : 'rounded-md', className)}
      style={{ width, height }}
    />
  );
}

export function PixelEmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-retro-border/60 bg-retro-surface/20 p-8 text-center">
      {icon && <div className="mb-3 flex justify-center text-retro-cyan">{icon}</div>}
      <h4 className="font-mono text-sm font-semibold text-retro-text">{title}</h4>
      <p className="mx-auto mt-2 max-w-sm text-sm text-retro-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════════ */

export function PixelTabs({ items, defaultTab }: { items: TabItem[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const current = items.find((i) => i.id === active) ?? items[0];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 border-b border-retro-border/40 pb-px" role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            className={cn(
              'flex items-center gap-1.5 rounded-t-md border border-b-0 px-3 py-2 text-xs font-mono transition-colors outline-none -mb-px',
              focusRing,
              active === item.id
                ? 'border-retro-border/40 bg-retro-bg text-retro-green'
                : 'border-transparent text-retro-muted hover:text-retro-text',
            )}
            onClick={() => setActive(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="rounded-md border border-retro-border/40 bg-retro-bg/50 p-3 text-sm text-retro-muted">
        {current?.content}
      </div>
    </div>
  );
}

export function PixelAccordion({ items, allowMultiple = false }: { items: AccordionItem[]; allowMultiple?: boolean }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(items[0] ? [items[0].id] : []));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} className="rounded-md border border-retro-border/40 bg-retro-surface/40">
            <button
              type="button"
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-mono text-retro-text outline-none"
              onClick={() => toggle(item.id)}
            >
              <span>{item.title}</span>
              <ChevronDownIcon className={cn('text-retro-muted transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>
            {isOpen && (
              <div className="border-t border-retro-border/30 px-3 py-2.5 text-sm text-retro-muted">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PixelBreadcrumb({
  items,
}: {
  items: Array<{ label: string; href?: string; onClick?: () => void; active?: boolean }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <svg viewBox="0 0 8 8" className="h-2 w-2 shrink-0 text-retro-border" shapeRendering="crispEdges" fill="currentColor">
              <rect x="2" y="1" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="3" width="2" height="1" />
              <rect x="3" y="5" width="1" height="1" />
              <rect x="2" y="6" width="1" height="1" />
            </svg>
          )}
          {item.active ? (
            <span className="text-retro-text font-medium">{item.label}</span>
          ) : item.onClick ? (
            <button type="button" onClick={item.onClick} className="text-retro-muted transition-colors hover:text-retro-green">
              {item.label}
            </button>
          ) : item.href ? (
            <a href={item.href} className="text-retro-muted transition-colors hover:text-retro-green">
              {item.label}
            </a>
          ) : (
            <span className="text-retro-muted">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function PixelPagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (next: number) => void;
}) {
  const pages = Array.from({ length: total }, (_, idx) => idx + 1);
  return (
    <nav aria-label="Pagination" className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className={cn(
          'inline-flex h-8 items-center rounded-md border px-2.5 text-xs font-mono transition-colors',
          page <= 1 ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
        )}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'h-8 w-8 rounded-md border text-xs font-mono transition-colors',
            p === page
              ? 'border-retro-green/50 bg-retro-green/10 text-retro-green'
              : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
          )}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= total}
        onClick={() => onChange(Math.min(total, page + 1))}
        className={cn(
          'inline-flex h-8 items-center rounded-md border px-2.5 text-xs font-mono transition-colors',
          page >= total ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
        )}
      >
        Next
      </button>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   OVERLAY
   ═══════════════════════════════════════════════════════════════════════════════ */

export function PixelModal({
  open,
  title,
  children,
  onClose,
  size = 'md',
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={cn('relative w-full rounded-xl border border-retro-border bg-retro-bg p-5 shadow-2xl', maxW)}>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-pixel text-[11px] text-retro-green">{title.toUpperCase()}</h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-retro-border text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="text-sm text-retro-muted">{children}</div>
      </div>
    </div>
  );
}

export function PixelTooltip({
  content,
  children,
  position = 'top',
}: {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [visible, setVisible] = useState(false);
  const posClass: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className={cn('absolute z-50 whitespace-nowrap rounded-md border border-retro-border bg-retro-bg px-2 py-1 text-[11px] font-mono text-retro-text shadow-lg pointer-events-none', posClass[position])} role="tooltip">
          {content}
        </span>
      )}
    </span>
  );
}

export function PixelDropdown({
  label,
  items,
  onSelect,
  tone = 'neutral',
  icon,
}: {
  label: string;
  items: Option[];
  onSelect: (value: string) => void;
  tone?: Tone;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative inline-block">
      <PixelButton tone={tone} iconRight={icon ?? <ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />} onClick={() => setOpen((v) => !v)}>
        {label}
      </PixelButton>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-1.5 min-w-44 rounded-md border border-retro-border bg-retro-bg p-1 shadow-xl">
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              className="flex w-full items-center rounded px-3 py-2 text-left text-xs font-mono text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text"
              onClick={() => { onSelect(item.value); setOpen(false); }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════════ */

const PXL_KEYFRAMES = `
@keyframes pxl-fade-in{from{opacity:0}to{opacity:1}}
@keyframes pxl-slide-down{from{opacity:0;transform:translateY(calc(var(--pxl-slide-distance,10px)*-1))}to{opacity:1;transform:translateY(0)}}
@keyframes pxl-slide-up{from{opacity:0;transform:translateY(var(--pxl-slide-distance,10px))}to{opacity:1;transform:translateY(0)}}
@keyframes pxl-slide-left{from{opacity:0;transform:translateX(var(--pxl-slide-distance,10px))}to{opacity:1;transform:translateX(0)}}
@keyframes pxl-slide-right{from{opacity:0;transform:translateX(calc(var(--pxl-slide-distance,10px)*-1))}to{opacity:1;transform:translateX(0)}}
@keyframes pxl-bounce{0%,100%{transform:translateY(0)}35%{transform:translateY(calc(var(--pxl-bounce-height,8px)*-1))}60%{transform:translateY(calc(var(--pxl-bounce-height,8px)*-0.5))}80%{transform:translateY(calc(var(--pxl-bounce-height,8px)*-0.25))}}
@keyframes pxl-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.97)}}
@keyframes pxl-glitch{0%,75%,100%{clip-path:none;transform:translate(0);filter:none}9%,10%{clip-path:polygon(0 16%,100% 16%,100% 34%,0 34%);transform:translate(calc(var(--pxl-glitch-x,4px)*-1),0)}14%,15%{clip-path:none;transform:translate(0);filter:brightness(1.6) saturate(6) hue-rotate(90deg)}16%{filter:none}21%,22%{clip-path:polygon(0 56%,100% 56%,100% 72%,0 72%);transform:translate(var(--pxl-glitch-x,4px),0)}28%{clip-path:none;transform:translate(0)}42%,43%{clip-path:polygon(0 2%,100% 2%,100% 18%,0 18%);transform:translate(calc(var(--pxl-glitch-x,4px)*1.5),0)}48%,49%{clip-path:polygon(0 80%,100% 80%,100% 96%,0 96%);transform:translate(calc(var(--pxl-glitch-x,4px)*-0.8),0)}54%{clip-path:none;transform:translate(0)}}
@keyframes pxl-glitch-r{0%,75%,100%{clip-path:none;transform:translate(0);opacity:0}9%{opacity:.65;clip-path:polygon(0 10%,100% 10%,100% 30%,0 30%);transform:translate(calc(var(--pxl-glitch-x,4px)*-1.8),0)}12%{clip-path:none;opacity:0}21%{opacity:.6;clip-path:polygon(0 50%,100% 50%,100% 68%,0 68%);transform:translate(calc(var(--pxl-glitch-x,4px)*1.4),0)}26%{clip-path:none;opacity:0}42%{opacity:.7;clip-path:polygon(0 0,100% 0,100% 14%,0 14%);transform:translate(calc(var(--pxl-glitch-x,4px)*-2),0)}46%{clip-path:none;opacity:0}}
@keyframes pxl-glitch-c{0%,75%,100%{clip-path:none;transform:translate(0);opacity:0}10%{opacity:.55;clip-path:polygon(0 22%,100% 22%,100% 42%,0 42%);transform:translate(var(--pxl-glitch-x,4px),0)}14%{clip-path:none;opacity:0}23%{opacity:.5;clip-path:polygon(0 64%,100% 64%,100% 80%,0 80%);transform:translate(calc(var(--pxl-glitch-x,4px)*-1.2),0)}29%{clip-path:none;opacity:0}44%{opacity:.6;clip-path:polygon(0 6%,100% 6%,100% 20%,0 20%);transform:translate(calc(var(--pxl-glitch-x,4px)*1.6),0)}51%{clip-path:none;opacity:0}}
@keyframes pxl-float{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--pxl-float-distance,6px)*-1))}}
@keyframes pxl-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(calc(var(--pxl-shake-distance,2px)*-1))}40%{transform:translateX(var(--pxl-shake-distance,2px))}60%{transform:translateX(calc(var(--pxl-shake-distance,2px)*-1))}80%{transform:translateX(var(--pxl-shake-distance,2px))}}
@keyframes pxl-rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pxl-zoom-in{from{opacity:0;transform:scale(var(--pxl-zoom-start,.92))}to{opacity:1;transform:scale(1)}}
@keyframes pxl-flicker{0%,100%{opacity:1}8%{opacity:.85}16%{opacity:1}32%{opacity:.65}40%{opacity:1}58%{opacity:.8}66%{opacity:1}82%{opacity:.55}90%{opacity:1}}
`;

type AnimationRepeat = number | 'infinite';

function repeatToCss(repeat: AnimationRepeat = 1): string {
  return typeof repeat === 'number' ? String(repeat) : repeat;
}

function usePixelAnimations() {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('pxl-anims')) return;
    const s = document.createElement('style');
    s.id = 'pxl-anims';
    s.textContent = PXL_KEYFRAMES;
    document.head.appendChild(s);
  }, []);
}

/* ── Animation trigger system ─────────────────────────────────────────────── */

export type AnimationTrigger = 'mount' | 'hover' | 'click' | 'focus' | 'inView' | boolean;

/**
 * Shared hook that determines *when* an animation is active based on the
 * chosen trigger mode.  Returns a `ref` to attach to the outermost element,
 * an `active` boolean to conditionally apply the CSS animation, event
 * `handlers` to spread on the same element, and a `handleAnimEnd` callback
 * for the animated element's `onAnimationEnd`.
 */
function useAnimationTrigger(trigger: AnimationTrigger = 'mount', onComplete?: () => void) {
  const ref = useRef<HTMLDivElement>(null!);
  const [hov, setHov] = useState(false);
  const [foc, setFoc] = useState(false);
  const [iv, setIV] = useState(false);
  const [clicking, setClicking] = useState(false);
  const wasClickRef = useRef(false);

  useEffect(() => {
    wasClickRef.current = clicking;
  }, [clicking]);

  // IntersectionObserver for inView trigger
  useEffect(() => {
    if (trigger !== 'inView') return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setIV(e.isIntersecting), { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [trigger]);

  const active =
    typeof trigger === 'boolean'
      ? trigger
      : trigger === 'mount'
        ? true
        : trigger === 'hover'
          ? hov
          : trigger === 'click'
            ? clicking
            : trigger === 'focus'
              ? foc
              : trigger === 'inView'
                ? iv
                : true;

  /* endAnimation — call to signal the animation finished (programmatic use) */
  const endAnimation = useCallback(() => {
    if (trigger === 'click') setClicking(false);
    onComplete?.();
  }, [trigger, onComplete]);

  /* handleAnimEnd — attach to the animated element's onAnimationEnd */
  const handleAnimEnd = useCallback(
    (e: React.AnimationEvent) => {
      if (e.target !== e.currentTarget) return;
      endAnimation();
    },
    [endAnimation],
  );

  const handlers: React.DOMAttributes<HTMLElement> = {};

  if (trigger === 'hover') {
    handlers.onMouseEnter = () => setHov(true);
    handlers.onMouseLeave = () => setHov(false);
  } else if (trigger === 'click') {
    handlers.onClick = () => {
      /* If already playing, restart via Web Animations API */
      if (wasClickRef.current) {
        ref.current?.getAnimations({ subtree: true }).forEach((a) => {
          a.cancel();
          a.play();
        });
      }
      setClicking(true);
    };
  } else if (trigger === 'focus') {
    handlers.onFocus = () => setFoc(true);
    handlers.onBlur = () => setFoc(false);
  }

  return { ref, active, handlers, handleAnimEnd, endAnimation };
}

export function PixelFadeIn({
  children,
  duration = 400,
  delay = 0,
  repeat = 1,
  easing = 'ease',
  fillMode = 'both',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={active ? { animation: `pxl-fade-in ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}` } : undefined}
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelSlideIn({
  children,
  from = 'down',
  duration = 350,
  delay = 0,
  distance = 10,
  repeat = 1,
  easing = 'ease',
  fillMode = 'both',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  from?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  distance?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={
        active
          ? {
              animation: `pxl-slide-${from} ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}`,
              ['--pxl-slide-distance' as string]: `${distance}px`,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelPulse({
  children,
  duration = 2000,
  repeat = 'infinite',
  easing = 'ease-in-out',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={active ? { animation: `pxl-pulse ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both` } : undefined}
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelBounce({
  children,
  duration = 800,
  repeat = 'infinite',
  height = 8,
  easing = 'ease',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  repeat?: number | 'infinite';
  height?: number;
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      style={
        active
          ? {
              animation: `pxl-bounce ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              ['--pxl-bounce-height' as string]: `${height}px`,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelTypewriter({
  text,
  speed = 60,
  delay = 0,
  cursor = true,
  tone = 'green',
  trigger = 'mount',
  onComplete,
  className,
}: {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  tone?: Tone;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  const { ref, active, handlers, endAnimation } = useAnimationTrigger(trigger, onComplete);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          setDone(true);
          endAnimation();
        }
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [active, text, speed, delay, endAnimation]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} {...(handlers as React.DOMAttributes<HTMLSpanElement>)} className={cn('font-mono', toneMap[tone].text, className)}>
      {displayed}
      {cursor && !done && active && <span className="animate-pulse">▌</span>}
    </span>
  );
}

export function PixelGlitch({
  children,
  duration = 3000,
  intensity = 4,
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  intensity?: number;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  const cssVars = { ['--pxl-glitch-x' as string]: `${intensity}px` };
  return (
    <div ref={ref} {...handlers} className={cn('relative inline-block overflow-visible', className)}>
      {/* Ghost layer R — shifts left, fires on different clip zones */}
      {active && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            animation: `pxl-glitch-r ${duration}ms steps(1) infinite`,
            ...cssVars,
            filter: 'saturate(0) sepia(1) hue-rotate(-20deg) brightness(1.3)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      )}
      {/* Ghost layer C — shifts right, fires on offset clip zones */}
      {active && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            animation: `pxl-glitch-c ${duration}ms steps(1) infinite`,
            ...cssVars,
            filter: 'saturate(0) sepia(1) hue-rotate(150deg) brightness(1.1)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      )}
      {/* Main layer */}
      <div
        style={active ? { animation: `pxl-glitch ${duration}ms steps(1) infinite`, ...cssVars } : undefined}
        onAnimationEnd={handleAnimEnd}
      >
        {children}
      </div>
    </div>
  );
}

export function PixelFloat({
  children,
  duration = 2200,
  distance = 6,
  repeat = 'infinite',
  easing = 'ease-in-out',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      style={
        active
          ? {
              animation: `pxl-float ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              ['--pxl-float-distance' as string]: `${distance}px`,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelShake({
  children,
  duration = 450,
  distance = 2,
  repeat = 1,
  easing = 'linear',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      style={
        active
          ? {
              animation: `pxl-shake ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              ['--pxl-shake-distance' as string]: `${distance}px`,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelRotate({
  children,
  duration = 1800,
  repeat = 'infinite',
  direction = 'normal',
  easing = 'linear',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  repeat?: AnimationRepeat;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      style={
        active
          ? {
              animation: `pxl-rotate ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              animationDirection: direction,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelZoomIn({
  children,
  duration = 320,
  delay = 0,
  startScale = 0.92,
  repeat = 1,
  easing = 'cubic-bezier(.2,.9,.2,1)',
  fillMode = 'both',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  startScale?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={
        active
          ? {
              animation: `pxl-zoom-in ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}`,
              ['--pxl-zoom-start' as string]: String(startScale),
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelFlicker({
  children,
  duration = 2200,
  repeat = 'infinite',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  repeat?: AnimationRepeat;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={active ? { animation: `pxl-flicker ${duration}ms steps(1) 0ms ${repeatToCss(repeat)} both` } : undefined}
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PARALLAX
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * PixelParallaxLayer — Scroll-based parallax.
 *
 * Wraps children in a layer that translates along Y (or X) proportionally to
 * scroll position.  `speed` controls the multiplier:
 *   - 0   = static (moves with page)
 *   - 0.5 = moves at half scroll speed (far background feel)
 *   - 1   = moves at scroll speed (baseline)
 *   - −0.3 = moves opposite direction (foreground float-up feel)
 *
 * The translation is computed with `transform: translate3d()` for GPU compositing.
 */
export function PixelParallaxLayer({
  children,
  speed = 0.5,
  axis = 'y',
  className,
  style,
}: {
  children: React.ReactNode;
  /** Parallax multiplier. 0 = no movement, 1 = full scroll speed, negative = reverse. */
  speed?: number;
  /** Axis to translate on. Default "y". */
  axis?: 'x' | 'y' | 'both';
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      const scrollY = window.scrollY;
      const rect = el!.getBoundingClientRect();
      // offset relative to element's original position in viewport
      const centerY = rect.top + scrollY + rect.height / 2;
      const viewCenter = scrollY + window.innerHeight / 2;
      const delta = (viewCenter - centerY) * speed;

      if (axis === 'y') {
        el!.style.transform = `translate3d(0, ${delta}px, 0)`;
      } else if (axis === 'x') {
        el!.style.transform = `translate3d(${delta}px, 0, 0)`;
      } else {
        el!.style.transform = `translate3d(${delta}px, ${delta}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(update);
    }

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, axis]);

  return (
    <div ref={ref} className={cn('will-change-transform', className)} style={style}>
      {children}
    </div>
  );
}

/**
 * PixelParallaxGroup — Container that establishes a perspective context.
 *
 * Wrap multiple PixelParallaxLayer or PixelMouseParallax elements inside this
 * to clip them within a shared viewport area.  Applies `overflow: hidden` and
 * `position: relative` automatically.
 */
export function PixelParallaxGroup({
  children,
  className,
  style,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** HTML tag to render. Default "div". */
  as?: 'div' | 'section' | 'header' | 'main';
}) {
  return (
    <Tag className={cn('relative overflow-hidden', className)} style={style}>
      {children}
    </Tag>
  );
}

/**
 * PixelMouseParallax — Cursor-tracking parallax.
 *
 * Translates children based on the mouse position relative to the nearest
 * PixelParallaxGroup (or the viewport).  Use `strength` to control the range
 * (in px) an element can travel.  Invert with `invert`.
 *
 * Great for floating elements that follow or repel from the cursor.
 */
export function PixelMouseParallax({
  children,
  strength = 20,
  invert = false,
  className,
  style,
}: {
  children: React.ReactNode;
  /** Max travel distance in px. */
  strength?: number;
  /** If true, moves away from cursor instead of towards. */
  invert?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleMouse(e: MouseEvent) {
      // Find parent parallax group or use viewport
      const parent = el!.closest('[class*="relative"]') || document.body;
      const rect = parent.getBoundingClientRect();
      // Normalize to -1..1
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      const sign = invert ? -1 : 1;
      targetRef.current = { x: nx * strength * sign, y: ny * strength * sign };
    }

    function animate() {
      // Smooth lerp
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.08;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.08;
      if (el) {
        el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', handleMouse);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, [strength, invert]);

  return (
    <div ref={ref} className={cn('will-change-transform', className)} style={style}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPONENT REGISTRY
   ═══════════════════════════════════════════════════════════════════════════════ */

export const UI_KIT_COMPONENTS = [
  'PixelButton',
  'PxlKitButton',
  'PixelSplitButton',
  'PixelCard',
  'PixelStatCard',
  'PixelTable',
  'PixelAvatar',
  'PixelBadge',
  'PixelChip',
  'PixelTextLink',
  'PixelCollapsible',
  'PixelBareButton',
  'PixelBareInput',
  'PixelBareTextarea',
  'PixelCodeInline',
  'PixelKbd',
  'PixelColorSwatch',
  'PixelInput',
  'PixelPasswordInput',
  'PixelTextarea',
  'PixelSelect',
  'PixelCheckbox',
  'PixelRadioGroup',
  'PixelSwitch',
  'PixelSlider',
  'PixelSegmented',
  'PixelAlert',
  'PixelProgress',
  'PixelSkeleton',
  'PixelEmptyState',
  'PixelTabs',
  'PixelAccordion',
  'PixelBreadcrumb',
  'PixelPagination',
  'PixelModal',
  'PixelTooltip',
  'PixelDropdown',
  'PixelDivider',
  'PixelSection',
  'PixelFadeIn',
  'PixelSlideIn',
  'PixelPulse',
  'PixelBounce',
  'PixelTypewriter',
  'PixelGlitch',
  'PixelFloat',
  'PixelShake',
  'PixelRotate',
  'PixelZoomIn',
  'PixelFlicker',
  'PixelParallaxLayer',
  'PixelParallaxGroup',
  'PixelMouseParallax',
] as const;
