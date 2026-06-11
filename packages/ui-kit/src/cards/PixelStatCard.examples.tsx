import { PixelStatCard } from './PixelStatCard'

export function Default() {
  return <PixelStatCard label="Revenue" value="$12,480" trend="+8.2% vs last week" />
}

export function Tones() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PixelStatCard label="Active" value="1,204" tone="green" trend="+3.1%" />
      <PixelStatCard label="Pending" value="48" tone="gold" trend="2 overdue" />
      <PixelStatCard label="Cancelled" value="12" tone="red" trend="-1 vs ayer" />
      <PixelStatCard label="Sessions" value="3.2k" tone="cyan" trend="+220 hoy" />
      <PixelStatCard label="Members" value="89" tone="purple" />
      <PixelStatCard label="Likes" value="412" tone="pink" />
      <PixelStatCard label="Drafts" value="7" tone="neutral" />
    </div>
  )
}

export function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <PixelStatCard label="Small" value="$1,200" size="sm" trend="+2%" tone="cyan" />
      <PixelStatCard label="Medium" value="$8,400" size="md" trend="+5%" tone="gold" />
      <PixelStatCard label="Large" value="$24,900" size="lg" trend="+11%" tone="green" />
    </div>
  )
}

export function Surfaces() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PixelStatCard label="Pixel" value="$4,200" surface="pixel" tone="gold" trend="+6%" />
      <PixelStatCard label="Linear" value="$4,200" surface="linear" tone="gold" trend="+6%" />
    </div>
  )
}

export function IconPositions() {
  const dot = <span aria-hidden="true">$</span>
  return (
    <div className="grid grid-cols-2 gap-3">
      <PixelStatCard label="Top" value="$1,200" icon={dot} iconPosition="top" tone="cyan" />
      <PixelStatCard label="Left" value="$1,200" icon={dot} iconPosition="left" tone="green" />
      <PixelStatCard label="Right" value="$1,200" icon={dot} iconPosition="right" tone="purple" />
      <PixelStatCard
        label="Bottom-left"
        value="$1,200"
        icon={dot}
        iconPosition="bottom-left"
        tone="gold"
      />
    </div>
  )
}

export function WithoutTrend() {
  return <PixelStatCard label="Total users" value="12,480" tone="cyan" />
}
