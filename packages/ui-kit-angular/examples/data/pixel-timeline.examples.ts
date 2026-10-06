import { Component } from '@angular/core';
import { PixelTimeline, PixelTimelineItem } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelTimeline, PixelTimelineItem],
  template: `
    <ol pxlTimeline [active]="1">
      <li pxlTimelineItem title="Order placed" time="09:00" description="Confirmation email sent."></li>
      <li pxlTimelineItem title="Packed" time="11:20" description="At the warehouse."></li>
      <li pxlTimelineItem title="Shipped" time="—" description="Awaiting carrier pickup."></li>
    </ol>
  `,
})
export class Default {}

@Component({
  imports: [PixelTimeline, PixelTimelineItem],
  template: `
    <ol pxlTimeline [active]="0" bulletSize="lg">
      <li pxlTimelineItem title="Draft" lineVariant="dashed" description="Currently editing."></li>
      <li pxlTimelineItem title="Review" lineVariant="dashed" description="Pending approval."></li>
      <li pxlTimelineItem title="Published" lineVariant="dashed"></li>
    </ol>
  `,
})
export class Dashed {}

@Component({
  imports: [PixelTimeline, PixelTimelineItem],
  template: `
    <ol pxlTimeline [active]="2" align="right">
      <li pxlTimelineItem title="Step 1" time="Mon"></li>
      <li pxlTimelineItem title="Step 2" time="Tue"></li>
      <li pxlTimelineItem title="Step 3" time="Wed"></li>
    </ol>
  `,
})
export class RightAligned {}
