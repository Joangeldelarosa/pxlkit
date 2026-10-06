'use client';

import React, { forwardRef } from 'react';
import {
  sidebarBadgeClasses,
  sidebarBodyClasses,
  sidebarClasses,
  sidebarFooterClasses,
  sidebarHeaderClasses,
  sidebarHeaderContentClasses,
  sidebarItemClasses,
  sidebarItemIconClasses,
  sidebarItemLabelClasses,
  sidebarListClasses,
  sidebarNestedListClasses,
  sidebarSectionClasses,
  sidebarSectionLabel,
  sidebarSectionTitleClasses,
  sidebarToggleArrow,
  sidebarToggleArrowClasses,
  sidebarToggleClasses,
  sidebarToggleLabel,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

export interface PixelSidebarItemProps {
  /** Unique among its siblings. */
  id: string;
  /** Text of the item; its accessible name and tooltip while the sidebar is collapsed. */
  label: string;
  /** Icon before the label, hidden from assistive technology. */
  icon?: React.ReactNode;
  /** Badge after the label: its text and tone. */
  badge?: { label: string; tone?: ToneKey };
  /** Link target: the item is a link; without one it is a button. */
  href?: string;
  /** Called when the item is pressed; only a button calls it (an item with `href` is a link). */
  onSelect?: () => void;
  /** Marks the current page (`aria-current="page"`). */
  active?: boolean;
  /** Child items, listed below it while the sidebar is expanded. */
  nested?: PixelSidebarItemProps[];
}

export interface PixelSidebarSectionProps {
  /** Canonical section label. */
  label?: string;
  /**
   * @deprecated Use `label` instead. Retained as alias for one minor.
   */
  title?: string;
  /** The section's items. */
  items: PixelSidebarItemProps[];
}

export interface PixelSidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Shows the collapse toggle in the header row. */
  collapsible?: boolean;
  /** Initial collapsed state while uncontrolled. */
  defaultCollapsed?: boolean;
  /** Collapsed state; leave unset for an uncontrolled rail. */
  collapsed?: boolean;
  /** Called with the collapsed state the toggle asks for. */
  onCollapsedChange?: (next: boolean) => void;
  /** The sections, in order. */
  sections: PixelSidebarSectionProps[];
  /** Header content beside the toggle (hidden while collapsed). */
  header?: React.ReactNode;
  /** Footer row content. */
  footer?: React.ReactNode;
  /** Surface override; defaults to the nearest provider. */
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
  if (collapsed) return null;
  return <span className={sidebarBadgeClasses(surface, badge.tone)}>{badge.label}</span>;
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
  const hasNested = !!item.nested && item.nested.length > 0;

  const onClick = () => {
    item.onSelect?.();
  };

  const isLink = !!item.href;
  const sharedClassName = sidebarItemClasses(surface, { depth, active: !!item.active, collapsed });

  const inner = (
    <>
      {item.icon && (
        <span aria-hidden className={sidebarItemIconClasses}>
          {item.icon}
        </span>
      )}
      <span className={sidebarItemLabelClasses(collapsed)}>{item.label}</span>
      {item.badge && (
        <SidebarBadge badge={item.badge} surface={surface} collapsed={collapsed} />
      )}
    </>
  );

  return (
    // Native <li> listitem semantics — role="none" would leave the parent
    // role="list" with zero owned listitems (axe: aria-required-children).
    <li>
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
        <ul className={sidebarNestedListClasses}>
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
      className={cn(sidebarClasses(surface, collapsed), className)}
      {...rest}
    >
      {(header || collapsible) && (
        <div className={sidebarHeaderClasses(collapsed)}>
          {!collapsed && header && <div className={sidebarHeaderContentClasses}>{header}</div>}
          {collapsible && (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={!collapsed}
              aria-label={sidebarToggleLabel(collapsed)}
              className={sidebarToggleClasses(surface)}
            >
              <span aria-hidden className={sidebarToggleArrowClasses}>{sidebarToggleArrow(collapsed)}</span>
            </button>
          )}
        </div>
      )}

      <div className={sidebarBodyClasses}>
        {sections.map((section, idx) => {
          const sectionLabel = sidebarSectionLabel(section);
          return (
          <div key={sectionLabel ?? `section-${idx}`} className={sidebarSectionClasses(idx)}>
            {sectionLabel && !collapsed && (
              <h3 className={sidebarSectionTitleClasses(surface)}>
                {sectionLabel}
              </h3>
            )}
            <ul role="list" className={sidebarListClasses}>
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
        <div className={sidebarFooterClasses(collapsed)}>
          {footer}
        </div>
      )}
    </nav>
  );
});

PixelSidebar.displayName = 'PixelSidebar';
