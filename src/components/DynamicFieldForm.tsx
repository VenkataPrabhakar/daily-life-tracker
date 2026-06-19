import type { FieldDefinition } from '../core/types';

type Props = {
  fields: FieldDefinition[];
  values: Record<string, string | number | boolean>;
  onChange: (id: string, value: string | number | boolean) => void;
};

export function DynamicFieldForm({ fields, values, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <label key={field.id} className="block">
          <span className="text-xs text-slate-500">{field.label}{field.unit ? ` (${field.unit})` : ''}</span>
          {field.type === 'dropdown' ? (
            <select className="input mt-1" value={String(values[field.id] ?? '')} onChange={(e) => onChange(field.id, e.target.value)}>
              <option value="">Select...</option>
              {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : field.type === 'checkbox' ? (
            <input type="checkbox" className="mt-2" checked={Boolean(values[field.id])} onChange={(e) => onChange(field.id, e.target.checked)} />
          ) : field.type === 'rating' ? (
            <input type="range" min={field.min ?? 1} max={field.max ?? 5} className="mt-2 w-full" value={Number(values[field.id] ?? field.min ?? 1)} onChange={(e) => onChange(field.id, Number(e.target.value))} />
          ) : (
            <input
              type={field.type === 'number' || field.type === 'duration' || field.type === 'currency' ? 'number' : 'text'}
              className="input mt-1"
              value={String(values[field.id] ?? '')}
              onChange={(e) => onChange(field.id, field.type === 'number' || field.type === 'duration' || field.type === 'currency' ? Number(e.target.value) : e.target.value)}
            />
          )}
        </label>
      ))}
    </div>
  );
}
