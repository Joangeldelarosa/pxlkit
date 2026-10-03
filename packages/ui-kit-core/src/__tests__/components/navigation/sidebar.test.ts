import { describe, expect, it } from 'vitest';
import {
  sidebarBadgeClasses,
  sidebarClasses,
  sidebarFooterClasses,
  sidebarHeaderClasses,
  sidebarItemClasses,
  sidebarItemLabelClasses,
  sidebarSectionClasses,
  sidebarSectionLabel,
  sidebarSectionTitleClasses,
  sidebarToggleArrow,
  sidebarToggleClasses,
  sidebarToggleLabel,
} from '../../../components/navigation/sidebar';

const classesOf = (value: string) => value.split(' ');
const ITEM = { depth: 0, active: false, collapsed: false };

describe('sidebar recipes', () => {
  it('narrows the rail while collapsed', () => {
    expect(classesOf(sidebarClasses('pixel', false))).toEqual(expect.arrayContaining(['w-56', 'border-2', 'flex-col']));
    expect(classesOf(sidebarClasses('linear', true))).toEqual(expect.arrayContaining(['w-14', 'border']));
  });

  it('centres the header and footer rows while collapsed', () => {
    expect(classesOf(sidebarHeaderClasses(true))).toContain('justify-center');
    expect(classesOf(sidebarHeaderClasses(false))).not.toContain('justify-center');
    expect(classesOf(sidebarFooterClasses(true))).toEqual(expect.arrayContaining(['flex', 'justify-center']));
    expect(sidebarFooterClasses(false)).toBe('border-t border-retro-border/30 px-2 py-2');
  });

  it('names the toggle after what it does and points its arrow that way', () => {
    expect([sidebarToggleLabel(false), sidebarToggleArrow(false)]).toEqual(['Collapse sidebar', '<']);
    expect([sidebarToggleLabel(true), sidebarToggleArrow(true)]).toEqual(['Expand sidebar', '>']);
    expect(classesOf(sidebarToggleClasses('linear'))).toEqual(expect.arrayContaining(['h-7', 'w-7', 'rounded-md', 'font-sans']));
  });

  it('labels a section by `label`, falling back to the deprecated `title`', () => {
    expect(sidebarSectionLabel({ label: 'Main', title: 'Old' })).toBe('Main');
    expect(sidebarSectionLabel({ title: 'Old' })).toBe('Old');
    expect(sidebarSectionLabel({})).toBeUndefined();
  });

  it('spaces every section but the first and sets titles in the display font', () => {
    expect(sidebarSectionClasses(0)).toBe('');
    expect(sidebarSectionClasses(1)).toBe('mt-3');
    expect(classesOf(sidebarSectionTitleClasses('pixel'))).toEqual(expect.arrayContaining(['font-pixel', 'uppercase']));
  });

  it('indents items by depth, up to two levels', () => {
    expect([0, 1, 2, 3].map((depth) => classesOf(sidebarItemClasses('pixel', { ...ITEM, depth })))).toEqual([
      expect.arrayContaining(['pl-2']),
      expect.arrayContaining(['pl-6']),
      expect.arrayContaining(['pl-10']),
      expect.arrayContaining(['pl-10']),
    ]);
  });

  // Regression: every item took `border-transparent`, which Tailwind emits
  // after the active item's cyan border, and kept `pl-2 pr-2`, which it emits
  // after the collapsed `pl-0 pr-0`, so neither of those applied.
  it('tints the active item and centres items without padding while collapsed', () => {
    const active = classesOf(sidebarItemClasses('pixel', { ...ITEM, active: true }));
    expect(active).toEqual(expect.arrayContaining(['bg-retro-cyan/15', 'text-retro-cyan', 'border-retro-cyan/30']));
    expect(active).not.toContain('border-transparent');
    expect(classesOf(sidebarItemClasses('pixel', ITEM))).toEqual(
      expect.arrayContaining(['border', 'border-transparent', 'hover:bg-retro-surface/60']),
    );
    const collapsed = classesOf(sidebarItemClasses('linear', { ...ITEM, collapsed: true }));
    expect(collapsed).toEqual(expect.arrayContaining(['justify-center', 'pr-0', 'pl-0']));
    expect(collapsed).not.toContain('pr-2');
    expect(collapsed).not.toContain('pl-2');
  });

  it('rings a focused item, keeping an outline for forced-colors mode, which drops the ring', () => {
    const item = classesOf(sidebarItemClasses('linear', ITEM));
    expect(item).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:ring-retro-cyan/40', 'focus-visible:outline-hidden']));
    expect(item).not.toContain('outline-none');
  });

  it('hides item labels visually while collapsed', () => {
    expect(sidebarItemLabelClasses(true)).toBe('truncate sr-only');
    expect(sidebarItemLabelClasses(false)).toBe('truncate');
  });

  it('paints badges in their tone, neutral by default', () => {
    expect(classesOf(sidebarBadgeClasses('pixel', 'green'))).toEqual(
      expect.arrayContaining(['bg-retro-green/18', 'border-retro-green/30', 'text-retro-green']),
    );
    expect(classesOf(sidebarBadgeClasses('linear'))).toEqual(
      expect.arrayContaining(['bg-retro-surface/40', 'border-retro-border', 'rounded-full']),
    );
  });
});
