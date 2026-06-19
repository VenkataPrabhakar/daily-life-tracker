import { useState } from 'react';
import { ModuleShell } from '../../components/ModuleShell';
import { useAppConfig } from '../../context/ConfigContext';
import { db } from '../../db/lifeOsDatabase';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import type { Relationship, RelationshipInteraction } from '../../core/types';

export function RelationshipsModule() {
  const { config } = useAppConfig();
  const people = useLiveQuery(() => db.relationships.toArray(), []);
  const interactions = useLiveQuery(() => db.interactions.toArray(), []);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(config?.relationshipCategories[0]?.id ?? 'family');

  const add = async () => {
    if (!name.trim()) return;
    const r: Relationship = {
      id: crypto.randomUUID(),
      name: name.trim(),
      categoryId,
      lastContact: new Date().toISOString().slice(0, 10),
    };
    await db.relationships.put(r);
    setName('');
  };

  const logInteraction = async (relationshipId: string) => {
    const entry: RelationshipInteraction = {
      id: crypto.randomUUID(),
      relationshipId,
      date: new Date().toISOString().slice(0, 10),
      type: 'meet',
    };
    await db.interactions.put(entry);
    const person = people?.find((p) => p.id === relationshipId);
    if (person) await db.relationships.put({ ...person, lastContact: entry.date });
  };

  return (
    <ModuleShell title="Relationships" subtitle="Track contacts, birthdays, and interactions">
      <div className="widget-card flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="input w-auto" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {config?.relationshipCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <button type="button" className="btn-primary" onClick={add}>Add Contact</button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people?.map((p) => {
          const cat = config?.relationshipCategories.find((c) => c.id === p.categoryId);
          const count = interactions?.filter((i) => i.relationshipId === p.id).length ?? 0;
          return (
            <div key={p.id} className="widget-card">
              <p className="font-semibold">{cat?.icon} {p.name}</p>
              <p className="text-xs text-slate-500">{cat?.label} · {count} interactions</p>
              {p.lastContact && <p className="text-xs text-slate-400">Last contact: {p.lastContact}</p>}
              <button type="button" className="btn-secondary mt-2 text-xs" onClick={() => logInteraction(p.id)}>Log interaction</button>
            </div>
          );
        })}
        {!people?.length && <p className="text-sm text-slate-400">No contacts yet</p>}
      </div>
    </ModuleShell>
  );
}

export function HomeModule() {
  const { config } = useAppConfig();
  const items = useLiveQuery(() => db.homeItems.toArray(), []);
  const [name, setName] = useState('');

  const add = async () => {
    if (!name.trim()) return;
    await db.homeItems.put({
      id: crypto.randomUUID(),
      name: name.trim(),
      categoryId: config?.homeCategories[0]?.id ?? 'maintenance',
      status: 'active',
    });
    setName('');
  };

  return (
    <ModuleShell title="Home Management" subtitle="Maintenance, inventory, and household projects">
      <div className="widget-card flex gap-2">
        <input className="input" placeholder="Item or task" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" className="btn-primary" onClick={add}>Add</button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items?.map((item) => {
          const cat = config?.homeCategories.find((c) => c.id === item.categoryId);
          return (
            <div key={item.id} className="widget-card flex items-center justify-between">
              <div>
                <p className="font-medium">{cat?.icon} {item.name}</p>
                <p className="text-xs capitalize text-slate-500">{item.status}{item.dueDate ? ` · due ${item.dueDate}` : ''}</p>
              </div>
              <select
                className="input w-auto text-xs"
                value={item.status}
                onChange={(e) => db.homeItems.put({ ...item, status: e.target.value as typeof item.status })}
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          );
        })}
      </div>
    </ModuleShell>
  );
}

export function DocumentsModule() {
  const { config } = useAppConfig();
  const docs = useLiveQuery(() => db.documents.toArray(), []);
  const [title, setTitle] = useState('');

  const add = async () => {
    if (!title.trim()) return;
    await db.documents.put({
      id: crypto.randomUUID(),
      title: title.trim(),
      categoryId: config?.documentCategories[0]?.id ?? 'identity',
      createdAt: new Date().toISOString(),
    });
    setTitle('');
  };

  return (
    <ModuleShell title="Documents" subtitle="Identity, financial, medical, and legal document vault">
      <div className="widget-card flex gap-2">
        <input className="input" placeholder="Document title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="button" className="btn-primary" onClick={add}>Add Document</button>
      </div>
      <div className="mt-4 space-y-2">
        {docs?.map((d) => {
          const cat = config?.documentCategories.find((c) => c.id === d.categoryId);
          return (
            <div key={d.id} className="widget-card flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{cat?.icon} {d.title}</p>
                <p className="text-xs text-slate-500">{cat?.label}{d.expiryDate ? ` · expires ${d.expiryDate}` : ''}</p>
              </div>
              {d.tags?.length ? <div className="flex gap-1">{d.tags.map((t) => <span key={t} className="rounded bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{t}</span>)}</div> : null}
            </div>
          );
        })}
      </div>
    </ModuleShell>
  );
}
