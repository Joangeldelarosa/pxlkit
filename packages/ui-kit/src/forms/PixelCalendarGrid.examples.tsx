import React, { useState } from 'react'
import { PixelCalendarGrid } from './PixelCalendarGrid'

export function Default() {
  const [value, setValue] = useState<Date | null>(null)
  return <PixelCalendarGrid value={value} onChange={setValue} />
}

export function WithSelectedDate() {
  const [value, setValue] = useState<Date | null>(new Date())
  return <PixelCalendarGrid value={value} onChange={setValue} />
}

export function WithMinMax() {
  const today = new Date()
  const min = new Date(today.getFullYear(), today.getMonth(), 1)
  const max = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const [value, setValue] = useState<Date | null>(null)
  return (
    <PixelCalendarGrid
      value={value}
      onChange={setValue}
      minDate={min}
      maxDate={max}
    />
  )
}

export function WithDisabledWeekends() {
  const [value, setValue] = useState<Date | null>(null)
  return (
    <PixelCalendarGrid
      value={value}
      onChange={setValue}
      disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
    />
  )
}

export function RangePreview() {
  const from = new Date()
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 5)
  return <PixelCalendarGrid rangePreview={{ from, to }} />
}
