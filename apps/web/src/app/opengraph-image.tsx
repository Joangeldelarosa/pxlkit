import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pxlkit — Retro Pixel Art React UI Kit, 226+ SVG Icons & Ready-to-Use Templates';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0A0A0F 100%)',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Pixel art logo inline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          {/* Logo icon */}
          <svg
            width="96"
            height="96"
            viewBox="0 0 8 8"
            style={{ imageRendering: 'pixelated', marginBottom: 24 }}
          >
            <rect x="1" y="0" width="6" height="1" fill="#00FF88" />
            <rect x="0" y="1" width="1" height="6" fill="#00FF88" />
            <rect x="7" y="1" width="1" height="6" fill="#4ECDC4" />
            <rect x="1" y="7" width="6" height="1" fill="#4ECDC4" />
            <rect x="2" y="2" width="2" height="2" fill="#FFD700" />
            <rect x="4" y="4" width="2" height="2" fill="#FF6B6B" />
          </svg>

          {/* Brand name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#00FF88',
              letterSpacing: '0.08em',
              textShadow: '0 0 40px rgba(0,255,136,0.4)',
              marginBottom: 16,
            }}
          >
            PXLKIT
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 24,
              color: '#8888AA',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 32,
            }}
          >
            Retro React UI Kit, Icons &amp; Templates
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 16 }}>
            {['226+ Icons', '40+ Components', 'Ready Templates', 'TypeScript-First', 'Tailwind CSS'].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 999,
                    border: '1px solid rgba(0,255,136,0.3)',
                    color: '#4ECDC4',
                    fontSize: 16,
                    background: 'rgba(0,255,136,0.06)',
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            color: '#555570',
            fontSize: 16,
          }}
        >
          <span>pxlkit.xyz</span>
          <span style={{ color: '#2A2A3E' }}>•</span>
          <span>MIT Code + Licensed Assets</span>
          <span style={{ color: '#2A2A3E' }}>•</span>
          <span>Split Licensing</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
