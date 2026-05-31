import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelTimeline, PixelTimelineItem } from '../../data/PixelTimeline';

describe('PixelTimeline', () => {
  it('renders ol with li items', () => {
    const { container } = render(
      <PixelTimeline data-testid="tl">
        <PixelTimelineItem title="One" />
        <PixelTimelineItem title="Two" />
        <PixelTimelineItem title="Three" />
      </PixelTimeline>,
    );
    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    const items = ol!.querySelectorAll('li');
    expect(items.length).toBe(3);
  });

  it('active=1 highlights second item', () => {
    const { container } = render(
      <PixelTimeline active={1}>
        <PixelTimelineItem title="One" />
        <PixelTimelineItem title="Two" />
        <PixelTimelineItem title="Three" />
      </PixelTimeline>,
    );
    const items = container.querySelectorAll('li');
    expect(items[1].getAttribute('data-pxl-state')).toBe('active');
    expect(items[0].getAttribute('data-pxl-state')).toBe('past');
    expect(items[2].getAttribute('data-pxl-state')).toBe('upcoming');
    expect(items[1].getAttribute('aria-current')).toBe('step');
  });

  it('bulletSize=lg applies large bullet', () => {
    const { container } = render(
      <PixelTimeline bulletSize="lg">
        <PixelTimelineItem title="One" />
        <PixelTimelineItem title="Two" />
      </PixelTimeline>,
    );
    const bullet = container.querySelector('[data-pxl-bullet]') as HTMLElement;
    expect(bullet).not.toBeNull();
    expect(bullet.className).toMatch(/h-5|w-5/);
  });

  it('item title and time render', () => {
    const { getByText } = render(
      <PixelTimeline>
        <PixelTimelineItem title="Shipped v1" time="2026-05-30" />
      </PixelTimeline>,
    );
    expect(getByText('Shipped v1')).toBeTruthy();
    expect(getByText('2026-05-30')).toBeTruthy();
  });

  it('last item has no bottom connector', () => {
    const { container } = render(
      <PixelTimeline>
        <PixelTimelineItem title="One" />
        <PixelTimelineItem title="Two" />
        <PixelTimelineItem title="Three" />
      </PixelTimeline>,
    );
    const items = container.querySelectorAll('li');
    const firstConnector = items[0].querySelector('[data-pxl-connector]');
    const lastConnector = items[items.length - 1].querySelector('[data-pxl-connector]');
    expect(firstConnector).not.toBeNull();
    expect(lastConnector).toBeNull();
  });
});
