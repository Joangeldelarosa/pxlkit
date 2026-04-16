'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PxlKitIcon } from '@pxlkit/core';
import { Sun, Moon } from '@pxlkit/weather';
import { PixelTooltip } from '@pxlkit/ui-kit';
import { useTheme } from '../../../components/ThemeProvider';
import { PREVIEW_MAP } from '../previews';

/** IDs that are full-page templates (they carry their own theme toggle in the header). */
const PAGE_IDS = new Set([
  'page-saas-landing',
  'page-portfolio',
  'page-indie-game',
  'page-admin-dashboard',
  'page-blog',
]);

function PreviewContent() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const Preview = PREVIEW_MAP[id];
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  if (!Preview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-bg">
        <div className="text-center px-6">
          <p className="font-pixel text-base text-retro-text mb-3">Template not found</p>
          <p className="font-mono text-sm text-retro-muted">
            No preview for: &quot;{id}&quot;
          </p>
        </div>
      </div>
    );
  }

  /* Full-page templates already include their own toggle */
  if (PAGE_IDS.has(id)) {
    return (
      <div className="min-h-screen bg-retro-bg">
        <Preview />
      </div>
    );
  }

  /* Section previews: use global theme + floating toggle */
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      <div className="sticky top-0 z-50 flex items-center justify-end gap-2 px-4 py-2 bg-retro-bg/80 backdrop-blur-sm border-b border-retro-border/30">
        <PixelTooltip content={dark ? 'Switch to light' : 'Switch to dark'} position="bottom">
          <button
            onClick={toggleTheme}
            className="p-2 rounded text-retro-muted hover:text-retro-gold hover:bg-retro-surface/40 transition-colors"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <PxlKitIcon icon={dark ? Sun : Moon} size={16} colorful />
          </button>
        </PixelTooltip>
        <span className="font-mono text-xs text-retro-muted/60 select-none">
          {dark ? 'Dark' : 'Light'}
        </span>
      </div>
      <Preview />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-retro-bg">
          <p className="font-mono text-sm text-retro-muted animate-pulse">
            Loading preview…
          </p>
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
