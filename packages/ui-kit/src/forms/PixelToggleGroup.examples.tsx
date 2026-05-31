import { useState } from 'react';
import { PixelToggle, PixelToggleGroup } from './PixelToggleGroup';

export function Default() {
  const [value, setValue] = useState<string>('left');
  return (
    <PixelToggleGroup
      type="single"
      value={value}
      onChange={setValue}
      aria-label="Text alignment"
    >
      <PixelToggle value="left">Left</PixelToggle>
      <PixelToggle value="center">Center</PixelToggle>
      <PixelToggle value="right">Right</PixelToggle>
    </PixelToggleGroup>
  );
}

export function Multiple() {
  const [value, setValue] = useState<string[]>(['bold']);
  return (
    <PixelToggleGroup
      type="multiple"
      value={value}
      onChange={setValue}
      aria-label="Text formatting"
    >
      <PixelToggle value="bold">Bold</PixelToggle>
      <PixelToggle value="italic">Italic</PixelToggle>
      <PixelToggle value="underline">Underline</PixelToggle>
    </PixelToggleGroup>
  );
}

export function Variants() {
  const [a, setA] = useState<string>('one');
  const [b, setB] = useState<string>('one');
  const [c, setC] = useState<string>('one');
  const [d, setD] = useState<string>('one');
  return (
    <div className="space-y-3">
      <PixelToggleGroup type="single" variant="soft" value={a} onChange={setA} aria-label="Soft">
        <PixelToggle value="one">One</PixelToggle>
        <PixelToggle value="two">Two</PixelToggle>
        <PixelToggle value="three">Three</PixelToggle>
      </PixelToggleGroup>
      <PixelToggleGroup type="single" variant="solid" value={b} onChange={setB} aria-label="Solid">
        <PixelToggle value="one">One</PixelToggle>
        <PixelToggle value="two">Two</PixelToggle>
        <PixelToggle value="three">Three</PixelToggle>
      </PixelToggleGroup>
      <PixelToggleGroup type="single" variant="outline" value={c} onChange={setC} aria-label="Outline">
        <PixelToggle value="one">One</PixelToggle>
        <PixelToggle value="two">Two</PixelToggle>
        <PixelToggle value="three">Three</PixelToggle>
      </PixelToggleGroup>
      <PixelToggleGroup type="single" variant="ghost" value={d} onChange={setD} aria-label="Ghost">
        <PixelToggle value="one">One</PixelToggle>
        <PixelToggle value="two">Two</PixelToggle>
        <PixelToggle value="three">Three</PixelToggle>
      </PixelToggleGroup>
    </div>
  );
}

export function Sizes() {
  const [sm, setSm] = useState<string>('a');
  const [md, setMd] = useState<string>('a');
  const [lg, setLg] = useState<string>('a');
  return (
    <div className="space-y-3">
      <PixelToggleGroup type="single" size="sm" value={sm} onChange={setSm} aria-label="Small">
        <PixelToggle value="a">A</PixelToggle>
        <PixelToggle value="b">B</PixelToggle>
        <PixelToggle value="c">C</PixelToggle>
      </PixelToggleGroup>
      <PixelToggleGroup type="single" size="md" value={md} onChange={setMd} aria-label="Medium">
        <PixelToggle value="a">A</PixelToggle>
        <PixelToggle value="b">B</PixelToggle>
        <PixelToggle value="c">C</PixelToggle>
      </PixelToggleGroup>
      <PixelToggleGroup type="single" size="lg" value={lg} onChange={setLg} aria-label="Large">
        <PixelToggle value="a">A</PixelToggle>
        <PixelToggle value="b">B</PixelToggle>
        <PixelToggle value="c">C</PixelToggle>
      </PixelToggleGroup>
    </div>
  );
}

export function RovingFocus() {
  const [value, setValue] = useState<string>('list');
  return (
    <PixelToggleGroup
      type="single"
      rovingFocus
      loop
      value={value}
      onChange={setValue}
      aria-label="View mode"
    >
      <PixelToggle value="list">List</PixelToggle>
      <PixelToggle value="grid">Grid</PixelToggle>
      <PixelToggle value="board">Board</PixelToggle>
    </PixelToggleGroup>
  );
}

export function Surfaces() {
  const [pixel, setPixel] = useState<string>('one');
  const [linear, setLinear] = useState<string>('one');
  return (
    <div className="space-y-3">
      <PixelToggleGroup
        type="single"
        surface="pixel"
        value={pixel}
        onChange={setPixel}
        aria-label="Pixel surface"
      >
        <PixelToggle value="one">One</PixelToggle>
        <PixelToggle value="two">Two</PixelToggle>
      </PixelToggleGroup>
      <PixelToggleGroup
        type="single"
        surface="linear"
        value={linear}
        onChange={setLinear}
        aria-label="Linear surface"
      >
        <PixelToggle value="one">One</PixelToggle>
        <PixelToggle value="two">Two</PixelToggle>
      </PixelToggleGroup>
    </div>
  );
}
