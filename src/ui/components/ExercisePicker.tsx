import { useMemo, useState } from 'react';
import type { CategoryId, Focus, GoalId } from '../../core/model/types';
import { text } from '../../i18n';
import type { AppModel } from '../state/model';
import { store } from '../state/store';
import { Sheet } from './Sheet';

interface Props {
  model: AppModel;
  category: CategoryId;
  focus: Focus | undefined;
  goal: GoalId;
  current: string;
  onPick: (exerciseId: string) => void;
  onClose: () => void;
}

/** Auswahl innerhalb der Kategorie: passender Fokus und Sterne zuerst, vorhandene Ausstattung vor dem Rest. */
export function ExercisePicker({ model, category, focus, goal, current, onPick, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const t = text.picker;

  const options = useMemo(() => {
    const available = new Set(model.profile.equipment);
    const list = [...model.exercises.values()].filter((e) => e.category === category);
    const rank = (e: (typeof list)[number]) => [
      focus && !e.focus.includes(focus) ? 1 : 0,
      e.stars.includes(goal) ? 0 : 1,
      e.equipment.every((q) => available.has(q)) ? 0 : 1,
    ];
    return list
      .map((e, i) => ({ e, r: [...rank(e), i] }))
      .sort((a, b) => a.r.reduce((d, v, i) => d || v - (b.r[i] ?? 0), 0))
      .map((x) => x.e);
  }, [model, category, focus, goal]);

  const q = query.trim().toLowerCase();
  const shown = q ? options.filter((e) => e.name.toLowerCase().includes(q)) : options;

  const createCustom = () => {
    const name = customName.trim();
    if (!name) return;
    const id = `custom_${Date.now().toString(36)}`;
    void store.putCustom({ id, name, category, equipment: [], note: '' });
    onPick(id);
  };

  return (
    <Sheet title={t.title} onClose={onClose}>
      <input className="input" type="search" placeholder={t.search} aria-label={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul className="picker-list">
        {shown.map((e) => (
          <li key={e.id}>
            <button type="button" className="picker-option" aria-pressed={e.id === current} onClick={() => onPick(e.id)}>
              <span>{e.name}</span>
              {e.stars.includes(goal) && (
                <span className="star" title={text.workout.starred} aria-label={text.workout.starred}>
                  <StarIcon />
                </span>
              )}
            </button>
          </li>
        ))}
        {!shown.length && <li className="muted picker-empty">{t.none}</li>}
        <li>
          <button type="button" className="picker-option picker-clear" onClick={() => onPick('')}>
            {t.clear}
          </button>
        </li>
      </ul>
      <div className="picker-custom">
        <label className="field-label" htmlFor="custom-name">
          {t.custom}
        </label>
        <div className="row">
          <input id="custom-name" className="input" placeholder={t.customName} value={customName} onChange={(e) => setCustomName(e.target.value)} />
          <button type="button" className="btn btn-small" disabled={!customName.trim()} onClick={createCustom}>
            {t.customSave}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

/** Stern fuer die besten Uebungen zum Ziel: Ink-Stern auf goldener Scheibe mit Ink-Rahmen (Gold allein ist auf Cream zu blass). */
export function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="9" fill="var(--gold)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M10 5.3l1.23 3.3 3.53.15-2.76 2.2.94 3.4L10 12.4l-2.94 1.95.94-3.4-2.76-2.2 3.53-.15z" fill="var(--ink)" />
    </svg>
  );
}
