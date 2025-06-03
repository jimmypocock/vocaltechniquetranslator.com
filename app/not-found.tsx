import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="gradient-orb orb1" />
      <div className="gradient-orb orb2" />
      <div className="gradient-orb orb3" />
      <div className="gradient-orb orb4" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-4">
            <Link 
              href="/"
              className="btn-primary inline-block"
            >
              Go to Translator
            </Link>
            <div>
              <Link 
                href="/articles"
                className="text-sm hover:underline"
                style={{ color: 'var(--secondary)' }}
              >
                Browse Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}