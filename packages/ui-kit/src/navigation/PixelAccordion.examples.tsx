import { PixelAccordion } from '../navigation';

const SAMPLE_ITEMS = [
  {
    id: 'overview',
    title: 'Overview',
    content: 'Introductory section that opens by default.',
  },
  {
    id: 'details',
    title: 'Details',
    content: 'Secondary section with extended copy.',
  },
  {
    id: 'faq',
    title: 'FAQ',
    content: 'Common questions and short answers.',
  },
];

export function Default() {
  return <PixelAccordion items={SAMPLE_ITEMS} />;
}

export function CollapsedByDefault() {
  return <PixelAccordion items={SAMPLE_ITEMS} collapsedByDefault />;
}

export function AllowMultiple() {
  return <PixelAccordion items={SAMPLE_ITEMS} allowMultiple />;
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-4">
      <PixelAccordion items={SAMPLE_ITEMS} surface="pixel" />
      <PixelAccordion items={SAMPLE_ITEMS} surface="linear" />
    </div>
  );
}

export function RichContent() {
  return (
    <PixelAccordion
      items={[
        {
          id: 'changelog',
          title: 'Changelog v1.2.0',
          content: (
            <ul className="list-disc pl-4">
              <li>Added accordion keyboard wiring</li>
              <li>Surface-aware typography</li>
              <li>Optional multi-open behaviour</li>
            </ul>
          ),
        },
        {
          id: 'migration',
          title: 'Migration notes',
          content: (
            <p>
              Pass <code>collapsedByDefault</code> to keep every item closed on
              first render.
            </p>
          ),
        },
      ]}
    />
  );
}
