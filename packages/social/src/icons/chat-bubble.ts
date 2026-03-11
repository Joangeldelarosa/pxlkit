import type { PxlKitData } from '@pxlkit/core';

/**
 * 💭 ChatBubble — 16×16 pixel art thought/chat cloud bubble
 *
 * A rounded white chat bubble — different from Message (cloud-style).
 *
 * Palette:
 *   W = White bubble (#FFFFFF)
 *   D = Dark outline (#9B9BB0)
 *   B = Blue accent  (#7EC8E3)
 *   T = Tail         (#CCCCDD)
 */
export const ChatBubble: PxlKitData = {
  name: 'chat-bubble',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '...DDDDDDDDD....',
    '..DWWWWWWWWWD...',
    '.DWWWWWWWWWWWD..',
    '.DWWBDDDDDDWWD..',
    '.DWWWWWWWWWWWD..',
    '.DWWBWWBWWBWWD..',
    '.DWWWWWWWWWWWD..',
    '.DWWDDDDDDWWWD..',
    '..DWWWWWWWWWD...',
    '...DDDDDDDDD....',
    '.....DDD........',
    '......DD........',
    '.......D........',
    '................',
    '................',
  ],
  palette: {
    W: '#FFFFFF',
    D: '#9B9BB0',
    B: '#7EC8E3',
    T: '#CCCCDD',
  },
  tags: ['chat', 'bubble', 'message', 'comment', 'speech', 'social'],
  author: 'pxlkit',
};
