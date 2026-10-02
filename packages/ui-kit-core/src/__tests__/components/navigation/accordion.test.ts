import { describe, expect, it } from 'vitest';
import {
  accordionClasses,
  accordionIds,
  accordionInitialOpen,
  accordionItemClasses,
  toggleAccordionItem,
} from '../../../components/navigation/accordion';

const classesOf = (value: string) => value.split(' ');
const ITEMS = [{ id: 'one' }, { id: 'two' }, { id: 'three' }];

describe('accordion state', () => {
  it('opens the first item unless every item starts collapsed', () => {
    expect(accordionInitialOpen(ITEMS, false)).toEqual(['one']);
    expect(accordionInitialOpen(ITEMS, true)).toEqual([]);
    expect(accordionInitialOpen([], false)).toEqual([]);
  });

  it('keeps one item open at a time by default', () => {
    expect(toggleAccordionItem(['one'], 'two', false)).toEqual(['two']);
    expect(toggleAccordionItem([], 'three', false)).toEqual(['three']);
  });

  it('opens items alongside the open ones when several are allowed', () => {
    expect(toggleAccordionItem(['one'], 'two', true)).toEqual(['one', 'two']);
  });

  it('closes an open item, leaving the others open', () => {
    expect(toggleAccordionItem(['two'], 'two', false)).toEqual([]);
    expect(toggleAccordionItem(['one', 'two', 'three'], 'two', true)).toEqual(['one', 'three']);
  });

  it('does not change the open items it is given', () => {
    const open = ['one'];
    toggleAccordionItem(open, 'two', true);
    toggleAccordionItem(open, 'one', true);
    expect(open).toEqual(['one']);
  });

  it('derives the header and panel ids from the base id and the item id', () => {
    expect(accordionIds('pxl-1', 'faq')).toEqual({ header: 'pxl-1-h-faq', panel: 'pxl-1-p-faq' });
  });
});

describe('accordion recipes', () => {
  it('stacks the items', () => {
    expect(accordionClasses).toBe('space-y-1.5');
  });

  it('frames each item in the surface border and radius', () => {
    expect(classesOf(accordionItemClasses('pixel', false).item)).toEqual(
      expect.arrayContaining(['border-2', 'pxl-corner-sm', 'border-retro-border/40']),
    );
    expect(classesOf(accordionItemClasses('linear', false).item)).toEqual(expect.arrayContaining(['border', 'rounded-md']));
  });

  it('rings the focused header and sets it in the surface font', () => {
    const trigger = classesOf(accordionItemClasses('linear', false).trigger);
    expect(trigger).toEqual(expect.arrayContaining(['font-sans', 'focus-visible:ring-2', 'focus-visible:ring-retro-cyan/30']));
  });

  it('turns the chevron while open', () => {
    expect(classesOf(accordionItemClasses('pixel', true).chevron)).toContain('rotate-180');
    expect(classesOf(accordionItemClasses('pixel', false).chevron)).not.toContain('rotate-180');
  });

  it('separates the panel from its header', () => {
    expect(classesOf(accordionItemClasses('pixel', true).panel)).toContain('border-t');
  });
});
