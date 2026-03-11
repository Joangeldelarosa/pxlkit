---
name: resemble-streaming-tts
description: Streaming text-to-speech generation for longer content
metadata:
  tags: resemble, tts, streaming, audio, speech, http
---

# Streaming Text-to-Speech

Use streaming for longer scripts where you want to start processing audio before synthesis completes. The response is chunked WAV data.

## Endpoint

`POST https://f.cluster.resemble.ai/stream`

> **Note:** Streaming requests target dedicated synthesis hosts. Check your Resemble.ai dashboard for your specific streaming endpoint.

## Basic Streaming Implementation

```typescript
// src/resemble/stream.ts
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { resembleConfig } from './client';

interface StreamOptions {
  voice_uuid: string;
  data: string;
  precision?: 'PCM_16' | 'PCM_24' | 'PCM_32' | 'MULAW';
  sample_rate?: number;
  use_hd?: boolean;
  model?: string;
}

export async function streamSpeechToFile(
  options: StreamOptions,
  outputPath: string
): Promise<void> {
  const response = await fetch(`${resembleConfig.baseUrl}/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resembleConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      voice_uuid: options.voice_uuid,
      data: options.data,
      precision: options.precision || 'PCM_16',
      sample_rate: options.sample_rate || 48000,
      use_hd: options.use_hd || false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  // Convert web ReadableStream to Node.js Readable
  const nodeStream = Readable.fromWeb(response.body as any);
  const fileStream = createWriteStream(outputPath);

  await pipeline(nodeStream, fileStream);
}
```

## Streaming with Progress Callback

```typescript
// src/resemble/stream.ts
export async function streamSpeechWithProgress(
  options: StreamOptions,
  outputPath: string,
  onProgress?: (bytesReceived: number) => void
): Promise<{ totalBytes: number }> {
  const response = await fetch(`${resembleConfig.baseUrl}/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resembleConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      voice_uuid: options.voice_uuid,
      data: options.data,
      precision: options.precision || 'PCM_16',
      sample_rate: options.sample_rate || 48000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response reader');
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    totalBytes += value.length;

    onProgress?.(totalBytes);
  }

  // Combine all chunks
  const audioData = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    audioData.set(chunk, offset);
    offset += chunk.length;
  }

  // Write to file
  const fs = await import('fs');
  fs.writeFileSync(outputPath, audioData);

  return { totalBytes };
}
```

## Usage Example

```typescript
// scripts/stream-voiceover.ts
import { join } from 'path';
import { streamSpeechWithProgress } from '../src/resemble/stream';

const VOICE_UUID = 'your-voice-uuid';

async function main() {
  const longScript = `
    Welcome to our comprehensive tutorial.
    In this video, we'll cover everything you need to know about our platform.

    First, let's start with the basics.
    Our platform is designed to be intuitive and easy to use.

    Next, we'll explore advanced features.
    These features will help you become a power user.

    Finally, we'll wrap up with some tips and tricks.
    Thank you for watching!
  `.trim();

  console.log('Starting streaming synthesis...');

  const outputPath = join(process.cwd(), 'public', 'audio', 'tutorial.wav');

  const { totalBytes } = await streamSpeechWithProgress(
    {
      voice_uuid: VOICE_UUID,
      data: longScript,
      precision: 'PCM_16',
      sample_rate: 48000,
    },
    outputPath,
    (bytesReceived) => {
      console.log(`Received ${bytesReceived} bytes...`);
    }
  );

  console.log(`Complete! Total size: ${totalBytes} bytes`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `voice_uuid` | string | Yes | Voice to synthesize |
| `data` | string | Yes | Text or SSML (max 2,000 chars) |
| `precision` | string | No | `PCM_16`, `PCM_24`, `PCM_32`, `MULAW` |
| `sample_rate` | number | No | 8000-48000 (default: 48000) |
| `use_hd` | boolean | No | Higher quality synthesis |
| `model` | string | No | `chatterbox-turbo` for lower latency |

## When to Use Streaming vs Synchronous

| Scenario | Recommended |
|----------|-------------|
| Short text (< 500 chars) | Synchronous |
| Pre-generated video content | Synchronous |
| Need timestamps immediately | Synchronous |
| Long scripts (500-2000 chars) | Streaming |
| Progress indication needed | Streaming |
| Memory-constrained environments | Streaming |

## Error Handling

```typescript
export async function streamSpeechSafe(
  options: StreamOptions,
  outputPath: string
): Promise<boolean> {
  try {
    if (options.data.length > 2000) {
      console.error('Text exceeds 2000 character limit');
      return false;
    }

    await streamSpeechToFile(options, outputPath);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Streaming error:', error.message);
    }
    return false;
  }
}
```
