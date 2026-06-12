import { PixelInputGroup } from './PixelInputGroup';

export function Default() {
  return (
    <PixelInputGroup aria-label="Website URL">
      <input aria-label="Protocol" defaultValue="https://" className="bg-transparent px-2 outline-none" />
      <input aria-label="Domain name" defaultValue="pxlkit" className="bg-transparent px-2 outline-none" />
      <input aria-label="Top-level domain" defaultValue=".xyz" className="bg-transparent px-2 outline-none" />
    </PixelInputGroup>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <PixelInputGroup size="sm" aria-label="Small group">
        <input aria-label="First segment" defaultValue="small" className="bg-transparent px-2 outline-none" />
        <input aria-label="Second segment" defaultValue="size" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
      <PixelInputGroup size="md" aria-label="Medium group">
        <input aria-label="First segment" defaultValue="medium" className="bg-transparent px-2 outline-none" />
        <input aria-label="Second segment" defaultValue="size" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
      <PixelInputGroup size="lg" aria-label="Large group">
        <input aria-label="First segment" defaultValue="large" className="bg-transparent px-2 outline-none" />
        <input aria-label="Second segment" defaultValue="size" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelInputGroup surface="pixel" aria-label="Pixel surface group">
        <input aria-label="First segment" defaultValue="pixel" className="bg-transparent px-2 outline-none" />
        <input aria-label="Second segment" defaultValue="surface" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
      <PixelInputGroup surface="linear" aria-label="Linear surface group">
        <input aria-label="First segment" defaultValue="linear" className="bg-transparent px-2 outline-none" />
        <input aria-label="Second segment" defaultValue="surface" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
    </div>
  );
}

export function PhoneWithCountryCode() {
  return (
    <PixelInputGroup aria-label="Phone number with country code">
      <input
        aria-label="Country code"
        defaultValue="+58"
        className="bg-transparent px-2 outline-none"
        style={{ maxWidth: '5rem' }}
      />
      <input
        aria-label="Phone number"
        placeholder="412 555 0123"
        className="bg-transparent px-2 outline-none"
      />
    </PixelInputGroup>
  );
}
