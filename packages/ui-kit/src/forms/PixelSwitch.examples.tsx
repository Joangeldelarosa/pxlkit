import { useState } from 'react';
import { PixelSwitch } from '../inputs';

export function Default() {
  const [on, setOn] = useState(false);
  return <PixelSwitch label="Enable notifications" checked={on} onChange={setOn} />;
}

export function Checked() {
  const [on, setOn] = useState(true);
  return <PixelSwitch label="Dark mode" checked={on} onChange={setOn} />;
}

export function Tones() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <PixelSwitch label="Neutral" tone="neutral" checked={on} onChange={setOn} />
      <PixelSwitch label="Green" tone="green" checked={on} onChange={setOn} />
      <PixelSwitch label="Cyan" tone="cyan" checked={on} onChange={setOn} />
      <PixelSwitch label="Gold" tone="gold" checked={on} onChange={setOn} />
      <PixelSwitch label="Red" tone="red" checked={on} onChange={setOn} />
      <PixelSwitch label="Purple" tone="purple" checked={on} onChange={setOn} />
      <PixelSwitch label="Pink" tone="pink" checked={on} onChange={setOn} />
    </div>
  );
}

export function Surfaces() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <PixelSwitch label="Pixel surface" surface="pixel" checked={a} onChange={setA} />
      <PixelSwitch label="Linear surface" surface="linear" checked={b} onChange={setB} />
    </div>
  );
}

export function Disabled() {
  return (
    <div className="flex flex-col gap-3">
      <PixelSwitch label="Disabled off" checked={false} onChange={() => {}} disabled />
      <PixelSwitch label="Disabled on" checked onChange={() => {}} disabled />
    </div>
  );
}

export function WithFormName() {
  const [on, setOn] = useState(true);
  return (
    <PixelSwitch
      label="Subscribe to newsletter"
      name="newsletter"
      value="yes"
      checked={on}
      onChange={setOn}
      required
    />
  );
}
