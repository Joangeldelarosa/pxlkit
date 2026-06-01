'use client';

import { useState, useCallback, useMemo } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Check, Copy, Grid, ExternalLink } from '@pxlkit/ui';
import { Sun, Moon } from '@pxlkit/weather';
import {
  PixelBadge,
  PixelFadeIn,
  PixelDivider,
  PixelTooltip,
} from '@pxlkit/ui-kit';
import {
  TEMPLATE_SECTIONS,
  FULL_PAGE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type TemplateCategoryId,
} from './data';
import { PREVIEW_MAP } from './previews';
import type { TemplateVariant, FullPageTemplate } from './types';

/* ─────────────────────────────────────────────────────────────────────────
   Category navigation — chip filter that drives both Full-Page + Sections.
   Uses a styled toggle row rather than PixelChipGroup so we keep absolute
   control over the cinematic dark surface and avoid radio-group semantics
   on a soft "filter" UI.
   ───────────────────────────────────────────────────────────────────────── */
function TemplateCategoryNav({
  active,
  onChange,
}: {
  active: TemplateCategoryId;
  onChange: (next: TemplateCategoryId) => void;
}) {
  return (
    <nav aria-label="Filter templates by category" className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:thin]">
      <ul className="flex min-w-max gap-2 px-1">
        {TEMPLATE_CATEGORIES.map((cat) => {
          const selected = active === cat.id;
          return (
            <li key={cat.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(cat.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm border transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/60 ${
                  selected
                    ? `bg-retro-${cat.tone}/15 text-retro-${cat.tone} border-retro-${cat.tone}/40`
                    : 'bg-retro-surface/30 text-retro-muted border-retro-border hover:text-retro-text hover:border-retro-text/30'
                }`}
              >
                {cat.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Copy Button
   ───────────────────────────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-mono border transition-all rounded-sm whitespace-nowrap ${
        copied
          ? 'bg-retro-green/20 text-retro-green border-retro-green/40'
          : 'bg-retro-surface text-retro-muted border-retro-border hover:text-retro-green hover:border-retro-green/40'
      }`}
      aria-label="Copy code"
    >
      <PxlKitIcon icon={copied ? Check : Copy} size={11} />
      {copied ? 'COPIED' : 'COPY'}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Code Block
   ───────────────────────────────────────────────────────────────────────── */
function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="relative border border-retro-border bg-retro-bg rounded-sm overflow-hidden">
      {title && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-retro-border bg-retro-surface/40">
          <span className="text-xs font-mono text-retro-muted">{title}</span>
          <CopyButton text={code} />
        </div>
      )}
      {!title && (
        <div className="absolute top-2 right-2 z-10">
          <CopyButton text={code} />
        </div>
      )}
      <div className="overflow-auto max-h-[360px] sm:max-h-[480px]">
        <pre className="p-3 sm:p-4 text-[11px] sm:text-xs font-mono leading-relaxed text-retro-text whitespace-pre-wrap">
          {code}
        </pre>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Install Command
   ───────────────────────────────────────────────────────────────────────── */
function InstallCmd({ cmd }: { cmd: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-retro-surface/50 border border-retro-border rounded-sm">
      <code className="text-[11px] sm:text-xs font-mono text-retro-green break-all">{cmd}</code>
      <CopyButton text={cmd} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Section Theme Wrapper — wraps a section preview with dark/light toggle
   ───────────────────────────────────────────────────────────────────────── */
function SectionThemeWrapper({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);
  return (
    <div className={dark ? 'dark' : 'light'}>
      <div className="bg-retro-bg text-retro-text">
        <div className="flex items-center justify-end gap-2 px-2.5 sm:px-3 py-1.5 border-b border-retro-border/30 bg-retro-surface/20">
          <PixelTooltip content={dark ? 'Switch to light' : 'Switch to dark'} position="bottom">
            <button
              onClick={() => setDark((d) => !d)}
              className="p-1.5 rounded text-retro-muted hover:text-retro-gold hover:bg-retro-surface/40 transition-colors"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <PxlKitIcon icon={dark ? Sun : Moon} size={14} colorful />
            </button>
          </PixelTooltip>
          <span className="font-mono text-[10px] text-retro-muted/60 select-none">
            {dark ? 'Dark' : 'Light'}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Section Variant Card
   ───────────────────────────────────────────────────────────────────────── */
function VariantCard({ variant }: { variant: TemplateVariant }) {
  const [tab, setTab] = useState<'preview' | 'code' | 'install'>('preview');
  const Preview = PREVIEW_MAP[variant.id];

  return (
    <div className="border border-retro-border bg-retro-bg rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 px-3 sm:px-4 py-3 border-b border-retro-border bg-retro-surface/30">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-pixel text-xs text-retro-text leading-relaxed">{variant.name}</h4>
          {Preview && (
            <a
              href={`/templates/preview?id=${variant.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex sm:hidden items-center gap-1 px-2 py-1 text-[10px] font-mono text-retro-muted border border-retro-border rounded-sm hover:text-retro-green hover:border-retro-green/40 transition-all"
            >
              <PxlKitIcon icon={ExternalLink} size={10} />
              Open
            </a>
          )}
        </div>
        <p className="font-mono text-xs text-retro-muted">{variant.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <PixelBadge tone="cyan">Component</PixelBadge>
          {Preview && (
            <a
              href={`/templates/preview?id=${variant.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-retro-muted border border-retro-border rounded-sm hover:text-retro-green hover:border-retro-green/40 transition-all"
            >
              <PxlKitIcon icon={ExternalLink} size={10} />
              Open
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 border-b border-retro-border">
        {(['preview', 'code', 'install'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`min-w-0 px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-mono uppercase transition-all ${
              tab === t
                ? 'text-retro-green border-b-2 border-retro-green bg-retro-green/5'
                : 'text-retro-muted hover:text-retro-text'
            }`}
          >
            {t === 'preview' ? 'Preview' : t === 'code' ? 'Code' : 'Install'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {tab === 'preview' ? (
          Preview ? (
            <div className="border border-retro-border rounded-sm overflow-hidden overflow-y-auto max-h-[380px] sm:max-h-[520px]">
              <SectionThemeWrapper>
                <Preview />
              </SectionThemeWrapper>
            </div>
          ) : (
            <div className="py-10 text-center text-retro-muted font-mono text-xs">
              Preview not available
            </div>
          )
        ) : tab === 'code' ? (
          <CodeBlock code={variant.code} />
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-xs text-retro-muted">Install required packages:</p>
            <InstallCmd cmd={variant.installCmd} />
            <p className="font-mono text-xs text-retro-muted/60">
              Then import the component from the code tab above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Full Page Template Card
   ───────────────────────────────────────────────────────────────────────── */
function PageTemplateCard({ tpl }: { tpl: FullPageTemplate }) {
  const [tab, setTab] = useState<'preview' | 'code' | 'install'>('preview');
  const Preview = PREVIEW_MAP[tpl.id];

  return (
    <div className="border border-retro-border bg-retro-bg rounded-sm overflow-hidden">
      <div className="flex flex-col gap-3 px-3 sm:px-4 py-3 border-b border-retro-border bg-retro-surface/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-2xl" role="img" aria-hidden>{tpl.icon}</span>
            <div className="min-w-0">
              <h3 className="font-pixel text-xs text-retro-text leading-relaxed">{tpl.name}</h3>
              <p className="font-mono text-xs text-retro-muted mt-0.5">{tpl.description}</p>
            </div>
          </div>
          {Preview && (
            <a
              href={`/templates/preview?id=${tpl.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex sm:hidden items-center gap-1 px-2 py-1 text-[10px] font-mono text-retro-muted border border-retro-border rounded-sm hover:text-retro-gold hover:border-retro-gold/40 transition-all"
            >
              <PxlKitIcon icon={ExternalLink} size={10} />
              Open
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PixelBadge tone="gold">Full Page</PixelBadge>
          {Preview && (
            <a
              href={`/templates/preview?id=${tpl.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-retro-muted border border-retro-border rounded-sm hover:text-retro-gold hover:border-retro-gold/40 transition-all"
            >
              <PxlKitIcon icon={ExternalLink} size={10} />
              Preview
            </a>
          )}
          {tpl.fullPageHref && (
            <a
              href={tpl.fullPageHref}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-retro-cyan border border-retro-cyan/40 bg-retro-cyan/8 rounded-sm hover:bg-retro-cyan/15 transition-all"
            >
              <PxlKitIcon icon={ExternalLink} size={10} />
              Open full page
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-retro-border">
        {(['preview', 'code', 'install'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`min-w-0 px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-mono uppercase transition-all ${
              tab === t
                ? 'text-retro-gold border-b-2 border-retro-gold bg-retro-gold/5'
                : 'text-retro-muted hover:text-retro-text'
            }`}
          >
            {t === 'preview' ? 'Preview' : t === 'code' ? 'Code' : 'Install'}
          </button>
        ))}
      </div>

      <div className="p-3 sm:p-4">
        {tab === 'preview' ? (
          Preview ? (
            <div className="border border-retro-border rounded-sm overflow-hidden overflow-y-auto max-h-[420px] sm:max-h-[600px]">
              <Preview />
            </div>
          ) : (
            <div className="py-10 text-center text-retro-muted font-mono text-xs">
              Preview not available
            </div>
          )
        ) : tab === 'code' ? (
          <CodeBlock code={tpl.code} />
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-xs text-retro-muted">Install all required packages:</p>
            <InstallCmd cmd={tpl.installCmd} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────────────────────────────────── */
export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategoryId>('all');
  const [activeSection, setActiveSection] = useState<string>(TEMPLATE_SECTIONS[0].id);

  const filteredPages = useMemo(() => {
    if (activeCategory === 'all') return FULL_PAGE_TEMPLATES;
    return FULL_PAGE_TEMPLATES.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const filteredSections = useMemo(() => {
    if (activeCategory === 'all') return TEMPLATE_SECTIONS;
    return TEMPLATE_SECTIONS.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const currentSection =
    filteredSections.find((s) => s.id === activeSection) ?? filteredSections[0];

  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      {/* Page hero */}
      <section className="py-10 sm:py-16 px-4 border-b border-retro-border/50">
        <div className="max-w-7xl mx-auto">
          <PixelFadeIn>
            <div className="mb-4 inline-flex items-center gap-2">
              <PixelBadge tone="gold">
                <PxlKitIcon icon={Grid} size={11} className="mr-1" />
                Templates
              </PixelBadge>
            </div>
            <h1 className="font-pixel text-base sm:text-xl md:text-2xl lg:text-3xl text-retro-text leading-loose mb-3 break-words">
              Skip the first day of every project.
            </h1>
            <p className="text-retro-muted font-mono text-xs sm:text-sm max-w-2xl leading-relaxed">
              Full-page templates wired end-to-end plus section snippets ready to copy. Preview, lift the code,
              install the kit.
            </p>
          </PixelFadeIn>
        </div>
      </section>

      {/* Category filter */}
      <section className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-b border-retro-border/50 bg-retro-surface/10">
        <div className="max-w-7xl mx-auto">
          <TemplateCategoryNav active={activeCategory} onChange={setActiveCategory} />
        </div>
      </section>

      {/* Full Page Templates — promoted to primary surface */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-retro-border/50">
        <div className="max-w-7xl mx-auto">
          <PixelFadeIn>
            <div className="mb-5 sm:mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex items-center gap-2">
                  <PixelBadge tone="gold" variant="soft" size="sm">
                    {`${filteredPages.length} page${filteredPages.length === 1 ? '' : 's'}`}
                  </PixelBadge>
                </div>
                <h2 className="font-pixel text-sm sm:text-base md:text-lg lg:text-xl text-retro-text leading-loose break-words">
                  Full-page templates
                </h2>
                <p className="font-mono text-xs sm:text-sm text-retro-muted mt-1 max-w-xl">
                  Each layout is wired end-to-end with the kit, dark + light included. Preview it, copy the source, or
                  open the live route.
                </p>
              </div>
            </div>
            {filteredPages.length === 0 ? (
              <div className="py-10 text-center font-mono text-xs text-retro-muted border border-dashed border-retro-border rounded-sm">
                No full-page templates in this category yet — try another tab.
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {filteredPages.map((tpl) => (
                  <PageTemplateCard key={tpl.id} tpl={tpl} />
                ))}
              </div>
            )}
          </PixelFadeIn>
        </div>
      </section>

      {/* Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile nav strip */}
        <div className="lg:hidden mb-5">
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded border transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'text-retro-green border-retro-green/40 bg-retro-green/10'
                    : 'text-retro-muted border-retro-border hover:text-retro-text hover:bg-retro-surface'
                }`}
              >
                <span role="img" aria-hidden>{section.icon}</span>
                {section.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar navigation */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20">
              <p className="font-pixel text-xs text-retro-muted mb-3 uppercase">Section snippets</p>
              <nav className="space-y-0.5">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-mono rounded transition-all text-left ${
                      activeSection === section.id
                        ? 'text-retro-green bg-retro-green/10'
                        : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface'
                    }`}
                  >
                    <span className="text-base leading-none" role="img" aria-hidden>{section.icon}</span>
                    {section.name}
                  </button>
                ))}
              </nav>
              <PixelDivider tone="neutral" spacing="sm" className="my-3" />
              <p className="font-mono text-[10px] text-retro-muted/60 leading-relaxed">
                Tip: combine sections from this category with the full pages above to compose a route in minutes.
              </p>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {currentSection ? (
              <PixelFadeIn key={currentSection.id}>
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-2xl sm:text-3xl" role="img" aria-hidden>{currentSection.icon}</span>
                    <h2 className="font-pixel text-sm sm:text-base text-retro-text leading-loose">
                      {currentSection.name}
                    </h2>
                    <PixelBadge tone="neutral">
                      {currentSection.variants.length} variants
                    </PixelBadge>
                  </div>
                  <p className="text-retro-muted font-mono text-xs sm:text-sm">{currentSection.description}</p>
                </div>
                <div className="space-y-6 sm:space-y-8">
                  {currentSection.variants.map((variant) => (
                    <VariantCard key={variant.id} variant={variant} />
                  ))}
                </div>
              </PixelFadeIn>
            ) : (
              <div className="py-10 text-center font-mono text-xs text-retro-muted border border-dashed border-retro-border rounded-sm">
                No section snippets in this category — try another tab.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
