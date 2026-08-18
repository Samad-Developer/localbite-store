// app/error.tsx
"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold text-neutral-900">Something went wrong</h2>
      <p className="max-w-sm text-sm text-neutral-500">
        {error.message || "We couldn't load the restaurant right now. Please try again."}
      </p>
      <button
        onClick={() => reset()}
        className="rounded-full bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:bg-brand-hover"
      >
        Try again
      </button>
    </div>
  );
}