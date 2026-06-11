import { useState } from 'react';
import { PixelSlider } from './PixelSlider';

export function Default() {
  const [value, setValue] = useState(40);
  return (
    <PixelSlider
      label="Volume"
      value={value}
      onChange={setValue}
    />
  );
}

export function Range() {
  const [value, setValue] = useState<[number, number]>([20, 80]);
  return (
    <PixelSlider
      label="Price range"
      value={value}
      onChange={setValue}
    />
  );
}

export function Tones() {
  const [neutral, setNeutral] = useState(40);
  const [green, setGreen] = useState(50);
  const [cyan, setCyan] = useState(60);
  const [gold, setGold] = useState(70);
  const [red, setRed] = useState(30);
  const [purple, setPurple] = useState(45);
  const [pink, setPink] = useState(55);
  return (
    <div className="space-y-4">
      <PixelSlider label="Neutral" tone="neutral" value={neutral} onChange={setNeutral} />
      <PixelSlider label="Green" tone="green" value={green} onChange={setGreen} />
      <PixelSlider label="Cyan" tone="cyan" value={cyan} onChange={setCyan} />
      <PixelSlider label="Gold" tone="gold" value={gold} onChange={setGold} />
      <PixelSlider label="Red" tone="red" value={red} onChange={setRed} />
      <PixelSlider label="Purple" tone="purple" value={purple} onChange={setPurple} />
      <PixelSlider label="Pink" tone="pink" value={pink} onChange={setPink} />
    </div>
  );
}

export function Surfaces() {
  const [pixel, setPixel] = useState(40);
  const [linear, setLinear] = useState(60);
  return (
    <div className="space-y-4">
      <PixelSlider label="Pixel surface" surface="pixel" value={pixel} onChange={setPixel} />
      <PixelSlider label="Linear surface" surface="linear" value={linear} onChange={setLinear} />
    </div>
  );
}

export function WithMinMax() {
  const [value, setValue] = useState(75);
  return (
    <PixelSlider
      label="Brightness"
      min={0}
      max={200}
      step={5}
      showMinMax
      value={value}
      onChange={setValue}
    />
  );
}

export function WithMarks() {
  const [value, setValue] = useState(50);
  return (
    <PixelSlider
      label="Quality"
      value={value}
      onChange={setValue}
      marks={[
        { value: 0, label: 'Low' },
        { value: 25, label: 'Med' },
        { value: 50, label: 'High' },
        { value: 75, label: 'Ultra' },
        { value: 100, label: 'Max' },
      ]}
    />
  );
}

export function WithTicks() {
  const [value, setValue] = useState(40);
  return (
    <PixelSlider
      label="Step ticks"
      min={0}
      max={100}
      step={10}
      ticks
      value={value}
      onChange={setValue}
    />
  );
}

export function WithTooltip() {
  const [value, setValue] = useState(60);
  return (
    <PixelSlider
      label="Always tooltip"
      value={value}
      onChange={setValue}
      showTooltip="always"
    />
  );
}

export function TooltipOnDrag() {
  const [value, setValue] = useState(35);
  return (
    <PixelSlider
      label="Drag tooltip"
      value={value}
      onChange={setValue}
      showTooltip="drag"
    />
  );
}

export function Disabled() {
  return (
    <PixelSlider
      label="Disabled"
      value={50}
      onChange={() => {}}
      disabled
    />
  );
}

export function Required() {
  const [value, setValue] = useState(30);
  return (
    <PixelSlider
      label="Required setting"
      value={value}
      onChange={setValue}
      required
      name="setting"
    />
  );
}

export function RangeWithMarks() {
  const [value, setValue] = useState<[number, number]>([30, 70]);
  return (
    <PixelSlider
      label="Filter range"
      value={value}
      onChange={setValue}
      showMinMax
      showTooltip="always"
      marks={[
        { value: 0, label: '0' },
        { value: 50, label: '50' },
        { value: 100, label: '100' },
      ]}
    />
  );
}
