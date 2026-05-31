import { PixelProgress } from '../feedback';

export function Default() {
  return <PixelProgress value={60} label="HP" />;
}

export function Tones() {
  return (
    <div className="space-y-3">
      <PixelProgress value={70} tone="neutral" label="Neutral" />
      <PixelProgress value={70} tone="green" label="Green" />
      <PixelProgress value={70} tone="cyan" label="Cyan" />
      <PixelProgress value={70} tone="gold" label="Gold" />
      <PixelProgress value={70} tone="red" label="Red" />
      <PixelProgress value={70} tone="purple" label="Purple" />
      <PixelProgress value={70} tone="pink" label="Pink" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="space-y-4">
      <PixelProgress value={55} label="Pixel (segmented)" surface="pixel" />
      <PixelProgress value={55} label="Linear (smooth)" surface="linear" />
    </div>
  );
}

export function WithoutValue() {
  return <PixelProgress value={45} label="Loading assets" showValue={false} />;
}

export function WithoutLabel() {
  return <PixelProgress value={80} />;
}

export function Indeterminate() {
  return <PixelProgress value={0} label="Working…" indeterminate />;
}

export function Clamped() {
  return (
    <div className="space-y-3">
      <PixelProgress value={-25} label="Below 0 (clamped to 0)" />
      <PixelProgress value={150} label="Above 100 (clamped to 100)" />
    </div>
  );
}

export function Steps() {
  return (
    <div className="space-y-3">
      <PixelProgress value={0} label="0%" />
      <PixelProgress value={25} label="25%" />
      <PixelProgress value={50} label="50%" />
      <PixelProgress value={75} label="75%" />
      <PixelProgress value={100} label="100%" />
    </div>
  );
}
