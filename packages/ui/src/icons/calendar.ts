import type { PxlKitData } from '@pxlkit/core';

/**
 * 📅 Calendar — 16×16 pixel art calendar icon
 *
 * A calendar page with a grid of dates — schedule, date, event, booking.
 *
 * Palette:
 *   W = White page (#FFFFFF)
 *   R = Red header (#CC4444)
 *   D = Dark date  (#334455)
 *   O = Outline    (#334455)
 *   G = Grid lines (#AABBCC)
 */
export const Calendar: PxlKitData = {
  name: 'calendar',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '..OOOOOOOOOOOO..',
    '..ORRRRRRRRRO...',
    '..ORRRRRRRRRO...',
    '..OOOOOOOOOOOO..',
    '..OWGWGWGWGWO...',
    '..ODGDGDGDGDO...',
    '..OWGWGWGWGWO...',
    '..ODGDGDGDGDO...',
    '..OWGWGWGWGWO...',
    '..ODGDGDGDGDO...',
    '..OWGWGWGWGWO...',
    '..OGGGGGGGGGGO..',
    '..OOOOOOOOOOOO..',
    '................',
    '................',
  ],
  palette: {
    W: '#FFFFFF',
    R: '#CC4444',
    D: '#334455',
    O: '#334455',
    G: '#AABBCC',
  },
  tags: ['calendar', 'date', 'schedule', 'event', 'booking', 'ui'],
  author: 'pxlkit',
};
