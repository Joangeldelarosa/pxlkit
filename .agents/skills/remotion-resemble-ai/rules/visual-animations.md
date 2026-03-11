---
name: visual-animations
description: Animation patterns and Remotion primitives for creating engaging video compositions
metadata:
  tags: remotion, animation, motion-graphics, spring, interpolate, sequence
---

# Visual Animations in Remotion

This guide covers animation patterns and Remotion primitives for creating engaging video compositions.

## Core Remotion Primitives

### interpolate — The Foundation of Animation

`interpolate` maps a value from one range to another. Use it to animate any CSS property based on the current frame.

```tsx
import { interpolate, useCurrentFrame } from 'remotion';

const MyComponent = () => {
  const frame = useCurrentFrame();

  // Fade in over first 30 frames
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Slide in from left over first 30 frames
  const translateX = interpolate(frame, [0, 30], [-100, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity, transform: `translateX(${translateX}px)` }}>
      Hello World
    </div>
  );
};
```

### spring — Natural, Bouncy Motion

`spring` creates organic, physics-based animations with overshoot and settle.

```tsx
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const BouncyElement = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 10,    // Lower = more bouncy (default: 10)
      stiffness: 100, // Higher = faster (default: 100)
      mass: 1,        // Higher = heavier feel (default: 1)
    },
  });

  return (
    <div style={{ transform: `scale(${scale})` }}>
      Bouncy!
    </div>
  );
};
```

### Spring Presets

```tsx
// Snappy, minimal bounce
const snappy = { damping: 20, stiffness: 200, mass: 0.5 };

// Bouncy, playful
const bouncy = { damping: 8, stiffness: 100, mass: 1 };

// Slow, elegant
const elegant = { damping: 15, stiffness: 50, mass: 2 };

// Quick pop
const pop = { damping: 12, stiffness: 300, mass: 0.8 };
```

### Sequence — Timing Multiple Elements

Use `Sequence` to control when elements appear and disappear.

```tsx
import { Sequence, AbsoluteFill } from 'remotion';

const MultiSceneVideo = () => {
  return (
    <AbsoluteFill>
      {/* Scene 1: frames 0-60 */}
      <Sequence from={0} durationInFrames={60}>
        <IntroScene />
      </Sequence>

      {/* Scene 2: frames 60-150 */}
      <Sequence from={60} durationInFrames={90}>
        <MainContent />
      </Sequence>

      {/* Scene 3: frames 150-180 */}
      <Sequence from={150} durationInFrames={30}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
```

---

## Common Animation Patterns

### 1. Fade In

```tsx
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return <div style={{ opacity }}>{children}</div>;
};
```

### 2. Slide In (from any direction)

```tsx
type Direction = 'left' | 'right' | 'top' | 'bottom';

const SlideIn: React.FC<{
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
}> = ({ children, direction = 'left', delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const transforms = {
    left: `translateX(${interpolate(progress, [0, 1], [-200, 0])}px)`,
    right: `translateX(${interpolate(progress, [0, 1], [200, 0])}px)`,
    top: `translateY(${interpolate(progress, [0, 1], [-200, 0])}px)`,
    bottom: `translateY(${interpolate(progress, [0, 1], [200, 0])}px)`,
  };

  return (
    <div style={{ transform: transforms[direction], opacity: progress }}>
      {children}
    </div>
  );
};
```

### 3. Scale Pop

```tsx
const ScalePop: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  return (
    <div style={{
      transform: `scale(${scale})`,
      opacity: scale,
    }}>
      {children}
    </div>
  );
};
```

### 4. Typewriter Text

```tsx
const Typewriter: React.FC<{ text: string; startFrame?: number }> = ({
  text,
  startFrame = 0
}) => {
  const frame = useCurrentFrame();

  // Show ~2 characters per frame
  const charsToShow = Math.floor((frame - startFrame) * 2);
  const displayText = text.slice(0, Math.max(0, charsToShow));

  // Blinking cursor
  const showCursor = Math.floor(frame / 15) % 2 === 0;

  return (
    <span style={{ fontFamily: 'monospace' }}>
      {displayText}
      {showCursor && <span>|</span>}
    </span>
  );
};
```

### 5. Staggered List

```tsx
const StaggeredList: React.FC<{ items: string[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((item, index) => {
        const delay = index * 5; // 5 frames between each item

        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12, stiffness: 100 },
        });

        return (
          <div
            key={index}
            style={{
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};
```

### 6. Counter Animation

```tsx
const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}> = ({ value, duration = 60, prefix = '', suffix = '' }) => {
  const frame = useCurrentFrame();

  const currentValue = Math.round(
    interpolate(frame, [0, duration], [0, value], {
      extrapolateRight: 'clamp',
    })
  );

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{currentValue.toLocaleString()}{suffix}
    </span>
  );
};

// Usage:
// <AnimatedCounter value={10000} prefix="$" />
// <AnimatedCounter value={127} suffix="%" />
```

### 7. Highlight Effect

```tsx
const Highlight: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
}> = ({ children, color = '#fde047', delay = 0 }) => {
  const frame = useCurrentFrame();

  const width = interpolate(frame, [delay, delay + 15], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '30%',
          width: `${width}%`,
          backgroundColor: color,
          zIndex: -1,
        }}
      />
      {children}
    </span>
  );
};
```

### 8. Cursor Animation (for SaaS demos)

```tsx
const AnimatedCursor: React.FC<{
  path: Array<{ x: number; y: number; frame: number }>;
}> = ({ path }) => {
  const frame = useCurrentFrame();

  // Find current position based on frame
  let x = path[0].x;
  let y = path[0].y;

  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];

    if (frame >= current.frame && frame <= next.frame) {
      const progress = (frame - current.frame) / (next.frame - current.frame);
      x = interpolate(progress, [0, 1], [current.x, next.x]);
      y = interpolate(progress, [0, 1], [current.y, next.y]);
      break;
    } else if (frame > next.frame) {
      x = next.x;
      y = next.y;
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 20,
        height: 20,
        pointerEvents: 'none',
      }}
    >
      {/* Cursor SVG */}
      <svg viewBox="0 0 24 24" fill="black">
        <path d="M4 4l16 8-7 2-2 7z" />
      </svg>
    </div>
  );
};
```

### 9. Click Ripple Effect

```tsx
const ClickRipple: React.FC<{ x: number; y: number; startFrame: number }> = ({
  x,
  y,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0 || localFrame > 30) return null;

  const scale = interpolate(localFrame, [0, 30], [0, 3]);
  const opacity = interpolate(localFrame, [0, 30], [0.6, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 25,
        top: y - 25,
        width: 50,
        height: 50,
        borderRadius: '50%',
        border: '3px solid #3b82f6',
        transform: `scale(${scale})`,
        opacity,
      }}
    />
  );
};
```

---

## Scene Transitions

### Cross Fade

```tsx
const CrossFade: React.FC<{
  scene1: React.ReactNode;
  scene2: React.ReactNode;
  transitionFrame: number;
  duration?: number;
}> = ({ scene1, scene2, transitionFrame, duration = 15 }) => {
  const frame = useCurrentFrame();

  const opacity1 = interpolate(
    frame,
    [transitionFrame, transitionFrame + duration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity2 = interpolate(
    frame,
    [transitionFrame, transitionFrame + duration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <>
      <AbsoluteFill style={{ opacity: opacity1 }}>{scene1}</AbsoluteFill>
      <AbsoluteFill style={{ opacity: opacity2 }}>{scene2}</AbsoluteFill>
    </>
  );
};
```

### Slide Transition

```tsx
const SlideTransition: React.FC<{
  scene1: React.ReactNode;
  scene2: React.ReactNode;
  transitionFrame: number;
  direction?: 'left' | 'right';
}> = ({ scene1, scene2, transitionFrame, direction = 'left' }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const multiplier = direction === 'left' ? -1 : 1;

  const offset = interpolate(
    frame,
    [transitionFrame, transitionFrame + 20],
    [0, width * multiplier],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <>
      <AbsoluteFill style={{ transform: `translateX(${offset}px)` }}>
        {scene1}
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${offset - width * multiplier}px)` }}>
        {scene2}
      </AbsoluteFill>
    </>
  );
};
```

---

## Syncing Animations to Audio

### Using Audio Timestamps

When Resemble.ai returns timestamps, use them to trigger animations:

```tsx
interface Word {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

const SyncedCaptions: React.FC<{ words: Word[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find the current word being spoken
  const currentWordIndex = words.findIndex(
    (word) => currentTime >= word.start && currentTime <= word.end
  );

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {words.map((word, index) => {
        const isActive = index === currentWordIndex;
        const isPast = currentTime > word.end;

        return (
          <span
            key={index}
            style={{
              opacity: isPast || isActive ? 1 : 0.3,
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              color: isActive ? '#3b82f6' : 'white',
              transition: 'all 0.1s',
            }}
          >
            {word.word}
          </span>
        );
      })}
    </div>
  );
};
```

### Triggering Scene Changes on Script Segments

```tsx
interface Segment {
  text: string;
  startTime: number;
  endTime: number;
  scene: 'intro' | 'main' | 'outro';
}

const ScriptDrivenVideo: React.FC<{ segments: Segment[] }> = ({ segments }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const currentSegment = segments.find(
    (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
  );

  return (
    <AbsoluteFill>
      {currentSegment?.scene === 'intro' && <IntroScene />}
      {currentSegment?.scene === 'main' && <MainScene />}
      {currentSegment?.scene === 'outro' && <OutroScene />}
    </AbsoluteFill>
  );
};
```

---

## Performance Tips

1. **Avoid re-renders:** Use `useMemo` for expensive calculations
2. **Use `staticFile`:** For assets in the `/public` folder
3. **Limit springs:** Too many concurrent springs can slow rendering
4. **Use `extrapolateRight: 'clamp'`:** Prevents values from going out of bounds
5. **Test at lower resolution first:** Use `--scale` flag when rendering

```bash
# Render at half resolution for testing
npx remotion render MyComp out.mp4 --scale=0.5
```
