import React from 'react';
import { PixelTimeline, PixelTimelineItem } from './PixelTimeline';

export function Default() {
  return (
    <PixelTimeline active={1}>
      <PixelTimelineItem title="Order placed" time="09:00">
        Confirmation email sent.
      </PixelTimelineItem>
      <PixelTimelineItem title="Packed" time="11:20">
        At the warehouse.
      </PixelTimelineItem>
      <PixelTimelineItem title="Shipped" time="—">
        Awaiting carrier pickup.
      </PixelTimelineItem>
    </PixelTimeline>
  );
}

export function Dashed() {
  return (
    <PixelTimeline active={0} bulletSize="lg">
      <PixelTimelineItem title="Draft" lineVariant="dashed">
        Currently editing.
      </PixelTimelineItem>
      <PixelTimelineItem title="Review" lineVariant="dashed">
        Pending approval.
      </PixelTimelineItem>
      <PixelTimelineItem title="Published" lineVariant="dashed" />
    </PixelTimeline>
  );
}

export function RightAligned() {
  return (
    <PixelTimeline active={2} align="right">
      <PixelTimelineItem title="Step 1" time="Mon" />
      <PixelTimelineItem title="Step 2" time="Tue" />
      <PixelTimelineItem title="Step 3" time="Wed" />
    </PixelTimeline>
  );
}
