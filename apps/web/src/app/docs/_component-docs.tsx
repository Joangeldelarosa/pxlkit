'use client';

import { useCallback, useEffect, useState } from 'react';
import { DOCS_SECTIONS } from './sections/registry';

/**
 * Collapsed-by-default entry in the /docs Component Reference.
 *
 * The page renders one literal `<section id="<slug>">` anchor per component
 * (coherence gate 05 requires the ids to live in page.tsx itself); this
 * wrapper provides the expand/collapse shell and lazy-loads the generated
 * SSOT docs section (`./sections/<Name>.section.tsx`) only when opened, so
 * the 111-section reference never bloats the initial /docs bundle.
 *
 * Deep links (`/docs#pixel-button`) auto-expand the matching entry — the
 * anchor itself exists in the server-rendered HTML, so native hash scrolling
 * keeps working even before hydration.
 */
export function ComponentDocs({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const syncWithHash = () => {
      if (window.location.hash === `#${slug}`) setOpen(true);
    };
    syncWithHash();
    window.addEventListener('hashchange', syncWithHash);
    return () => window.removeEventListener('hashchange', syncWithHash);
  }, [slug]);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  const entry = DOCS_SECTIONS[slug];
  if (!entry) return null;
  const { name, Component } = entry;

  return (
    <div className="rounded-lg border border-retro-border/30 bg-retro-surface/20 overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${slug}-reference`}
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-retro-cyan/5"
      >
        <span className="font-mono text-xs text-retro-text">{name}</span>
        <span className="flex items-center gap-3">
          <span className="hidden sm:inline font-mono text-[10px] text-retro-muted/50">#{slug}</span>
          <span className="font-mono text-[10px] text-retro-cyan">{open ? '[-]' : '[+]'}</span>
        </span>
      </button>
      {open && (
        <div id={`${slug}-reference`} className="border-t border-retro-border/30 px-4 pb-4">
          <Component className="component-docs" />
        </div>
      )}
    </div>
  );
}
