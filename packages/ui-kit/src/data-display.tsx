import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,
  toneMap, sizeClass, focusRing, inputBase,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell
} from './common';
import { PixelButton } from './actions';



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
      <div className="h-8 w-8 rounded-md border border-retro-border/50" style={{ backgroundColor: `var(${cssVar})` }} />
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

