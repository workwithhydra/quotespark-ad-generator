'use client';

export default function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-zinc-800 rounded-xl overflow-hidden">
            <div className="aspect-square bg-zinc-700" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-zinc-700 rounded w-3/4" />
              <div className="h-4 bg-zinc-700 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-9 bg-zinc-700 rounded w-24" />
                <div className="h-9 bg-zinc-700 rounded w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
