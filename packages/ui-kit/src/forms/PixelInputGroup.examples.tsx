import { PixelInputGroup } from './PixelInputGroup';

export function Default() {
  return (
    <PixelInputGroup aria-label="Website URL">
      <input defaultValue="https://" className="bg-transparent px-2 outline-none" />
      <input defaultValue="pxlkit" className="bg-transparent px-2 outline-none" />
      <input defaultValue=".xyz" className="bg-transparent px-2 outline-none" />
    </PixelInputGroup>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <PixelInputGroup size="sm" aria-label="Small group">
        <input defaultValue="small" className="bg-transparent px-2 outline-none" />
        <input defaultValue="size" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
      <PixelInputGroup size="md" aria-label="Medium group">
        <input defaultValue="medium" className="bg-transparent px-2 outline-none" />
        <input defaultValue="size" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
      <PixelInputGroup size="lg" aria-label="Large group">
        <input defaultValue="large" className="bg-transparent px-2 outline-none" />
        <input defaultValue="size" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelInputGroup surface="pixel" aria-label="Pixel surface group">
        <input defaultValue="pixel" className="bg-transparent px-2 outline-none" />
        <input defaultValue="surface" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
      <PixelInputGroup surface="linear" aria-label="Linear surface group">
        <input defaultValue="linear" className="bg-transparent px-2 outline-none" />
        <input defaultValue="surface" className="bg-transparent px-2 outline-none" />
      </PixelInputGroup>
    </div>
  );
}

export function PhoneWithCountryCode() {
  return (
    <PixelInputGroup aria-label="Phone number with country code">
      <input
        defaultValue="+58"
        className="bg-transparent px-2 outline-none"
        style={{ maxWidth: '5rem' }}
      />
      <input
        placeholder="412 555 0123"
        className="bg-transparent px-2 outline-none"
      />
    </PixelInputGroup>
  );
}
