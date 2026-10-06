import { PixelChangelogTemplate } from '@/components/templates/changelog-template';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbList } from '@/lib/structured-data';

export const metadata = pageMetadata({
  path: '/changelog',
  title: 'Changelog — Every Pxlkit Release',
  description:
    'Pxlkit release notes: 2.2.0 brings the React UI kit to Vue and Angular. Every release since 1.6, filterable by version and change type.',
  imageAlt: 'Pxlkit changelog — every release of the retro pixel-art UI kit for React',
  keywords: ['pxlkit changelog', 'pxlkit release notes', 'react ui kit changelog', 'pxlkit 2.2'],
});

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      <JsonLd data={breadcrumbList([{ name: 'Changelog', path: '/changelog' }])} />
      <PixelChangelogTemplate headingAs="h1" />
    </div>
  );
}
