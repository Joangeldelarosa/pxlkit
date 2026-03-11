---
name: resemble-captions
description: Using Resemble.ai timestamps to create synchronized captions
metadata:
  tags: resemble, captions, subtitles, timestamps, synchronization, tiktok
---

# Creating Synchronized Captions

> **⚠️ OPT-IN FEATURE:** Captions are disabled by default. Only implement captions when the user explicitly requests them (e.g., "add captions", "include subtitles", "word highlighting").

Resemble.ai provides character-level timestamps with synthesized audio, enabling precise caption synchronization.

## Understanding Timestamp Data

The synchronous API returns `audio_timestamps`:

```typescript
interface AudioTimestamps {
  graph_chars: string[];      // Individual characters
  graph_times: [number, number][]; // [start, end] times in seconds
  phon_chars: string[];       // Phonemes (legacy)
  phon_times: [number, number][];
}
```

Example response:

```json
{
  "graph_chars": ["H", "e", "l", "l", "o"],
  "graph_times": [[0.0, 0.12], [0.12, 0.24], [0.24, 0.36], [0.36, 0.48], [0.48, 0.6]]
}
```

## Converting Timestamps to Words

```typescript
// src/resemble/captions.ts
interface Word {
  text: string;
  startTime: number;
  endTime: number;
}

interface AudioTimestamps {
  graph_chars: string[];
  graph_times: [number, number][];
}

export function timestampsToWords(timestamps: AudioTimestamps): Word[] {
  const words: Word[] = [];
  let currentWord = '';
  let wordStart = 0;
  let wordEnd = 0;

  for (let i = 0; i < timestamps.graph_chars.length; i++) {
    const char = timestamps.graph_chars[i];
    const [start, end] = timestamps.graph_times[i];

    if (char === ' ' || char === '\n') {
      // End of word
      if (currentWord.trim()) {
        words.push({
          text: currentWord.trim(),
          startTime: wordStart,
          endTime: wordEnd,
        });
      }
      currentWord = '';
      wordStart = end;
    } else {
      if (!currentWord) {
        wordStart = start;
      }
      currentWord += char;
      wordEnd = end;
    }
  }

  // Don't forget the last word
  if (currentWord.trim()) {
    words.push({
      text: currentWord.trim(),
      startTime: wordStart,
      endTime: wordEnd,
    });
  }

  return words;
}
```

## Caption Component for Remotion

```tsx
// src/components/Captions.tsx
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface Word {
  text: string;
  startTime: number;
  endTime: number;
}

interface CaptionsProps {
  words: Word[];
  style?: React.CSSProperties;
}

export const Captions: React.FC<CaptionsProps> = ({ words, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTime = frame / fps;

  // Find current word
  const currentWordIndex = words.findIndex(
    (word) => currentTime >= word.startTime && currentTime <= word.endTime
  );

  // Get words to display (show a few words at a time)
  const windowSize = 5;
  const startIndex = Math.max(0, currentWordIndex - 2);
  const visibleWords = words.slice(startIndex, startIndex + windowSize);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '0 40px',
        ...style,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {visibleWords.map((word, idx) => {
          const absoluteIndex = startIndex + idx;
          const isActive = absoluteIndex === currentWordIndex;
          const isPast = currentTime > word.endTime;

          return (
            <span
              key={`${word.text}-${word.startTime}`}
              style={{
                fontSize: 48,
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive ? '#ffcc00' : isPast ? '#888888' : '#ffffff',
                fontFamily: 'sans-serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.1s ease',
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
```

## TikTok-Style Word Highlighting

```tsx
// src/components/TikTokCaptions.tsx
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface Word {
  text: string;
  startTime: number;
  endTime: number;
}

interface TikTokCaptionsProps {
  words: Word[];
  wordsPerPage?: number;
}

export const TikTokCaptions: React.FC<TikTokCaptionsProps> = ({
  words,
  wordsPerPage = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTime = frame / fps;

  // Find current word index
  const currentWordIndex = words.findIndex(
    (word) => currentTime >= word.startTime && currentTime <= word.endTime
  );

  // Calculate current page
  const currentPage = Math.floor(Math.max(0, currentWordIndex) / wordsPerPage);
  const pageStartIndex = currentPage * wordsPerPage;
  const pageWords = words.slice(pageStartIndex, pageStartIndex + wordsPerPage);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 200,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px 16px',
          maxWidth: '80%',
        }}
      >
        {pageWords.map((word, idx) => {
          const absoluteIndex = pageStartIndex + idx;
          const isActive = absoluteIndex === currentWordIndex;
          const isPast =
            absoluteIndex < currentWordIndex ||
            (absoluteIndex === currentWordIndex && currentTime > word.endTime);

          // Animation for active word
          const scale = isActive
            ? spring({
                frame: frame - word.startTime * fps,
                fps,
                config: { damping: 15, stiffness: 200 },
                durationInFrames: 10,
              })
            : 1;

          const animatedScale = interpolate(scale, [0, 1], [0.8, 1.15]);

          return (
            <span
              key={`${word.text}-${absoluteIndex}`}
              style={{
                fontSize: 64,
                fontWeight: 800,
                fontFamily: 'Inter, sans-serif',
                color: isActive ? '#FFFFFF' : isPast ? '#666666' : '#AAAAAA',
                backgroundColor: isActive ? '#FF0050' : 'transparent',
                padding: isActive ? '4px 16px' : '4px 8px',
                borderRadius: 8,
                transform: `scale(${isActive ? animatedScale : 1})`,
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
```

## Complete Integration Example

```tsx
// src/compositions/VideoWithCaptions.tsx
import { Audio } from '@remotion/media';
import { AbsoluteFill, staticFile } from 'remotion';
import { TikTokCaptions } from '../components/TikTokCaptions';

interface Props {
  audioPath: string;
  words: Array<{
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

export const VideoWithCaptions: React.FC<Props> = ({ audioPath, words }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      {/* Background or video content */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
      />

      {/* Captions */}
      <TikTokCaptions words={words} wordsPerPage={4} />

      {/* Audio */}
      <Audio src={staticFile(audioPath)} />
    </AbsoluteFill>
  );
};
```

## Export to SRT Format

```typescript
// src/resemble/captions.ts
export function wordsToSRT(words: Word[], wordsPerCaption: number = 6): string {
  const lines: string[] = [];
  let captionIndex = 1;

  for (let i = 0; i < words.length; i += wordsPerCaption) {
    const chunk = words.slice(i, i + wordsPerCaption);
    const startTime = chunk[0].startTime;
    const endTime = chunk[chunk.length - 1].endTime;
    const text = chunk.map((w) => w.text).join(' ');

    lines.push(`${captionIndex}`);
    lines.push(`${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}`);
    lines.push(text);
    lines.push('');

    captionIndex++;
  }

  return lines.join('\n');
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
}

function pad(num: number, size: number = 2): string {
  return num.toString().padStart(size, '0');
}
```
