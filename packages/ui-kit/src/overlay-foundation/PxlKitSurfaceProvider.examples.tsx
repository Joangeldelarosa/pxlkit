import { PixelButton } from '../actions';
import { PxlKitSurfaceProvider } from './PxlKitSurfaceProvider';

export function Default() {
  return (
    <PxlKitSurfaceProvider surface="pixel">
      <div className="flex flex-wrap gap-2">
        <PixelButton>Pixel</PixelButton>
        <PixelButton variant="outline" tone="cyan">Pixel outline</PixelButton>
      </div>
    </PxlKitSurfaceProvider>
  );
}

export function Linear() {
  return (
    <PxlKitSurfaceProvider surface="linear">
      <div className="flex flex-wrap gap-2">
        <PixelButton>Linear</PixelButton>
        <PixelButton variant="outline" tone="cyan">Linear outline</PixelButton>
      </div>
    </PxlKitSurfaceProvider>
  );
}

export function Override() {
  return (
    <PxlKitSurfaceProvider surface="linear">
      <div className="flex flex-wrap gap-2">
        <PixelButton>From the provider</PixelButton>
        <PixelButton surface="pixel">Own surface prop</PixelButton>
      </div>
    </PxlKitSurfaceProvider>
  );
}
