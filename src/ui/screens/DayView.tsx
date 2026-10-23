import { AppHeader } from '../components/AppHeader';
import { RestTimer } from '../components/RestTimer';
import { planFor, rowContext, type AppModel } from '../state/model';
import type { Position } from '../state/actions';
import { text } from '../../i18n';
import { ExerciseItem } from './ExerciseItem';
import './Workout.css';

interface Props {
  model: AppModel;
  pos: Position;
  day: number;
  /** Aufgeklappte Uebung (Slot-ID) oder null. */
  openSlot: string | null;
  onOpenSlot: (slotId: string | null) => void;
  restEndsAt: number | null;
  onRest: (endsAt: number | null) => void;
  onBack: () => void;
}

/** Trainingstag: alle Uebungen untereinander, eine davon aufgeklappt zum Eintragen. */
export function DayView({ model, pos, day, openSlot, onOpenSlot, restEndsAt, onRest, onBack }: Props) {
  const plan = planFor(model, pos.cycle, pos.week);
  const dayPlan = plan.dayPlans[day];
  if (!dayPlan) return null;
  const ctx = rowContext(model, pos.cycle, pos.week);

  return (
    <main className="screen">
      <AppHeader />
      <button type="button" className="btn-quiet back-link" onClick={onBack}>
        {text.common.back}
      </button>
      <header className="card day-head" style={{ background: `var(--day-${dayPlan.letter.toLowerCase()})` }}>
        <h1 className="next-title">{dayPlan.name}</h1>
        <p className="next-focus">{dayPlan.focus}</p>
      </header>
      <ol className="exercise-list">
        {dayPlan.rows.map((row, i) => {
          const next = dayPlan.rows[i + 1];
          return (
            <ExerciseItem
              key={row.slotId}
              model={model}
              plan={plan}
              ctx={ctx}
              pos={pos}
              day={day}
              row={row}
              open={openSlot === row.slotId}
              onToggle={() => onOpenSlot(openSlot === row.slotId ? null : row.slotId)}
              onNext={next ? () => onOpenSlot(next.slotId) : null}
              onRest={onRest}
            />
          );
        })}
      </ol>
      {restEndsAt !== null && <RestTimer endsAt={restEndsAt} onChange={onRest} />}
    </main>
  );
}
