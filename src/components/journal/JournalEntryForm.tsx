import { useRef, useState } from 'react';
import type { JournalEntry, JournalPrompt, JournalTemplate } from '../../core/types';
import { RatingSlider } from './RatingSlider';
import { WEATHER_OPTIONS } from '../../config/defaults/journalDefaults';
import { currentTimeLabel, readFileAsDataUrl } from '../../platform/journal/journalUtils';
import { toDateKey } from '../../lib/dates';

type Props = {
  template: JournalTemplate;
  initial?: Partial<JournalEntry>;
  extraPrompt?: JournalPrompt | null;
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<void>;
  onCancel?: () => void;
};

export function JournalEntryForm({ template, initial, extraPrompt, onSave, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? toDateKey(new Date()));
  const [time, setTime] = useState(initial?.time ?? currentTimeLabel());
  const [responses, setResponses] = useState<Record<string, string>>(initial?.responses ?? {});
  const [mood, setMood] = useState(initial?.mood ?? 3);
  const [energy, setEnergy] = useState(initial?.energy ?? 3);
  const [stress, setStress] = useState(initial?.stress ?? 3);
  const [weather, setWeather] = useState(initial?.weather ?? WEATHER_OPTIONS[0]);
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [favorite, setFavorite] = useState(initial?.favorite ?? false);
  const [attachments, setAttachments] = useState(initial?.attachments ?? []);
  const [libraryPromptIds] = useState<string[]>(initial?.libraryPromptIds ?? []);
  const [extraAnswer, setExtraAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  const addImage = async (file: File) => {
    if (file.size > 800_000) return alert('Image too large (max ~800KB)');
    const dataUrl = await readFileAsDataUrl(file);
    setAttachments((a) => [...a, { id: crypto.randomUUID(), type: 'image', name: file.name, dataUrl, createdAt: new Date().toISOString() }]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const dataUrl = await readFileAsDataUrl(new File([blob], 'voice.webm', { type: 'audio/webm' }));
        setAttachments((a) => [...a, { id: crypto.randomUUID(), type: 'audio', name: 'Voice note', dataUrl, createdAt: new Date().toISOString() }]);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const submit = async () => {
    setSaving(true);
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    const finalResponses = { ...responses };
    const promptIds = [...libraryPromptIds];
    if (extraPrompt && extraAnswer.trim() && !promptIds.includes(extraPrompt.id)) {
      promptIds.push(extraPrompt.id);
    }
    await onSave({
      date,
      time,
      templateId: template.id,
      responses: finalResponses,
      mood,
      energy,
      stress,
      weather,
      tags: tagList.length ? tagList : undefined,
      favorite,
      attachments: attachments.length ? attachments : undefined,
      libraryPromptIds: promptIds.length ? promptIds : undefined,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="widget-card overflow-hidden border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-transparent">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-4xl">{template.icon}</span>
          <div>
            <h2 className="text-xl font-bold">{template.label}</h2>
            {template.description && <p className="text-sm text-slate-500">{template.description}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm"><span className="text-xs text-slate-500">Date</span><input type="date" className="input mt-1" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="block text-sm"><span className="text-xs text-slate-500">Time</span><input type="time" className="input mt-1" value={time} onChange={(e) => setTime(e.target.value)} /></label>
        <label className="block text-sm"><span className="text-xs text-slate-500">Weather</span>
          <select className="input mt-1" value={weather} onChange={(e) => setWeather(e.target.value)}>
            {WEATHER_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <RatingSlider label="Mood" emoji="😊" value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" />
        <RatingSlider label="Energy" emoji="⚡" value={energy} onChange={setEnergy} />
        <RatingSlider label="Stress" emoji="🧘" value={stress} onChange={setStress} lowLabel="Calm" highLabel="High" />
      </div>

      {extraPrompt && (
        <div className="widget-card border-violet-500/30 bg-violet-500/5">
          <p className="text-xs font-medium text-violet-600">Prompt from library</p>
          <p className="mt-1 text-sm font-medium">{extraPrompt.text}</p>
          <textarea className="input mt-2 min-h-[80px]" placeholder="Your reflection..." value={extraAnswer} onChange={(e) => setExtraAnswer(e.target.value)} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {template.prompts.map((p) => (
          <label key={p.id} className="widget-card block transition focus-within:ring-2 focus-within:ring-brand-500/30">
            <span className="text-sm font-semibold">{p.label}</span>
            {p.hint && <span className="ml-2 text-xs text-slate-400">{p.hint}</span>}
            <textarea
              className="input mt-2 min-h-[100px] border-0 bg-transparent p-0 shadow-none focus:ring-0"
              placeholder={p.placeholder ?? 'Write here...'}
              value={responses[p.id] ?? ''}
              onChange={(e) => setResponses((r) => ({ ...r, [p.id]: e.target.value }))}
            />
          </label>
        ))}
      </div>

      <div className="widget-card space-y-3">
        <label className="block text-sm"><span className="text-xs text-slate-500">Tags (comma separated)</span>
          <input className="input mt-1" placeholder="gratitude, work, family" value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])} />
          <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const dataUrl = await readFileAsDataUrl(f);
            setAttachments((a) => [...a, { id: crypto.randomUUID(), type: 'audio', name: f.name, dataUrl, createdAt: new Date().toISOString() }]);
          }} />
          <button type="button" className="btn-secondary text-xs" onClick={() => imageRef.current?.click()}>📷 Add image</button>
          <button type="button" className="btn-secondary text-xs" onClick={() => audioRef.current?.click()}>🎵 Audio file</button>
          {!recording ? (
            <button type="button" className="btn-secondary text-xs" onClick={startRecording}>🎙️ Record voice</button>
          ) : (
            <button type="button" className="btn-primary text-xs" onClick={stopRecording}>⏹ Stop recording</button>
          )}
          <label className="flex items-center gap-2 text-sm ml-auto">
            <input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} /> ⭐ Favorite
          </label>
        </div>
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div key={a.id} className="relative">
                {a.type === 'image' ? (
                  <img src={a.dataUrl} alt={a.name} className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <audio controls src={a.dataUrl} className="max-w-[200px]" />
                )}
                <button type="button" className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1 text-[10px] text-white" onClick={() => setAttachments((x) => x.filter((i) => i.id !== a.id))}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" disabled={saving} onClick={submit}>{saving ? 'Saving...' : 'Save entry'}</button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
