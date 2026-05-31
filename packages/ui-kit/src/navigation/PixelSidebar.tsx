'use client';

import React, { forwardRef } from 'react';
import {
  cn, Surface, useEffectiveSurface, surfaceClasses, focusRing,
} from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';

export interface PixelSidebarItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: { label: string; tone?: ToneKey };
  href?: string;
  onSelect?: () => void;
  active?: boolean;
  nested?: PixelSidebarItemProps[];
}

export interface PixelSidebarSectionProps {
  /** Canonical section label. */
  label?: string;
  /**
   * @deprecated Use `label` instead. Retained as alias for one minor.
   */
  title?: string;
  items: PixelSidebarItemProps[];
}

export interface PixelSidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  sections: PixelSidebarSectionProps[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  surface?: Surface;
}

function SidebarBadge({
  badge,
  surface,
  collapsed,
}: {
  badge: NonNullable<PixelSidebarItemProps['badge']>;
  surface: Surface;
  collapsed: boolean;
}) {
  const s = surfaceClasses(surface);
  const t = toneTokens[badge.tone ?? 'neutral'];
  if (collapsed) return null;
  return (
    <span
      className={cn(
        'ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold',
        s.border, s.radiusFull, s.font,
        t.bg, t.border, t.text,
      )}
    >
      {badge.label}
    </span>
  );
}

function SidebarItem({
  item,
  surface,
  collapsed,
  depth,
}: {
  item: PixelSidebarItemProps;
  surface: Surface;
  collapsed: boolean;
  depth: number;
}) {
  const s = surfaceClasses(surface);
  const hasNested = !!item.nested && item.nested.length > 0;

  const onClick = () => {
    item.onSelect?.();
  };

  const isLink = !!item.href;
  const padLeft = depth === 0 ? 'pl-2' : depth === 1 ? 'pl-6' : 'pl-10';

  const sharedClassName = cn(
    'group relative flex w-full items-center gap-2 pr-2 py-2 text-xs outline-none',
    padLeft,
    s.font, s.radius, s.transition,
    focusRing, 'focus-visible:ring-retro-cyan/40',
    item.active
      ? cn('bg-retro-cyan/15 text-retro-cyan', toneTokens.cyan.border)
      : 'text-retro-text hover:bg-retro-surface/60',
    'border border-transparent',
    collapsed && 'justify-center pr-0 pl-0',
  );

  const inner = (
    <>
      {item.icon && (
        <span aria-hidden className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
          {item.icon}
        </span>
      )}
      <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
      {item.badge && (
        <SidebarBadge badge={item.badge} surface={surface} collapsed={collapsed} />
      )}
    </>
  );

  return (
    <li role="none">
      {isLink ? (
        <a
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          aria-label={collapsed ? item.label : undefined}
          title={collapsed ? item.label : undefined}
          className={sharedClassName}
        >
          {inner}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          aria-current={item.active ? 'page' : undefined}
          aria-label={collapsed ? item.label : undefined}
          title={collapsed ? item.label : undefined}
          className={sharedClassName}
        >
          {inner}
        </button>
      )}
      {hasNested && !collapsed && (
        <ul role="group" className="mt-1 space-y-0.5">
          {item.nested!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              surface={surface}
              collapsed={collapsed}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export const PixelSidebar = forwardRef<HTMLElement, PixelSidebarProps>(function PixelSidebar(
  {
    collapsible,
    defaultCollapsed,
    collapsed: collapsedProp,
    onCollapsedChange,
    sections,
    header,
    footer,
    surface: surfaceProp,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);

  const isControlled = collapsedProp !== undefined;
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(
    defaultCollapsed ?? false,
  );
  const collapsed = isControlled ? !!collapsedProp : internalCollapsed;

  const toggle = () => {
    const next = !collapsed;
    if (!isControlled) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  return (
    <nav
      ref={ref}
      aria-label="Sidebar"
      className={cn(
        'flex h-full flex-col bg-retro-bg/40',
        s.border, 'border-retro-border/40',
        collapsed ? 'w-14' : 'w-56',
        s.transition,
        className,
      )}
      {...rest}
    >
      {(header || collapsible) && (
        <div
          className={cn(
            'flex items-center gap-2 border-b border-retro-border/30 px-2 py-2',
            collapsed && 'justify-center',
          )}
        >
          {!collapsed && header && <div className="min-w-0 flex-1">{header}</div>}
          {collapsible && (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center text-retro-muted hover:text-retro-text',
                s.border, s.radius, s.font, focusRing, 'focus-visible:ring-retro-cyan/40',
                'border-retro-border/40',
              )}
            >
              <span aria-hidden className="text-[10px]">{collapsed ? '>' : '<'}</span>
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {sections.map((section, idx) => {
          const sectionLabel = section.label ?? section.title;
          return (
          <div key={sectionLabel ?? `section-${idx}`} className={cn(idx > 0 && 'mt-3')}>
            {sectionLabel && !collapsed && (
              <h3
                className={cn(
                  'px-3 pb-1 text-[10px] uppercase tracking-wider text-retro-muted',
                  s.fontDisplay,
                )}
              >
                {sectionLabel}
              </h3>
            )}
            <ul role="list" className="space-y-0.5 px-1">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  surface={surface}
                  collapsed={collapsed}
                  depth={0}
                />
              ))}
            </ul>
          </div>
          );
        })}
      </div>

      {footer && (
        <div
          className={cn(
            'border-t border-retro-border/30 px-2 py-2',
            collapsed && 'flex justify-center',
          )}
        >
          {footer}
        </div>
      )}
    </nav>
  );
});

PixelSidebar.displayName = 'PixelSidebar';
