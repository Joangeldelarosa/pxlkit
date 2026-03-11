import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="font-pixel text-2xl text-retro-red mb-4">404</h1>
      <p className="font-pixel text-sm text-retro-muted mb-6">PAGE NOT FOUND</p>
      <p className="font-mono text-xs text-retro-muted/70 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 font-mono text-sm text-retro-green border border-retro-green/40 rounded hover:bg-retro-green/10 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
