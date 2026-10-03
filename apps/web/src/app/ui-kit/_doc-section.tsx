'use client';

import {
  PixelBadge,
  PixelCollapsible,
  PixelTable,
  PixelTextLink,
  type PixelTableColumn,
} from '@pxlkit/ui-kit';
import { FrameworkCode } from '../../components/FrameworkCode';
import { USAGE_SNIPPETS } from '../docs/sections/usage-snippets.generated';
import { USAGE_SNIPPETS_VUE } from '../docs/sections/usage-snippets.vue.generated';
import { USAGE_SNIPPETS_ANGULAR } from '../docs/sections/usage-snippets.angular.generated';

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

const PROPS_TABLE_COLUMNS: Array<PixelTableColumn<PropDef>> = [
  { key: 'name', header: 'Prop', className: 'whitespace-nowrap', render: (p) => <span className="text-retro-cyan">{p.name}</span> },
  { key: 'type', header: 'Type', className: 'whitespace-nowrap', render: (p) => <span className="text-retro-purple">{p.type}</span> },
  { key: 'default', header: 'Default', className: 'whitespace-nowrap', render: (p) => <span className="text-retro-gold">{p.default || '—'}</span> },
  { key: 'description', header: 'Description', render: (p) => <span className="text-retro-muted">{p.description}</span> },
];

export function PropsTable({ data }: { data: PropDef[] }) {
  return (
    <PixelTable<PropDef>
      columns={PROPS_TABLE_COLUMNS}
      data={data}
      getRowId={(p) => p.name}
    />
  );
}

/* The example the docs build picks for the component (showcase-examples.ts,
   else its first), self-contained, in React and in the Vue and Angular kits
   that implement it — the same code /docs shows, from the same examples the
   parity suites render in all three. */
export function UsageCode({ component, title }: { component: string; title: string }) {
  const react = USAGE_SNIPPETS[component];
  if (!react) return null;
  return (
    <FrameworkCode
      react={react}
      vue={USAGE_SNIPPETS_VUE[component]}
      angular={USAGE_SNIPPETS_ANGULAR[component]}
      label={`${title} code`}
    />
  );
}

export function DocSection({
  id,
  component = id,
  title,
  description,
  props,
  children,
}: {
  id: string;
  /** The component's slug, where the section's anchor is another one. */
  component?: string;
  title: string;
  description: React.ReactNode;
  props?: PropDef[];
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

      <UsageCode component={component} title={title} />
    </section>
  );
}
