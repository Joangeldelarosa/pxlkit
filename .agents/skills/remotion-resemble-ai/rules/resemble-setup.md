---
name: resemble-setup
description: Setting up Resemble.ai API credentials and project configuration
metadata:
  tags: resemble, api, setup, configuration, authentication
---

# Setting up Resemble.ai

## Credential Check (Agent Instructions)

When this skill is invoked, ALWAYS perform this check first:

### 1. Check for .env file

```bash
# Check if .env exists and has the required keys
cat .env 2>/dev/null | grep -E "^RESEMBLE_API_KEY=|^RESEMBLE_VOICE_UUID="
```

### 2. If credentials are missing, prompt the user

**Missing API Key:**
```
I need your Resemble.ai API key to generate voiceovers.

Get your API key from: https://app.resemble.ai/account/api

Please paste your Resemble.ai API key:
```

**Missing Voice UUID:**
Use the default voice UUID `7213a9ea`. Only prompt the user if they specifically want to use a different voice.

### 3. Save credentials to .env

After user provides API key, create/update .env with the default voice:

```bash
# Create .env if it doesn't exist, append if it does
echo "RESEMBLE_API_KEY=user_provided_key" >> .env
echo "RESEMBLE_VOICE_UUID=7213a9ea" >> .env  # Default voice
```

### 4. Ensure .gitignore includes .env

```bash
# Add .env to .gitignore if not present
grep -q "^\.env$" .gitignore 2>/dev/null || echo ".env" >> .gitignore
```

---

## Getting API Credentials

1. Create an account at [Resemble.ai](https://app.resemble.ai)
2. Navigate to Account > API to generate your API token
3. Store the API key securely (never commit to version control)

## Environment Configuration

Create a `.env` file in your project root:

```env
RESEMBLE_API_KEY=your_api_key_here
RESEMBLE_VOICE_UUID=7213a9ea  # Default voice, change if needed
```

Add `.env` to your `.gitignore`:

```gitignore
.env
.env.local
```

## Project Setup

Install required dependencies:

```bash
npm install dotenv
# or
bun add dotenv
```

Create a utility file for Resemble.ai API calls:

```typescript
// src/resemble/client.ts
import 'dotenv/config';

const RESEMBLE_API_KEY = process.env.RESEMBLE_API_KEY;

if (!RESEMBLE_API_KEY) {
  throw new Error('RESEMBLE_API_KEY environment variable is required');
}

export const resembleConfig = {
  apiKey: RESEMBLE_API_KEY,
  baseUrl: 'https://f.cluster.resemble.ai',
};

export async function callResembleApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${resembleConfig.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': resembleConfig.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Resemble API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
```

## Type Definitions

Create TypeScript types for Resemble.ai responses:

```typescript
// src/resemble/types.ts
export interface SynthesizeRequest {
  voice_uuid: string;
  data: string;
  project_uuid?: string;
  title?: string;
  model?: 'chatterbox-turbo' | string;
  precision?: 'MULAW' | 'PCM_16' | 'PCM_24' | 'PCM_32';
  output_format?: 'wav' | 'mp3';
  sample_rate?: 8000 | 16000 | 22050 | 32000 | 44100 | 48000;
  use_hd?: boolean;
}

export interface AudioTimestamps {
  graph_chars: string[];
  graph_times: [number, number][];
  phon_chars: string[];
  phon_times: [number, number][];
}

export interface SynthesizeResponse {
  audio_content: string; // Base64 encoded
  audio_timestamps: AudioTimestamps;
  duration: number;
  issues: string[];
  output_format: string;
  sample_rate: number;
  seed: number;
  success: boolean;
  synth_duration: number;
  title: string | null;
}

export interface Voice {
  uuid: string;
  name: string;
  // Additional voice properties
}

export interface VoicesResponse {
  success: boolean;
  page: number;
  num_pages: number;
  page_size: number;
  items: Voice[];
}
```

## Recommended Project Structure

```
your-remotion-project/
├── src/
│   ├── resemble/
│   │   ├── client.ts        # API client
│   │   ├── types.ts         # TypeScript types
│   │   ├── synthesize.ts    # TTS functions
│   │   └── voices.ts        # Voice management
│   ├── compositions/
│   │   └── MyVideo.tsx      # Remotion composition
│   └── Root.tsx
├── public/
│   └── audio/               # Generated audio files
├── .env
├── .gitignore
└── package.json
```

## Rate Limits and Best Practices

- Resemble.ai has rate limits based on your plan
- Cache generated audio files to avoid regenerating the same content
- Use the synchronous endpoint for content up to 2,000 characters
- For longer scripts, use streaming or split into multiple requests
- Store generated audio in `public/` for easy access in Remotion

## Credential Validation Utility

Use this to verify credentials are working:

```typescript
// src/resemble/validate.ts
import 'dotenv/config';

interface ValidationResult {
  isValid: boolean;
  apiKeyPresent: boolean;
  voiceUuidPresent: boolean;
  apiKeyWorks?: boolean;
  error?: string;
}

export async function validateResembleConfig(): Promise<ValidationResult> {
  const apiKey = process.env.RESEMBLE_API_KEY;
  const voiceUuid = process.env.RESEMBLE_VOICE_UUID;

  const result: ValidationResult = {
    isValid: false,
    apiKeyPresent: !!apiKey,
    voiceUuidPresent: !!voiceUuid,
  };

  if (!apiKey) {
    result.error = 'RESEMBLE_API_KEY is not set in .env';
    return result;
  }

  if (!voiceUuid) {
    result.error = 'RESEMBLE_VOICE_UUID is not set in .env';
    return result;
  }

  // Test API key by making a simple request
  try {
    const response = await fetch('https://app.resemble.ai/api/v2/voices?page=1&page_size=1', {
      headers: {
        'Authorization': `Token token=${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    result.apiKeyWorks = response.ok;

    if (!response.ok) {
      result.error = `API key validation failed: ${response.status}`;
      return result;
    }

    result.isValid = true;
  } catch (error) {
    result.error = `Connection error: ${error instanceof Error ? error.message : 'Unknown'}`;
  }

  return result;
}

// CLI usage
if (require.main === module) {
  validateResembleConfig().then((result) => {
    console.log('Resemble.ai Configuration Status:');
    console.log('─'.repeat(40));
    console.log(`API Key Present: ${result.apiKeyPresent ? '✓' : '✗'}`);
    console.log(`Voice UUID Present: ${result.voiceUuidPresent ? '✓' : '✗'}`);
    console.log(`API Key Valid: ${result.apiKeyWorks ? '✓' : '✗'}`);
    console.log('─'.repeat(40));
    console.log(`Overall: ${result.isValid ? '✓ Ready to use' : '✗ ' + result.error}`);
    process.exit(result.isValid ? 0 : 1);
  });
}
```

Run validation:

```bash
npx tsx src/resemble/validate.ts
```
