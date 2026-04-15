'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PREVIEW_MAP } from '../previews';

function PreviewContent() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const Preview = PREVIEW_MAP[id];

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

  return (
    <div className="min-h-screen bg-retro-bg">
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
