'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  disabled?: boolean;
}

export function ChecklistEditor({ items, onChange, disabled }: ChecklistEditorProps) {
  const [draft, setDraft] = React.useState('');

  const add = () => {
    if (!draft.trim()) return;
    onChange([...items, { id: crypto.randomUUID(), label: draft.trim(), done: false }]);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
          <input
            type="checkbox"
            checked={item.done}
            disabled={disabled}
            onChange={(e) => onChange(items.map((i) => (i.id === item.id ? { ...i, done: e.target.checked } : i)))}
            className="h-4 w-4 accent-primary"
          />
          <span className={`flex-1 text-sm ${item.done ? 'text-muted-foreground line-through' : ''}`}>{item.label}</span>
          {!disabled && (
            <button
              onClick={() => onChange(items.filter((i) => i.id !== item.id))}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove checklist item"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}

      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="e.g. Confirm Reactor-2 pressure logged"
          />
          <Button type="button" variant="outline" onClick={add}>
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
