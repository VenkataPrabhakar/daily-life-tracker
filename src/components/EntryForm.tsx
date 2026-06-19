import { useState } from 'react';
import type { ActivityEntry, Category } from '../db/types';
import { clampNumber } from '../lib/dates';

type FormData = Omit<ActivityEntry, 'id' | 'timestamp' | 'timeBlock' | 'category'>;

type Props = {
  category: Category;
  initial?: ActivityEntry;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
};

export function EntryForm({ category, initial, onSubmit, onCancel }: Props) {
  const [hydrationMl, setHydrationMl] = useState(initial?.hydration?.amountMl ?? 250);
  const [gymActivity, setGymActivity] = useState(initial?.gym?.activity ?? '');
  const [gymMin, setGymMin] = useState(initial?.gym?.durationMin ?? 45);
  const [gymCalories, setGymCalories] = useState(initial?.gym?.caloriesBurned ?? '');
  const [meal, setMeal] = useState(initial?.diet?.meal ?? 'lunch');
  const [calories, setCalories] = useState(initial?.diet?.calories ?? 400);
  const [protein, setProtein] = useState(initial?.diet?.proteinG ?? '');
  const [dietDesc, setDietDesc] = useState(initial?.diet?.description ?? '');
  const [task, setTask] = useState(initial?.work?.task ?? '');
  const [workMin, setWorkMin] = useState(initial?.work?.durationMin ?? 60);
  const [focus, setFocus] = useState<number>(initial?.work?.focusScore ?? 3);
  const [sleepMin, setSleepMin] = useState(initial?.sleep?.durationMin ?? 480);
  const [quality, setQuality] = useState<number>(initial?.sleep?.quality ?? 3);
  const [noteText, setNoteText] = useState(initial?.note?.text ?? '');
  const [moodScore, setMoodScore] = useState<number>(initial?.mood?.score ?? 4);
  const [moodNote, setMoodNote] = useState(initial?.mood?.note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (category) {
      case 'hydration':
        onSubmit({ hydration: { amountMl: clampNumber(hydrationMl, 0, 10000) } });
        break;
      case 'gym':
        onSubmit({
          gym: {
            activity: gymActivity.trim() || 'Workout',
            durationMin: clampNumber(gymMin, 0, 600),
            caloriesBurned: gymCalories ? clampNumber(Number(gymCalories), 0, 5000) : undefined,
          },
        });
        break;
      case 'diet':
        onSubmit({
          diet: {
            meal: meal as 'breakfast' | 'lunch' | 'dinner' | 'snack',
            calories: clampNumber(calories, 0, 10000),
            proteinG: protein ? clampNumber(Number(protein), 0, 500) : undefined,
            description: dietDesc.trim() || undefined,
          },
        });
        break;
      case 'work':
        onSubmit({
          work: {
            task: task.trim() || 'Work session',
            durationMin: clampNumber(workMin, 0, 960),
            focusScore: focus as 1 | 2 | 3 | 4 | 5,
          },
        });
        break;
      case 'sleep':
        onSubmit({
          sleep: {
            durationMin: clampNumber(sleepMin, 0, 960),
            quality: quality as 1 | 2 | 3 | 4 | 5,
          },
        });
        break;
      case 'note':
        if (!noteText.trim()) return;
        onSubmit({ note: { text: noteText.trim() } });
        break;
      case 'mood':
        onSubmit({
          mood: {
            score: clampNumber(moodScore, 1, 5) as 1 | 2 | 3 | 4 | 5,
            note: moodNote.trim() || undefined,
          },
        });
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {category === 'hydration' && (
        <label className="block">
          <span className="text-xs text-slate-500">Amount (ml)</span>
          <input type="number" className="input mt-1" min={0} max={10000} value={hydrationMl} onChange={(e) => setHydrationMl(Number(e.target.value))} />
        </label>
      )}

      {category === 'gym' && (
        <>
          <label className="block">
            <span className="text-xs text-slate-500">Activity</span>
            <input className="input mt-1" value={gymActivity} onChange={(e) => setGymActivity(e.target.value)} placeholder="e.g. Weight training" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-slate-500">Duration (min)</span>
              <input type="number" className="input mt-1" min={0} max={600} value={gymMin} onChange={(e) => setGymMin(Number(e.target.value))} />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Calories burned</span>
              <input type="number" className="input mt-1" min={0} max={5000} value={gymCalories} onChange={(e) => setGymCalories(e.target.value)} placeholder="Optional" />
            </label>
          </div>
        </>
      )}

      {category === 'diet' && (
        <>
          <label className="block">
            <span className="text-xs text-slate-500">Meal</span>
            <select className="input mt-1" value={meal} onChange={(e) => setMeal(e.target.value as typeof meal)}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-slate-500">Calories</span>
              <input type="number" className="input mt-1" min={0} max={10000} value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Protein (g)</span>
              <input type="number" className="input mt-1" min={0} max={500} value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="Optional" />
            </label>
          </div>
          <label className="block">
            <span className="text-xs text-slate-500">Description</span>
            <input className="input mt-1" value={dietDesc} onChange={(e) => setDietDesc(e.target.value)} placeholder="What did you eat?" />
          </label>
        </>
      )}

      {category === 'work' && (
        <>
          <label className="block">
            <span className="text-xs text-slate-500">Task</span>
            <input className="input mt-1" value={task} onChange={(e) => setTask(e.target.value)} placeholder="What did you work on?" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-slate-500">Duration (min)</span>
              <input type="number" className="input mt-1" min={0} max={960} value={workMin} onChange={(e) => setWorkMin(Number(e.target.value))} />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Focus (1-5)</span>
              <input type="number" className="input mt-1" min={1} max={5} value={focus} onChange={(e) => setFocus(Number(e.target.value))} />
            </label>
          </div>
        </>
      )}

      {category === 'sleep' && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-slate-500">Duration (min)</span>
            <input type="number" className="input mt-1" min={0} max={960} value={sleepMin} onChange={(e) => setSleepMin(Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Quality (1-5)</span>
            <input type="number" className="input mt-1" min={1} max={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
          </label>
        </div>
      )}

      {category === 'note' && (
        <label className="block">
          <span className="text-xs text-slate-500">Note</span>
          <textarea className="input mt-1 min-h-[80px]" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Anything else from today..." />
        </label>
      )}

      {category === 'mood' && (
        <>
          <label className="block">
            <span className="text-xs text-slate-500">Mood score (1–5)</span>
            <input type="range" min={1} max={5} step={1} className="mt-2 w-full" value={moodScore} onChange={(e) => setMoodScore(Number(e.target.value))} />
            <span className="text-sm font-medium">{moodScore} / 5</span>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">How are you feeling?</span>
            <input className="input mt-1" value={moodNote} onChange={(e) => setMoodNote(e.target.value)} placeholder="Optional note" />
          </label>
        </>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary">{initial ? 'Save' : 'Add'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
