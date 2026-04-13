'use client';

interface CartBarProps {
  count: number;
  clientName: string;
  onClear: () => void;
  onShip: () => void;
}

export default function CartBar({ count, clientName, onClear, onShip }: CartBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {count}
          </div>
          <span className="text-white font-medium">
            {count} ad{count !== 1 ? 's' : ''} selected
          </span>
          <span className="text-zinc-500 text-sm hidden sm:inline">
            for {clientName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onShip}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            Ship to Meta
            <span className="text-orange-200">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
