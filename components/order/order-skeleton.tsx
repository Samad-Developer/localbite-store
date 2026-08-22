import { Skeleton } from "@/components/ui/skeleton";

export function OrderSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex flex-col items-center gap-3 rounded-3xl bg-neutral-100 px-6 py-9">
        <Skeleton className="h-16 w-16 rounded-full bg-neutral-200" />
        <Skeleton className="h-6 w-48 bg-neutral-200" />
        <Skeleton className="h-4 w-64 bg-neutral-200" />
      </div>

      <div className="mb-6 space-y-4 rounded-3xl border border-neutral-200 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24 bg-neutral-200" />
              <Skeleton className="h-4 w-40 bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-3xl border border-neutral-200 p-6">
        <Skeleton className="h-4 w-28 bg-neutral-200" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-44 bg-neutral-200" />
              <Skeleton className="h-3 w-28 bg-neutral-200" />
            </div>
            <Skeleton className="h-4 w-16 bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
