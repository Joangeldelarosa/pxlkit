import { useState } from 'react';
import { PixelSegmented } from './PixelSegmented';

const VIEWS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
];

export function Default() {
  const [value, setValue] = useState('grid');
  return (
    <PixelSegmented
      label="View"
      value={value}
      options={VIEWS}
      onChange={setValue}
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('list');
  return (
    <div className="space-y-2">
      <PixelSegmented
        label="Active view"
        value={value}
        options={VIEWS}
        onChange={setValue}
        tone="cyan"
      />
      <p className="text-xs text-retro-muted">Picked: {value}</p>
    </div>
  );
}

export function Tones() {
  const [value, setValue] = useState('grid');
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <PixelSegmented label="Neutral" tone="neutral" value={value} options={VIEWS} onChange={setValue} />
      <PixelSegmented label="Green" tone="green" value={value} options={VIEWS} onChange={setValue} />
      <PixelSegmented label="Cyan" tone="cyan" value={value} options={VIEWS} onChange={setValue} />
      <PixelSegmented label="Gold" tone="gold" value={value} options={VIEWS} onChange={setValue} />
      <PixelSegmented label="Red" tone="red" value={value} options={VIEWS} onChange={setValue} />
      <PixelSegmented label="Purple" tone="purple" value={value} options={VIEWS} onChange={setValue} />
      <PixelSegmented label="Pink" tone="pink" value={value} options={VIEWS} onChange={setValue} />
    </div>
  );
}

export function Surfaces() {
  const [pixel, setPixel] = useState('grid');
  const [linear, setLinear] = useState('grid');
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <PixelSegmented
        label="Pixel surface"
        surface="pixel"
        value={pixel}
        options={VIEWS}
        onChange={setPixel}
      />
      <PixelSegmented
        label="Linear surface"
        surface="linear"
        value={linear}
        options={VIEWS}
        onChange={setLinear}
      />
    </div>
  );
}

export function Disabled() {
  return (
    <PixelSegmented
      label="View (locked)"
      value="grid"
      options={VIEWS}
      onChange={() => {}}
      disabled
    />
  );
}

export function Required() {
  const [value, setValue] = useState('grid');
  return (
    <PixelSegmented
      label="Choose a view"
      value={value}
      options={VIEWS}
      onChange={setValue}
      required
    />
  );
}

export function WithFormName() {
  const [value, setValue] = useState('grid');
  return (
    <form>
      <PixelSegmented
        label="View"
        name="view"
        value={value}
        options={VIEWS}
        onChange={setValue}
        required
      />
    </form>
  );
}
