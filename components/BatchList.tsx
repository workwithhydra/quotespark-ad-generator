'use client';

import { SavedBatch, deleteBatch, formatBatchDate } from '@/lib/batch-store';

interface BatchListProps {
  batches: SavedBatch[];
  activeBatchId: string | null;
  onLoad: (batch: SavedBatch) => void;
  onDelete: (id: string) => void;
}

export default function BatchList({ batches, activeBatchId, onLoad, onDelete }: BatchListProps) {
  if (batches.length === 0) return null;

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (confirm('Delete this batch?')) {
      deleteBatch(id);
      onDelete(id);
    }
  }

  return (
    <div className="mb-10">
      <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3">
        Saved Batches
      </p>
      <div className="space-y-1.5">
        {batches.map((batch) => {
          const isActive = batch.id === activeBatchId;
          return (
            <div
              key={batch.id}
              onClick={() => onLoad(batch)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? 'bg-zinc-800 border border-zinc-700'
                  : 'hover:bg-zinc-800/60 border border-transparent'
              }`}
            >
              {/* Color swatches */}
              <div className="flex gap-1 flex-shrink-0">
                {batch.concepts.slice(0, 6).map((concept, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: concept.style.background_primary }}
                    title={concept.name}
                  />
                ))}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="text-sm text-zinc-300 truncate">
                  {formatBatchDate(batch.createdAt)}
                </span>
                <span className="text-xs text-zinc-600 ml-2">
                  {batch.concepts.length} concept{batch.concepts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Active badge */}
              {isActive && (
                <span className="text-xs text-orange-400 font-medium flex-shrink-0">Loaded</span>
              )}

              {/* Delete */}
              <button
                onClick={(e) => handleDelete(e, batch.id)}
                className={`text-zinc-600 hover:text-red-400 text-sm transition-colors flex-shrink-0 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
