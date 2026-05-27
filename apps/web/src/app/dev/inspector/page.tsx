import type { Metadata } from 'next';
import { Inspector, parseInspectorParams } from '@/dev/inspector';

export const metadata: Metadata = {
  title: 'Icon Inspector · pxlkit (dev)',
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function IconInspectorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v != null) usp.set(key, v);
  }

  return <Inspector initialState={parseInspectorParams(usp)} />;
}
