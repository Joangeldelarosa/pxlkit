import { useState } from 'react';
import { PixelToggle } from './PixelToggle';

export function Default() {
  const [pressed, setPressed] = useState(false);
  return (
    <PixelToggle value="bold" pressed={pressed} onPressedChange={setPressed}>
      Bold
    </PixelToggle>
  );
}

export function Pressed() {
  const [pressed, setPressed] = useState(true);
  return (
    <PixelToggle value="italic" pressed={pressed} onPressedChange={setPressed}>
      Italic
    </PixelToggle>
  );
}

export function Surfaces() {
  const [pixel, setPixel] = useState(true);
  const [linear, setLinear] = useState(true);
  return (
    <div className="flex items-center gap-2">
      <PixelToggle
        value="pixel"
        surface="pixel"
        pressed={pixel}
        onPressedChange={setPixel}
      >
        Pixel
      </PixelToggle>
      <PixelToggle
        value="linear"
        surface="linear"
        pressed={linear}
        onPressedChange={setLinear}
      >
        Linear
      </PixelToggle>
    </div>
  );
}

export function Disabled() {
  return (
    <div className="flex items-center gap-2">
      <PixelToggle value="off" disabled pressed={false} onPressedChange={() => {}}>
        Disabled off
      </PixelToggle>
      <PixelToggle value="on" disabled pressed={true} onPressedChange={() => {}}>
        Disabled on
      </PixelToggle>
    </div>
  );
}
