import React from 'react'
import { PixelOTPInput } from './PixelOTPInput'

export function Default() {
  const [value, setValue] = React.useState('')
  return <PixelOTPInput length={6} value={value} onChange={setValue} />
}

export function Numeric4() {
  const [value, setValue] = React.useState('')
  return (
    <PixelOTPInput
      length={4}
      type="numeric"
      value={value}
      onChange={setValue}
    />
  )
}

export function Alphanumeric() {
  const [value, setValue] = React.useState('')
  return (
    <PixelOTPInput
      length={6}
      type="alphanumeric"
      value={value}
      onChange={setValue}
    />
  )
}

export function Masked() {
  const [value, setValue] = React.useState('')
  return (
    <PixelOTPInput
      length={6}
      mask
      value={value}
      onChange={setValue}
    />
  )
}

export function WithSeparator() {
  const [value, setValue] = React.useState('')
  return (
    <PixelOTPInput
      length={6}
      separator={<span>-</span>}
      value={value}
      onChange={setValue}
    />
  )
}
