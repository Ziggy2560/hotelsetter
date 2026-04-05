"use client";

import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Warning icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 256 256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-amber-500"
          >
            <path
              d="M236.8 188.09L149.6 36.22a25.19 25.19 0 0 0-43.2 0l-87.2 151.87A23.51 23.51 0 0 0 40 220h176a23.51 23.51 0 0 0 20.8-31.91ZM120 104a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0Zm8 88a12 12 0 1 1 12-12 12 12 0 0 1-12 12Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-text mb-2">Something went wrong</h1>
        {error.message && (
          <p className="text-sm text-text-muted mb-6 font-mono bg-black/5 rounded-lg px-3 py-2 break-all">
            {error.message}
          </p>
        )}
        {!error.message && (
          <p className="text-text-muted mb-6">
            An unexpected error occurred. Please try again.
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-brand text-white text-sm font-semibold transition-all hover:bg-brand-dark active:scale-[0.98]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl border border-border bg-white text-text text-sm font-medium transition-all hover:bg-black/5 active:scale-[0.98]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
