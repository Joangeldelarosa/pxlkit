import { useState } from 'react';
import { PixelBareTextarea } from './PixelBareTextarea';

export function Default() {
  return <PixelBareTextarea placeholder="Write something..." rows={4} />;
}

export function Uncontrolled() {
  return (
    <PixelBareTextarea
      defaultValue="Initial draft text"
      rows={4}
      aria-label="Notes"
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('');
  return (
    <div className="flex flex-col gap-2">
      <PixelBareTextarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type to see live updates"
        rows={4}
        aria-label="Message"
      />
      <span className="text-xs text-retro-muted">{value.length} chars</span>
    </div>
  );
}

export function Disabled() {
  return (
    <PixelBareTextarea
      disabled
      defaultValue="Cannot edit this field"
      rows={3}
      aria-label="Disabled textarea"
    />
  );
}

export function ReadOnly() {
  return (
    <PixelBareTextarea
      readOnly
      defaultValue="Read-only content for reference"
      rows={3}
      aria-label="Read-only textarea"
    />
  );
}

export function WithCustomStyling() {
  return (
    <PixelBareTextarea
      className="w-full rounded border border-retro-line bg-retro-elev p-3 font-mono text-sm text-retro-text"
      placeholder="Escape-hatch: bring your own styles"
      rows={5}
      aria-label="Custom styled textarea"
    />
  );
}

export function WithMaxLength() {
  return (
    <PixelBareTextarea
      maxLength={140}
      placeholder="Up to 140 characters"
      rows={3}
      aria-label="Short bio"
    />
  );
}

export function Required() {
  return (
    <PixelBareTextarea
      required
      placeholder="This field is required"
      rows={3}
      aria-label="Required textarea"
      aria-required="true"
    />
  );
}
