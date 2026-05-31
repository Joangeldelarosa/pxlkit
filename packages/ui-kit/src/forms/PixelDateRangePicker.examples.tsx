import React, { useState } from 'react';
import { PixelDateRangePicker, DateRangeValue } from './PixelDateRangePicker';

export function Default() {
  const [range, setRange] = useState<DateRangeValue>({});
  return (
    <PixelDateRangePicker
      label="Date range"
      value={range}
      onChange={setRange}
      placeholder="Select date range"
    />
  );
}

export function WithPresets() {
  const [range, setRange] = useState<DateRangeValue>({});
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const last7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
  const last30 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
  const next7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  return (
    <PixelDateRangePicker
      label="Reporting period"
      value={range}
      onChange={setRange}
      clearable
      presets={[
        { label: 'Last 7 days', value: { from: last7, to: start } },
        { label: 'Last 30 days', value: { from: last30, to: start } },
        { label: 'Next 7 days', value: { from: start, to: next7 } },
      ]}
    />
  );
}

export function SingleMonth() {
  const [range, setRange] = useState<DateRangeValue>({});
  return (
    <PixelDateRangePicker
      label="Single-month view"
      hint="Compact one-month calendar"
      value={range}
      onChange={setRange}
      numberOfMonths={1}
      clearable
    />
  );
}
