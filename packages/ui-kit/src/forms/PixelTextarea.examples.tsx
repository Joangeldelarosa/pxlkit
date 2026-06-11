import { useState } from 'react';
import { PixelTextarea } from './PixelTextarea';

export function Default() {
  return (
    <PixelTextarea
      label="Notes"
      placeholder="Write something..."
      hint="Up to 280 characters."
    />
  );
}

export function Uncontrolled() {
  return (
    <PixelTextarea
      label="Bio"
      defaultValue="Frontend engineer focused on retro UIs."
      hint="Edit freely."
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('');
  return (
    <PixelTextarea
      label="Message"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Type to see live updates..."
      hint={`${value.length} chars`}
    />
  );
}

export function Tones() {
  return (
    <div className="flex flex-col gap-3">
      <PixelTextarea label="Neutral" tone="neutral" defaultValue="Neutral tone" />
      <PixelTextarea label="Green" tone="green" defaultValue="Green tone" />
      <PixelTextarea label="Cyan" tone="cyan" defaultValue="Cyan tone" />
      <PixelTextarea label="Gold" tone="gold" defaultValue="Gold tone" />
      <PixelTextarea label="Red" tone="red" defaultValue="Red tone" />
      <PixelTextarea label="Purple" tone="purple" defaultValue="Purple tone" />
      <PixelTextarea label="Pink" tone="pink" defaultValue="Pink tone" />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelTextarea label="Pixel surface" surface="pixel" defaultValue="Chunky pixel chrome" />
      <PixelTextarea label="Linear surface" surface="linear" defaultValue="Sleek linear chrome" />
    </div>
  );
}

export function WithError() {
  return (
    <PixelTextarea
      label="Feedback"
      defaultValue=""
      error="Feedback is required."
      placeholder="Tell us what went wrong..."
    />
  );
}

export function Disabled() {
  return (
    <PixelTextarea
      label="Locked notes"
      disabled
      defaultValue="Cannot edit this field"
    />
  );
}

export function Autosize() {
  const [value, setValue] = useState(
    'Type more lines to watch this grow.\nIt will expand between minRows and maxRows.',
  );
  return (
    <PixelTextarea
      label="Auto-grow"
      autosize
      minRows={2}
      maxRows={8}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export function WithCharCount() {
  const [value, setValue] = useState('Short blurb');
  return (
    <PixelTextarea
      label="Short bio"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      showCount={{ max: 140 }}
      placeholder="Up to 140 characters"
    />
  );
}

export function Required() {
  return (
    <PixelTextarea
      label="Required"
      required
      placeholder="This field is required"
      hint="Don't leave it blank."
    />
  );
}
