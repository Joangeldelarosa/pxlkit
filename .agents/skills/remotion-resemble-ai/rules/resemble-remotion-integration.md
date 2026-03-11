---
name: resemble-remotion-integration
description: Integrating Resemble.ai generated audio into Remotion compositions
metadata:
  tags: resemble, remotion, audio, integration, composition, video
---

# Integrating Resemble.ai with Remotion

This guide shows how to combine Resemble.ai generated voiceovers with Remotion video compositions.

> **Note:** By default, generate audio only without processing timestamps. Captions/word timestamps are an opt-in feature - only implement them when the user explicitly requests captions, subtitles, or word highlighting.

## Prerequisites

Install Remotion media package:

```bash
npx remotion add @remotion/media
```

## Basic Integration

### 1. Generate Audio File

First, generate your voiceover using the sync API:

```typescript
// scripts/generate-audio.ts
import 'dotenv/config';
import { join } from 'path';
import { generateAudioFile } from '../src/resemble/synthesize';

const VOICE_UUID = process.env.RESEMBLE_VOICE_UUID!;

async function generateVoiceover() {
  const script = 'Welcome to our product demo. Let me show you around.';

  const { filePath, duration, timestamps } = await generateAudioFile(
    script,
    VOICE_UUID,
    join(process.cwd(), 'public', 'audio', 'voiceover.wav')
  );

  // Save metadata for use in Remotion
  const metadata = {
    audioPath: 'audio/voiceover.wav',
    duration,
    fps: 30,
    durationInFrames: Math.ceil(duration * 30),
  };

  const fs = await import('fs');
  fs.writeFileSync(
    join(process.cwd(), 'src', 'video-config.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('Generated audio and metadata');
}

generateVoiceover().catch(console.error);
```

### 2. Create Remotion Composition

```tsx
// src/compositions/VoiceoverDemo.tsx
import { Audio } from '@remotion/media';
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

interface VoiceoverDemoProps {
  audioPath: string;
}

export const VoiceoverDemo: React.FC<VoiceoverDemoProps> = ({ audioPath }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      {/* Your visual content */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            color: 'white',
            fontSize: 72,
            fontFamily: 'sans-serif',
          }}
        >
          Product Demo
        </h1>
      </AbsoluteFill>

      {/* Resemble.ai generated audio */}
      <Audio src={staticFile(audioPath)} />
    </AbsoluteFill>
  );
};
```

### 3. Register Composition

```tsx
// src/Root.tsx
import { Composition } from 'remotion';
import { VoiceoverDemo } from './compositions/VoiceoverDemo';

// Import generated metadata
import videoConfig from './video-config.json';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VoiceoverDemo"
        component={VoiceoverDemo}
        durationInFrames={videoConfig.durationInFrames}
        fps={videoConfig.fps}
        width={1920}
        height={1080}
        defaultProps={{
          audioPath: videoConfig.audioPath,
        }}
      />
    </>
  );
};
```

## Dynamic Duration Based on Audio

Use `calculateMetadata` to set composition duration based on audio:

```tsx
// src/compositions/DynamicVoiceover.tsx
import { Audio } from '@remotion/media';
import { AbsoluteFill, staticFile, CalculateMetadataFunction } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media';

interface Props {
  script: string;
  audioPath: string;
}

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  // Get audio duration from generated file
  const audioDuration = await getAudioDurationInSeconds(
    staticFile(props.audioPath)
  );

  const fps = 30;

  return {
    fps,
    durationInFrames: Math.ceil(audioDuration * fps) + 30, // Add 1 second padding
    width: 1920,
    height: 1080,
  };
};

export const DynamicVoiceover: React.FC<Props> = ({ audioPath }) => {
  return (
    <AbsoluteFill>
      {/* Visual content */}
      <Audio src={staticFile(audioPath)} />
    </AbsoluteFill>
  );
};
```

## Multi-Segment Composition

For videos with multiple voiceover segments:

```tsx
// src/compositions/MultiSegmentVideo.tsx
import { Audio } from '@remotion/media';
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useVideoConfig,
} from 'remotion';

interface Segment {
  id: string;
  audioPath: string;
  startFrame: number;
  durationFrames: number;
  title: string;
}

interface Props {
  segments: Segment[];
}

export const MultiSegmentVideo: React.FC<Props> = ({ segments }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f0f23' }}>
      {segments.map((segment) => (
        <Sequence
          key={segment.id}
          from={segment.startFrame}
          durationInFrames={segment.durationFrames}
        >
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                color: 'white',
                fontSize: 48,
                fontFamily: 'sans-serif',
              }}
            >
              {segment.title}
            </h2>
          </AbsoluteFill>

          <Audio src={staticFile(segment.audioPath)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
```

## Audio with Volume Control

Fade in/out the voiceover:

```tsx
import { Audio } from '@remotion/media';
import { interpolate, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';

export const VoiceoverWithFade: React.FC<{ audioPath: string }> = ({ audioPath }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in over first second, fade out over last second
  const volume = interpolate(
    frame,
    [0, fps, durationInFrames - fps, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return <Audio src={staticFile(audioPath)} volume={volume} />;
};
```

## Combining with Background Music

```tsx
import { Audio } from '@remotion/media';
import { staticFile, AbsoluteFill } from 'remotion';

interface Props {
  voiceoverPath: string;
  musicPath: string;
}

export const VoiceoverWithMusic: React.FC<Props> = ({
  voiceoverPath,
  musicPath,
}) => {
  return (
    <AbsoluteFill>
      {/* Background music at lower volume */}
      <Audio src={staticFile(musicPath)} volume={0.2} loop />

      {/* Voiceover at full volume */}
      <Audio src={staticFile(voiceoverPath)} volume={1} />

      {/* Visual content */}
    </AbsoluteFill>
  );
};
```

## Rendering the Final Video

```bash
# Preview in browser
npx remotion studio

# Render to file
npx remotion render VoiceoverDemo out/video.mp4

# Render with specific codec
npx remotion render VoiceoverDemo out/video.mp4 --codec h264
```
