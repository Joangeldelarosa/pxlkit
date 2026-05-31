import { PixelTextLink } from '../data-display';

export function Default() {
  return <PixelTextLink href="https://pxlkit.dev">Read the docs</PixelTextLink>;
}

export function Tones() {
  return (
    <div className="flex flex-wrap gap-4">
      <PixelTextLink href="#" tone="cyan">Cyan link</PixelTextLink>
      <PixelTextLink href="#" tone="green">Green link</PixelTextLink>
      <PixelTextLink href="#" tone="gold">Gold link</PixelTextLink>
      <PixelTextLink href="#" tone="red">Red link</PixelTextLink>
      <PixelTextLink href="#" tone="purple">Purple link</PixelTextLink>
      <PixelTextLink href="#" tone="pink">Pink link</PixelTextLink>
      <PixelTextLink href="#" tone="neutral">Neutral link</PixelTextLink>
    </div>
  );
}

export function AsButton() {
  return (
    <PixelTextLink tone="cyan" onClick={() => console.log('clicked')}>
      Trigger an action
    </PixelTextLink>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelTextLink href="#" surface="pixel">Pixel surface</PixelTextLink>
      <PixelTextLink href="#" surface="linear">Linear surface</PixelTextLink>
    </div>
  );
}

export function ExternalLink() {
  return (
    <PixelTextLink
      href="https://pxlkit.dev"
      target="_blank"
      rel="noopener noreferrer"
    >
      Open in new tab
    </PixelTextLink>
  );
}

export function InlineInProse() {
  return (
    <p className="max-w-md">
      Built with{' '}
      <PixelTextLink href="https://pxlkit.dev" tone="green">
        pxlkit
      </PixelTextLink>
      , a tone-coloured component library for retro interfaces.
    </p>
  );
}
