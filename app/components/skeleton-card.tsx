export function SkeletonCard() {
  return (
    <div className="skeleton-shimmer relative overflow-hidden rounded-2xl border border-ash-grey/20 bg-ink/40 p-4">
      <div className="mb-3 aspect-[5/6] w-full rounded-xl bg-ash-grey/10" />
      <div className="mb-1 h-4 w-2/3 rounded bg-ash-grey/15" />
      <div className="mb-3 h-2 w-1/3 rounded bg-ash-grey/10" />
      <div className="space-y-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-5 rounded bg-ash-grey/10" />
            <div className="h-1.5 flex-1 rounded-full bg-ash-grey/10" />
            <div className="h-3 w-7 rounded bg-ash-grey/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
