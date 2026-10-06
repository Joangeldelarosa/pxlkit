import { PixelGlitch } from './PixelGlitch';

export function Default() {
  return (
    <PixelGlitch>
      <span className="text-2xl font-bold">SYSTEM ONLINE</span>
    </PixelGlitch>
  );
}

export function HighIntensity() {
  return (
    <PixelGlitch intensity={8} duration={2000}>
      <span className="text-2xl font-bold">CRITICAL ERROR</span>
    </PixelGlitch>
  );
}

export function HoverTrigger() {
  return (
    <PixelGlitch trigger="hover">
      <span className="text-2xl font-bold">HOVER ME</span>
    </PixelGlitch>
  );
}

export function HeadingLabel() {
  return (
    <h2 className="text-2xl font-bold">
      <PixelGlitch as="span" label="SIGNAL LOST" />
    </h2>
  );
}
