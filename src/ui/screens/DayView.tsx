import { planData } from '../../core/model/data';
import type { PlanRow } from '../../core/model/types';
import { shortSets } from '../../core/progression/short';
import { AppHeader } from '../components/AppHeader';
import { RestTimer } from '../components/RestTimer';
import { dayMinutes, dayRows, isShortDay, planFor, rowContext, shortContext, type AppModel } from '../state/model';
import { setShort, type Position } from '../state/actions';
import { fmt, text } from '../../i18n';
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
  const t = text.workout;
  // Kurz-Modus: die wichtigsten Uebungen mit allen Saetzen; angeboten, wenn der Tag mehr Uebungen hat
  const rows = dayRows(ctx, dayPlan, pos);
  const active = isShortDay(ctx, dayPlan);
  const offered = active || shortSets(rows, shortContext(model)) !== null;
  const [from, to] = planData.goals.short.minutes;

  // Ausgelassene Uebungen stehen unten, alle anderen in Trainingsreihenfolge
  const skipped = new Set(rows.filter((r) => r.target === 0).map((r) => r.slotId));
  const main = dayPlan.rows.filter((r) => !skipped.has(r.slotId));
  const rest = dayPlan.rows.filter((r) => skipped.has(r.slotId));
  const order = [...main, ...rest];

  const item = (row: PlanRow) => {
    const next = order[order.indexOf(row) + 1];
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
  };

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
      {offered && (
        <section className="day-time" aria-labelledby="day-time-label">
          <p className="day-time-head">
            <span id="day-time-label" className="field-label">
              {t.time}
            </span>
            <span className="muted">{fmt(t.timeEstimate, { min: dayMinutes(ctx, dayPlan, pos) })}</span>
          </p>
          <div className="segmented" role="group" aria-labelledby="day-time-label">
            <button type="button" className="btn btn-small" aria-pressed={!active} onClick={() => setShort(model, pos, dayPlan, false)}>
              {t.timeNormal}
            </button>
            <button type="button" className="btn btn-small" aria-pressed={active} onClick={() => setShort(model, pos, dayPlan, true)}>
              {fmt(t.timeShort, { from, to })}
            </button>
          </div>
          {active && (
            <p className="muted day-time-note">
              {t.shortNote}
              {rows.some((r) => r.target > 0 && r.target < r.sets) && ` ${t.shortSetsNote}`}
            </p>
          )}
        </section>
      )}
      <ol className="exercise-list">{main.map(item)}</ol>
      {rest.length > 0 && (
        <section className="skipped-list" aria-labelledby="skipped-title">
          <h2 id="skipped-title" className="section-title">
            {t.skippedTitle}
          </h2>
          <ol className="exercise-list">{rest.map(item)}</ol>
        </section>
      )}
      {restEndsAt !== null && <RestTimer endsAt={restEndsAt} onChange={onRest} />}
    </main>
  );
}
