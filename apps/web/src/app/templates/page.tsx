'use client';

import { useState, useCallback } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Check, Copy, ArrowRight, Grid, List } from '@pxlkit/ui';
import {
  PixelButton,
  PixelBadge,
  PixelFadeIn,
  PixelDivider,
} from '@pxlkit/ui-kit';
import { TEMPLATE_SECTIONS, FULL_PAGE_TEMPLATES } from './data';
import type { TemplateVariant, FullPageTemplate } from './types';

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
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono border transition-all rounded-sm ${
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
        <div className="flex items-center justify-between px-4 py-2 border-b border-retro-border bg-retro-surface/40">
          <span className="text-[10px] font-mono text-retro-muted">{title}</span>
          <CopyButton text={code} />
        </div>
      )}
      {!title && (
        <div className="absolute top-2 right-2 z-10">
          <CopyButton text={code} />
        </div>
      )}
      <div className="overflow-auto max-h-[480px]">
        <pre className="p-4 text-xs font-mono leading-relaxed text-retro-text whitespace-pre-wrap">
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
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-retro-surface/50 border border-retro-border rounded-sm">
      <code className="text-xs font-mono text-retro-green break-all">{cmd}</code>
      <CopyButton text={cmd} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Section Variant Card
   ───────────────────────────────────────────────────────────────────────── */
function VariantCard({ variant }: { variant: TemplateVariant }) {
  const [tab, setTab] = useState<'code' | 'install'>('code');

  return (
    <div className="border border-retro-border bg-retro-bg rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-retro-border bg-retro-surface/30">
        <div>
          <h4 className="font-pixel text-[10px] text-retro-text leading-relaxed">{variant.name}</h4>
          <p className="font-mono text-[10px] text-retro-muted mt-0.5">{variant.description}</p>
        </div>
        <span className="hidden sm:block">
          <PixelBadge tone="cyan">Component</PixelBadge>
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-retro-border">
        {(['code', 'install'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[10px] font-mono uppercase transition-all ${
              tab === t
                ? 'text-retro-green border-b-2 border-retro-green bg-retro-green/5'
                : 'text-retro-muted hover:text-retro-text'
            }`}
          >
            {t === 'code' ? 'Code' : 'Install'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {tab === 'code' ? (
          <CodeBlock code={variant.code} />
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-xs text-retro-muted">Install required packages:</p>
            <InstallCmd cmd={variant.installCmd} />
            <p className="font-mono text-[10px] text-retro-muted/60">
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
  const [tab, setTab] = useState<'code' | 'install'>('code');

  return (
    <div className="border border-retro-border bg-retro-bg rounded-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-retro-border bg-retro-surface/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-hidden>{tpl.icon}</span>
          <div>
            <h3 className="font-pixel text-[10px] text-retro-text leading-relaxed">{tpl.name}</h3>
            <p className="font-mono text-[10px] text-retro-muted mt-0.5 max-w-md">{tpl.description}</p>
          </div>
        </div>
        <span className="hidden sm:block">
          <PixelBadge tone="gold">Full Page</PixelBadge>
        </span>
      </div>

      <div className="flex border-b border-retro-border">
        {(['code', 'install'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[10px] font-mono uppercase transition-all ${
              tab === t
                ? 'text-retro-gold border-b-2 border-retro-gold bg-retro-gold/5'
                : 'text-retro-muted hover:text-retro-text'
            }`}
          >
            {t === 'code' ? 'Code' : 'Install'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'code' ? (
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
  const [activeSection, setActiveSection] = useState<string>(TEMPLATE_SECTIONS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSection = TEMPLATE_SECTIONS.find((s) => s.id === activeSection);
  const isPagesView = activeSection === '__pages__';

  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      {/* Page hero */}
      <section className="py-12 sm:py-16 px-4 border-b border-retro-border/50">
        <div className="max-w-7xl mx-auto">
          <PixelFadeIn>
            <div className="mb-4 inline-flex items-center gap-2">
              <PixelBadge tone="gold">
                <PxlKitIcon icon={Grid} size={11} className="mr-1" />
                Templates
              </PixelBadge>
            </div>
            <h1 className="font-pixel text-xl sm:text-3xl text-retro-text leading-loose mb-3">
              Ready-to-use Templates
            </h1>
            <p className="text-retro-muted font-mono text-sm max-w-2xl">
              Copy-paste sections and full page layouts built with Pxlkit components.
              Pick a category, choose a variant, copy the code, and ship.
            </p>
          </PixelFadeIn>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar navigation */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20">
              <p className="font-pixel text-[9px] text-retro-muted mb-3 uppercase">Sections</p>
              <nav className="space-y-0.5">
                {TEMPLATE_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-mono rounded transition-all text-left ${
                      activeSection === section.id && !isPagesView
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

              <p className="font-pixel text-[9px] text-retro-muted mb-3 uppercase">Full Pages</p>
              <button
                onClick={() => setActiveSection('__pages__')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-mono rounded transition-all text-left ${
                  isPagesView
                    ? 'text-retro-gold bg-retro-gold/10'
                    : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface'
                }`}
              >
                <span className="text-base leading-none" role="img" aria-hidden>📄</span>
                Page Templates
                <span className="ml-auto"><PixelBadge tone="gold">{FULL_PAGE_TEMPLATES.length}</PixelBadge></span>
              </button>
            </div>
          </aside>

          {/* Mobile nav strip */}
          <div className="lg:hidden w-full mb-6">
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded border transition-all ${
                    activeSection === section.id && !isPagesView
                      ? 'text-retro-green border-retro-green/40 bg-retro-green/10'
                      : 'text-retro-muted border-retro-border hover:text-retro-text hover:bg-retro-surface'
                  }`}
                >
                  <span role="img" aria-hidden>{section.icon}</span>
                  {section.name}
                </button>
              ))}
              <button
                onClick={() => setActiveSection('__pages__')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded border transition-all ${
                  isPagesView
                    ? 'text-retro-gold border-retro-gold/40 bg-retro-gold/10'
                    : 'text-retro-muted border-retro-border hover:text-retro-text hover:bg-retro-surface'
                }`}
              >
                <span role="img" aria-hidden>📄</span>
                Full Pages
              </button>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {isPagesView ? (
              <PixelFadeIn>
                <div className="mb-6">
                  <h2 className="font-pixel text-base text-retro-text leading-loose">
                    Full Page Templates
                  </h2>
                  <p className="text-retro-muted font-mono text-sm mt-1">
                    Complete page layouts ready to drop into your project.
                  </p>
                </div>
                <div className="space-y-8">
                  {FULL_PAGE_TEMPLATES.map((tpl) => (
                    <PageTemplateCard key={tpl.id} tpl={tpl} />
                  ))}
                </div>
              </PixelFadeIn>
            ) : currentSection ? (
              <PixelFadeIn key={currentSection.id}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl" role="img" aria-hidden>{currentSection.icon}</span>
                    <h2 className="font-pixel text-base text-retro-text leading-loose">
                      {currentSection.name}
                    </h2>
                    <PixelBadge tone="neutral">
                      {currentSection.variants.length} variants
                    </PixelBadge>
                  </div>
                  <p className="text-retro-muted font-mono text-sm">{currentSection.description}</p>
                </div>
                <div className="space-y-8">
                  {currentSection.variants.map((variant) => (
                    <VariantCard key={variant.id} variant={variant} />
                  ))}
                </div>
              </PixelFadeIn>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
