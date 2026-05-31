'use client';

import {
  PixelBadge,
  PixelCluster,
  PixelContainer,
  PixelTextLink,
} from '@pxlkit/ui-kit';

export interface WhatsNewItem {
  name: string;
  category: string;
  href?: string;
  isNew?: boolean;
}

export interface WhatsNewStripProps {
  version: string;
  date: string;
  items: WhatsNewItem[];
  changelogHref?: string;
}

const categoryTone: Record<string, 'cyan' | 'green' | 'purple' | 'gold' | 'red' | 'neutral'> = {
  data: 'cyan',
  navigation: 'purple',
  feedback: 'gold',
  layout: 'green',
  forms: 'red',
};

function toneFor(category: string) {
  return categoryTone[category.toLowerCase()] ?? 'neutral';
}

function scrollToAnchor(href: string | undefined) {
  if (!href || !href.startsWith('#')) return;
  const el = typeof document !== 'undefined' ? document.getElementById(href.slice(1)) : null;
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function WhatsNewStrip({
  version,
  date,
  items,
  changelogHref = '/templates/changelog',
}: WhatsNewStripProps) {
  return (
    <PixelContainer
      as="aside"
      maxWidth="6xl"
      padding="md"
      aria-label={`What's new in v${version}`}
      data-testid="whats-new-strip"
    >
      <div className="rounded-lg border border-retro-cyan/30 bg-retro-surface/30 p-4 sm:p-5">
        <PixelCluster gap={3} align="center" justify="between" className="mb-3">
          <PixelCluster gap={3} align="center">
            <PixelBadge tone="cyan" variant="solid">{`v${version}`}</PixelBadge>
            <span className="font-pixel text-xs uppercase tracking-wider text-retro-fg">
              What&apos;s new
            </span>
            <span className="text-xs text-retro-muted">{date}</span>
          </PixelCluster>
          <PixelTextLink href={changelogHref} tone="cyan" className="text-xs">
            See full changelog →
          </PixelTextLink>
        </PixelCluster>

        <div
          className="-mx-1 overflow-x-auto scrollbar-thin"
          data-testid="whats-new-track"
        >
          <ul className="flex min-w-max items-stretch gap-2 px-1 py-1">
            {items.map((item) => {
              const tone = toneFor(item.category);
              const content = (
                <span className="relative inline-flex items-center gap-2 rounded-md border border-retro-border/50 bg-retro-bg/60 px-3 py-1.5 transition-colors hover:border-retro-cyan/60 hover:bg-retro-surface/50">
                  {item.isNew && (
                    <span
                      aria-hidden
                      className="inline-flex items-center rounded-sm border border-retro-cyan/60 bg-retro-cyan/15 px-1.5 py-0.5 font-pixel text-[11px] leading-none uppercase tracking-wider text-retro-cyan"
                    >
                      New
                    </span>
                  )}
                  <span className="whitespace-nowrap font-mono text-xs text-retro-fg">{item.name}</span>
                  <PixelBadge tone={tone} size="sm">{item.category}</PixelBadge>
                </span>
              );

              return (
                <li key={item.name}>
                  {item.href ? (
                    <a
                      href={item.href}
                      onClick={(e) => {
                        if (item.href && item.href.startsWith('#')) {
                          e.preventDefault();
                          scrollToAnchor(item.href);
                        }
                      }}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg rounded-md"
                      aria-label={`${item.isNew ? 'New: ' : ''}${item.name} (${item.category})`}
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </PixelContainer>
  );
}

export default WhatsNewStrip;
