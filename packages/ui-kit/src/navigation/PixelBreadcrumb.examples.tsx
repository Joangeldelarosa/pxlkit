import { PixelBreadcrumb } from '../navigation';

const TRAIL = [
  { label: 'Home', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'Components', href: '/docs/components' },
  { label: 'Breadcrumb', active: true },
];

export function Default() {
  return <PixelBreadcrumb items={TRAIL} />;
}

export function PixelSurface() {
  return <PixelBreadcrumb items={TRAIL} surface="pixel" />;
}

export function LinearSurface() {
  return <PixelBreadcrumb items={TRAIL} surface="linear" />;
}

export function WithOnClick() {
  return (
    <PixelBreadcrumb
      items={[
        { label: 'Dashboard', onClick: () => {} },
        { label: 'Reports', onClick: () => {} },
        { label: 'Q4 Summary', active: true },
      ]}
    />
  );
}

export function PlainLabels() {
  return (
    <PixelBreadcrumb
      items={[
        { label: 'Library' },
        { label: 'Albums' },
        { label: 'Photos', active: true },
      ]}
    />
  );
}

export function SingleCrumb() {
  return <PixelBreadcrumb items={[{ label: 'Home', active: true }]} />;
}

export function LocalisedLabel() {
  return <PixelBreadcrumb items={TRAIL} ariaLabel="Ruta de navegación" />;
}

export function DeepTrail() {
  return (
    <PixelBreadcrumb
      items={[
        { label: 'Org', href: '/' },
        { label: 'Workspaces', href: '/workspaces' },
        { label: 'Engineering', href: '/workspaces/eng' },
        { label: 'Projects', href: '/workspaces/eng/projects' },
        { label: 'pxlkit', href: '/workspaces/eng/projects/pxlkit' },
        { label: 'Settings', active: true },
      ]}
    />
  );
}
