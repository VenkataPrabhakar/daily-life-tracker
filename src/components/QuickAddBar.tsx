import { useState } from 'react';
import type { TimeBlock } from '../db/types';
import { getCurrentTimeBlock } from '../lib/dates';

type Props = {
  onQuickWater: (block: TimeBlock, amountMl: number) => void;
  onQuickGym: (block: TimeBlock, durationMin: number) => void;
};

export function QuickAddBar({ onQuickWater, onQuickGym }: Props) {
  const [open, setOpen] = useState(false);
  const block = getCurrentTimeBlock();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg transition hover:bg-brand-700 md:bottom-8"
        aria-label="Quick add"
      >
        +
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-2 md:bottom-8">
      <button type="button" onClick={() => { onQuickWater(block, 250); setOpen(false); }} className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-blue-600">
        💧 +250ml water
      </button>
      <button type="button" onClick={() => { onQuickWater(block, 500); setOpen(false); }} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-blue-700">
        💧 +500ml water
      </button>
      <button type="button" onClick={() => { onQuickGym(block, 30); setOpen(false); }} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-orange-600">
        🏋️ 30min gym
      </button>
      <button type="button" onClick={() => { onQuickGym(block, 45); setOpen(false); }} className="rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-orange-700">
        🏋️ 45min gym
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-slate-700 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-slate-800">
        Close
      </button>
    </div>
  );
}
