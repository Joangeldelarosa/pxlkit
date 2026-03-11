import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0F',
          borderRadius: 36,
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 8 8"
          style={{ imageRendering: 'pixelated' }}
        >
          <rect x="1" y="0" width="6" height="1" fill="#00FF88" />
          <rect x="0" y="1" width="1" height="6" fill="#00FF88" />
          <rect x="7" y="1" width="1" height="6" fill="#4ECDC4" />
          <rect x="1" y="7" width="6" height="1" fill="#4ECDC4" />
          <rect x="2" y="2" width="2" height="2" fill="#FFD700" />
          <rect x="4" y="4" width="2" height="2" fill="#FF6B6B" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
