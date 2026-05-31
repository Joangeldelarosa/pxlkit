import React, { useState } from 'react';
import { PixelDatePicker } from './PixelDatePicker';

export function Default() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <PixelDatePicker
      label="Pick a date"
      value={date}
      onChange={setDate}
      placeholder="Select date"
    />
  );
}

export function WithPresets() {
  const [date, setDate] = useState<Date | null>(null);
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  return (
    <PixelDatePicker
      label="Due date"
      value={date}
      onChange={setDate}
      clearable
      presets={[
        { label: 'Today', value: today },
        { label: 'Tomorrow', value: tomorrow },
        { label: 'Next week', value: nextWeek },
      ]}
    />
  );
}

export function WithMinMax() {
  const [date, setDate] = useState<Date | null>(null);
  const today = new Date();
  const min = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const max = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  return (
    <PixelDatePicker
      label="Within one month"
      hint="Only the next 30 days are selectable"
      value={date}
      onChange={setDate}
      min={min}
      max={max}
    />
  );
}
