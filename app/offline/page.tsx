'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-2xl bg-primary-100 p-4 dark:bg-primary-900/20">
        <svg
          className="h-12 w-12 text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167l-1.414-1.414"
          />
        </svg>
      </div>
      <h1 className="mb-2 text-2xl font-bold">You are offline</h1>
      <p className="text-muted-foreground">
        Please check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-lg bg-primary px-6 py-2 font-medium text-white"
      >
        Retry
      </button>
    </div>
  );
}
