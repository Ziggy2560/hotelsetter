import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Logo mark */}
        <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-brand font-bold text-2xl leading-none">404</span>
        </div>

        <h1 className="text-3xl font-bold text-text mb-3">Page not found</h1>
        <p className="text-text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-brand text-white text-sm font-semibold transition-all hover:bg-brand-dark active:scale-[0.98]"
        >
          Search hotels
        </Link>
      </div>
    </div>
  );
}
