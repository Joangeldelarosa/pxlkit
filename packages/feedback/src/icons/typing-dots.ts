import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 💬… TypingDots — a filled chat bubble with a tail and three animated dots.
 * Filled (not outlined) so it reads on dark AND light; the tail makes the
 * bubble unambiguous. One dot lights up per frame, then all dim (pause).
 *
 *   B = bubble fill (#475569)
 *   W = active dot  (#FFFFFF)
 *   G = dim dot     (#94A3B8)
 */
const TEMPLATE = [
  '................',
  '................',
  '...PPPPPPPPPP...',
  '..PPPPPPPPPPPP..',
  '..PPPPPPPPPPPP..',
  '..PPPPPPPPPPPP..',
  '..PP00P11P22PP..',
  '..PP00P11P22PP..',
  '..PPPPPPPPPPPP..',
  '..PPPPPPPPPPPP..',
  '...PPPPPPPPPP...',
  '...PPP..........',
  '..PP............',
  '................',
  '................',
  '................',
];

const render = (lit: number): { grid: string[] } => ({
  grid: TEMPLATE.map((row) =>
    row.replace(/[012P]/g, (ch) => (ch === 'P' ? 'B' : Number(ch) === lit ? 'W' : 'G')),
  ),
});

export const TypingDots: AnimatedPxlKitData = {
  name: 'typing-dots',
  size: 16,
  category: 'feedback',
  palette: {
    B: '#475569',
    W: '#FFFFFF',
    G: '#94A3B8',
  },
  frames: [render(0), render(1), render(2), render(-1)],
  frameDuration: 250,
  loop: true,
  trigger: 'loop',
  tags: ['typing', 'dots', 'chat', 'message', 'animated', 'ui'],
  author: 'pxlkit',
};
