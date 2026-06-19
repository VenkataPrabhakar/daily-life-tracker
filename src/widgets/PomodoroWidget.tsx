import { useState, useEffect } from 'react';

const WORK = 25 * 60;
const BREAK = 5 * 60;

export function PomodoroWidget() {
  const [seconds, setSeconds] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (seconds > 0) return;
    if (phase === 'work') {
      setSessions((s) => s + 1);
      setPhase('break');
      setSeconds(BREAK);
    } else {
      setPhase('work');
      setSeconds(WORK);
    }
  }, [seconds, phase]);

  const toggle = () => setRunning((r) => !r);
  const reset = () => { setRunning(false); setPhase('work'); setSeconds(WORK); };

  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <p className="text-xs uppercase text-slate-500">{phase === 'work' ? 'Focus' : 'Break'}</p>
      <p className="text-4xl font-bold tabular-nums">{m}:{s}</p>
      <p className="mt-1 text-xs text-slate-400">{sessions} sessions</p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={toggle} className="btn-primary text-xs">{running ? 'Pause' : 'Start'}</button>
        <button type="button" onClick={reset} className="btn-secondary text-xs">Reset</button>
      </div>
    </div>
  );
}
