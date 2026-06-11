import { PixelColorSwatch } from './PixelColorSwatch';

export function Default() {
  return <PixelColorSwatch name="cyan" cssVar="--color-retro-cyan" />;
}

export function Palette() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
      <PixelColorSwatch name="green" cssVar="--color-retro-green" />
      <PixelColorSwatch name="cyan" cssVar="--color-retro-cyan" />
      <PixelColorSwatch name="gold" cssVar="--color-retro-gold" />
      <PixelColorSwatch name="purple" cssVar="--color-retro-purple" />
      <PixelColorSwatch name="red" cssVar="--color-retro-red" />
      <PixelColorSwatch name="pink" cssVar="--color-retro-pink" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-4">
      <PixelColorSwatch name="cyan" cssVar="--color-retro-cyan" surface="pixel" />
      <PixelColorSwatch name="cyan" cssVar="--color-retro-cyan" surface="linear" />
    </div>
  );
}

export function SurfaceTokens() {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-md">
      <PixelColorSwatch name="surface" cssVar="--color-retro-surface" />
      <PixelColorSwatch name="border" cssVar="--color-retro-border" />
      <PixelColorSwatch name="text" cssVar="--color-retro-text" />
      <PixelColorSwatch name="muted" cssVar="--color-retro-muted" />
    </div>
  );
}
