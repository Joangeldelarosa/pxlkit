import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,
  toneMap, sizeClass, focusRing, inputBase,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell
} from './common';
import { PixelButton } from './actions';



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

