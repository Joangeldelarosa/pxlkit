---
name: resemble-sync-tts
description: Synchronous text-to-speech generation using Resemble.ai
metadata:
  tags: resemble, tts, synchronous, audio, speech, synthesis
---

# Synchronous Text-to-Speech

The synchronous endpoint processes the entire input and returns a complete audio file. This is ideal for video production where you need the full audio before rendering.

## Endpoint

`POST https://f.cluster.resemble.ai/synthesize`

## Basic Usage

```typescript
// src/resemble/synthesize.ts
import { writeFileSync } from 'fs';
import { join } from 'path';
import { resembleConfig } from './client';
import type { SynthesizeRequest, SynthesizeResponse } from './types';

export async function synthesizeSpeech(
  text: string,
  voiceUuid: string,
  options: Partial<SynthesizeRequest> = {}
): Promise<SynthesizeResponse> {
  const response = await fetch(`${resembleConfig.baseUrl}/synthesize`, {
    method: 'POST',
    headers: {
      'Authorization': resembleConfig.apiKey,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    },
    body: JSON.stringify({
      voice_uuid: voiceUuid,
      data: text,
      sample_rate: 48000,
      output_format: 'wav',
      ...options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Synthesis failed: ${response.status}`);
  }

  return response.json();
}
```

## Saving Audio to File

```typescript
// src/resemble/synthesize.ts
export async function generateAudioFile(
  text: string,
  voiceUuid: string,
  outputPath: string,
  options: Partial<SynthesizeRequest> = {}
): Promise<{ filePath: string; duration: number; timestamps: AudioTimestamps }> {
  const result = await synthesizeSpeech(text, voiceUuid, options);

  if (!result.success) {
    throw new Error(`Synthesis failed: ${result.issues.join(', ')}`);
  }

  // Decode base64 audio content
  const audioBuffer = Buffer.from(result.audio_content, 'base64');

  // Write to file
  writeFileSync(outputPath, audioBuffer);

  return {
    filePath: outputPath,
    duration: result.duration,
    timestamps: result.audio_timestamps,
  };
}
```

## Complete Example: Generate Voiceover Script

```typescript
// scripts/generate-voiceover.ts
import 'dotenv/config';
import { join } from 'path';
import { generateAudioFile } from '../src/resemble/synthesize';

const VOICE_UUID = '55592656'; // Replace with your voice UUID

async function main() {
  const script = `
    Welcome to our product demo.
    Today we'll show you how easy it is to get started.
    Let's dive in!
  `.trim();

  console.log('Generating voiceover...');

  const { filePath, duration, timestamps } = await generateAudioFile(
    script,
    VOICE_UUID,
    join(process.cwd(), 'public', 'audio', 'voiceover.wav'),
    {
      sample_rate: 48000,
      output_format: 'wav',
      use_hd: true, // Higher quality
    }
  );

  console.log(`Audio saved to: ${filePath}`);
  console.log(`Duration: ${duration} seconds`);
  console.log(`Timestamps:`, timestamps);
}

main().catch(console.error);
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `voice_uuid` | string | Yes | Voice to synthesize |
| `data` | string | Yes | Text or SSML (max 2,000 chars) |
| `sample_rate` | number | No | 8000-48000 (default: 48000) |
| `output_format` | string | No | `wav` or `mp3` (default: wav) |
| `precision` | string | No | `PCM_16`, `PCM_24`, `PCM_32` |
| `use_hd` | boolean | No | Higher quality (default: false) |
| `model` | string | No | `chatterbox-turbo` for lower latency |

## Response Structure

```typescript
interface SynthesizeResponse {
  audio_content: string;      // Base64-encoded audio
  audio_timestamps: {
    graph_chars: string[];    // Characters
    graph_times: [number, number][]; // [start, end] in seconds
    phon_chars: string[];
    phon_times: [number, number][];
  };
  duration: number;           // Total duration in seconds
  success: boolean;
  issues: string[];           // Any warnings or issues
  sample_rate: number;
  output_format: string;
}
```

## Using SSML for Advanced Control

Resemble.ai supports SSML tags for fine-grained control:

```typescript
const ssmlText = `
<speak>
  <prosody rate="slow">Welcome</prosody> to our demo.
  <break time="500ms"/>
  Let's get started!
</speak>
`;

await generateAudioFile(ssmlText, VOICE_UUID, outputPath);
```

## Error Handling

```typescript
export async function synthesizeSpeechSafe(
  text: string,
  voiceUuid: string,
  options: Partial<SynthesizeRequest> = {}
): Promise<SynthesizeResponse | null> {
  try {
    // Check text length
    if (text.length > 2000) {
      console.error('Text exceeds 2000 character limit');
      return null;
    }

    const result = await synthesizeSpeech(text, voiceUuid, options);

    if (!result.success) {
      console.error('Synthesis issues:', result.issues);
    }

    return result;
  } catch (error) {
    console.error('Synthesis error:', error);
    return null;
  }
}
```

## Batch Generation for Multiple Segments

```typescript
interface Segment {
  id: string;
  text: string;
}

export async function generateSegments(
  segments: Segment[],
  voiceUuid: string,
  outputDir: string
): Promise<Map<string, { path: string; duration: number }>> {
  const results = new Map();

  for (const segment of segments) {
    const outputPath = join(outputDir, `${segment.id}.wav`);

    const { filePath, duration } = await generateAudioFile(
      segment.text,
      voiceUuid,
      outputPath
    );

    results.set(segment.id, { path: filePath, duration });

    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

// Usage
const segments = [
  { id: 'intro', text: 'Welcome to our video.' },
  { id: 'feature1', text: 'Here is our first feature.' },
  { id: 'outro', text: 'Thanks for watching!' },
];

const audioMap = await generateSegments(segments, VOICE_UUID, 'public/audio');
```
