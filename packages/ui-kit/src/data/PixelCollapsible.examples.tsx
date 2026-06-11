import { PixelCollapsible } from './PixelCollapsible';

export function Default() {
  return (
    <PixelCollapsible label="Show details">
      <p className="text-xs text-retro-muted">
        Hidden content revealed when the header is toggled.
      </p>
    </PixelCollapsible>
  );
}

export function DefaultOpen() {
  return (
    <PixelCollapsible label="Already expanded" defaultOpen>
      <p className="text-xs text-retro-muted">
        Renders open on first mount; click the header to collapse.
      </p>
    </PixelCollapsible>
  );
}

export function Tones() {
  return (
    <div className="flex flex-col gap-3">
      <PixelCollapsible label="Cyan section" tone="cyan">
        <p className="text-xs text-retro-muted">Cyan-tinted toggle.</p>
      </PixelCollapsible>
      <PixelCollapsible label="Green section" tone="green">
        <p className="text-xs text-retro-muted">Green-tinted toggle.</p>
      </PixelCollapsible>
      <PixelCollapsible label="Gold section" tone="gold">
        <p className="text-xs text-retro-muted">Gold-tinted toggle.</p>
      </PixelCollapsible>
      <PixelCollapsible label="Red section" tone="red">
        <p className="text-xs text-retro-muted">Red-tinted toggle.</p>
      </PixelCollapsible>
      <PixelCollapsible label="Purple section" tone="purple">
        <p className="text-xs text-retro-muted">Purple-tinted toggle.</p>
      </PixelCollapsible>
      <PixelCollapsible label="Pink section" tone="pink">
        <p className="text-xs text-retro-muted">Pink-tinted toggle.</p>
      </PixelCollapsible>
      <PixelCollapsible label="Neutral section" tone="neutral">
        <p className="text-xs text-retro-muted">Neutral-tinted toggle.</p>
      </PixelCollapsible>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelCollapsible label="Pixel surface" surface="pixel">
        <p className="text-xs text-retro-muted">Retro pixel typography.</p>
      </PixelCollapsible>
      <PixelCollapsible label="Linear surface" surface="linear">
        <p className="text-xs text-retro-muted">Smoother linear surface.</p>
      </PixelCollapsible>
    </div>
  );
}

export function RichContent() {
  return (
    <PixelCollapsible label="Release notes" tone="cyan" defaultOpen>
      <ul className="list-disc pl-4 text-xs text-retro-muted">
        <li>Added tone-aware chevron header</li>
        <li>Surface-aware typography (pixel vs linear)</li>
        <li>Toggle state preserved on re-render</li>
      </ul>
    </PixelCollapsible>
  );
}
