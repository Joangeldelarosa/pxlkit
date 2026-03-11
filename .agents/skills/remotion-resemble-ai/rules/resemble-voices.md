---
name: resemble-voices
description: Listing, selecting, and managing Resemble.ai voices
metadata:
  tags: resemble, voices, voice-selection, voice-cloning, tts
---

# Working with Resemble.ai Voices

Resemble.ai provides various voice options including pre-built library voices and custom cloned voices.

## Listing Available Voices

```typescript
// src/resemble/voices.ts
import { resembleConfig } from './client';

interface Voice {
  uuid: string;
  name: string;
  status: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface VoicesResponse {
  success: boolean;
  page: number;
  num_pages: number;
  page_size: number;
  items: Voice[];
}

export async function listVoices(
  page: number = 1,
  pageSize: number = 100
): Promise<VoicesResponse> {
  const url = new URL('https://app.resemble.ai/api/v2/voices');
  url.searchParams.set('page', page.toString());
  url.searchParams.set('page_size', pageSize.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Token token=${resembleConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list voices: ${response.status}`);
  }

  return response.json();
}
```

## Get All Voices with Pagination

```typescript
// src/resemble/voices.ts
export async function getAllVoices(): Promise<Voice[]> {
  const allVoices: Voice[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await listVoices(page, 100);
    allVoices.push(...response.items);

    hasMore = page < response.num_pages;
    page++;
  }

  return allVoices;
}
```

## Find Voice by Name

```typescript
// src/resemble/voices.ts
export async function findVoiceByName(name: string): Promise<Voice | null> {
  const voices = await getAllVoices();
  return voices.find(v =>
    v.name.toLowerCase() === name.toLowerCase()
  ) || null;
}
```

## Voice Selection Utility

```typescript
// src/resemble/voices.ts
interface VoiceConfig {
  voiceUuid: string;
  voiceName: string;
}

// Store commonly used voices
const VOICE_PRESETS: Record<string, VoiceConfig> = {
  narrator: {
    voiceUuid: 'your-narrator-uuid',
    voiceName: 'Professional Narrator',
  },
  casual: {
    voiceUuid: 'your-casual-uuid',
    voiceName: 'Casual Voice',
  },
  announcer: {
    voiceUuid: 'your-announcer-uuid',
    voiceName: 'Announcer Voice',
  },
};

export function getVoicePreset(preset: keyof typeof VOICE_PRESETS): VoiceConfig {
  const voice = VOICE_PRESETS[preset];
  if (!voice) {
    throw new Error(`Unknown voice preset: ${preset}`);
  }
  return voice;
}

export function getVoiceUuid(preset: keyof typeof VOICE_PRESETS): string {
  return getVoicePreset(preset).voiceUuid;
}
```

## CLI Script to List Voices

```typescript
// scripts/list-voices.ts
import 'dotenv/config';
import { getAllVoices } from '../src/resemble/voices';

async function main() {
  console.log('Fetching voices from Resemble.ai...\n');

  const voices = await getAllVoices();

  console.log(`Found ${voices.length} voices:\n`);

  for (const voice of voices) {
    console.log(`Name: ${voice.name}`);
    console.log(`UUID: ${voice.uuid}`);
    console.log(`Status: ${voice.status}`);
    console.log(`Created: ${voice.created_at}`);
    console.log('---');
  }
}

main().catch(console.error);
```

Run with:

```bash
npx tsx scripts/list-voices.ts
```

## Pre-built Library Voices

Resemble.ai offers pre-built voices that are ready to use. These are particularly useful for:

- Quick prototyping
- Standard narration needs
- Multi-language support

To use a pre-built voice:

1. Browse the voice library in your Resemble.ai dashboard
2. Copy the voice UUID
3. Use it directly in your synthesis calls

## Custom Voice Cloning

For custom voices, you'll need to:

1. Upload voice samples through the Resemble.ai dashboard
2. Wait for the voice to be trained
3. Use the generated UUID in your code

Note: Voice cloning features and quality depend on your Resemble.ai plan.

## Voice Caching

Cache voice information to reduce API calls:

```typescript
// src/resemble/voice-cache.ts
import { getAllVoices } from './voices';

let voiceCache: Map<string, Voice> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function getCachedVoice(uuid: string): Promise<Voice | null> {
  const now = Date.now();

  if (!voiceCache || now - cacheTimestamp > CACHE_TTL) {
    const voices = await getAllVoices();
    voiceCache = new Map(voices.map(v => [v.uuid, v]));
    cacheTimestamp = now;
  }

  return voiceCache.get(uuid) || null;
}

export function clearVoiceCache(): void {
  voiceCache = null;
  cacheTimestamp = 0;
}
```
