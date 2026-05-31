'use client';

import {
  PixelBadge,
  PixelCollapsible,
  PixelTextLink,
} from '@pxlkit/ui-kit';
import { CodeBlock } from '../../components/CodeBlock';

export type PropDef = { name: string; type: string; default: string; description: string };

export function CompLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <PixelTextLink
      onClick={() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
      className="decoration-retro-cyan/40"
    >
      {children}
    </PixelTextLink>
  );
}

export function PropsTable({ data }: { data: PropDef[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-retro-border/40">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-retro-border bg-retro-surface/40">
            <th className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-retro-muted">Prop</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-retro-muted">Type</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-retro-muted">Default</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-retro-muted">Description</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.name} className="border-b border-retro-border/20">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-retro-cyan">{p.name}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-retro-purple">{p.type}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-retro-gold">{p.default || '—'}</td>
              <td className="px-3 py-2 text-retro-muted">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocSection({
  id,
  title,
  description,
  props,
  code,
  children,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  props?: PropDef[];
  code?: string;
  children: React.ReactNode;
}) {
  return (
    <section data-section={id} id={id} className="scroll-mt-20 space-y-4 pt-10 first:pt-0">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="font-pixel text-xs text-retro-green">{title.toUpperCase()}</h2>
          <PixelBadge tone="neutral">{title.replace('Pixel', '').toLowerCase()}</PixelBadge>
        </div>
        <div className="mt-2 text-sm text-retro-muted max-w-2xl">{description}</div>
      </div>

      <div className="rounded-lg bg-retro-surface/10 p-4 sm:p-6">
        {children}
      </div>

      {props && props.length > 0 && (
        <PixelCollapsible label={`Props reference (${props.length})`}>
          <div>
            <PropsTable data={props} />
          </div>
        </PixelCollapsible>
      )}

      {code && <CodeBlock code={code} language="tsx" />}
    </section>
  );
}
