import { planData } from '../../core/model/data';
import { shortSets } from '../../core/progression/short';
import { AppHeader } from '../components/AppHeader';
import { RestTimer } from '../components/RestTimer';
import { dayMinutes, dayRows, planFor, rowContext, type AppModel } from '../state/model';
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
  const timing = planData.goals.timing;
  // Kurz-Modus: gewaehlte Zeit dieses Tages; angeboten werden nur Zeiten, die kuerzer sind und erreichbar
  const short = model.data.weeks.find((w) => w.cycle === pos.cycle && w.week === pos.week)?.short;
  const active = dayPlan.rows.map((r) => short?.[r.slotId]?.minutes).find((m) => m !== undefined) ?? null;
  const rows = dayRows(ctx, dayPlan, pos);
  const options = [...timing.shortMinutes].sort((a, b) => b - a).filter((m) => shortSets(rows, timing, m) !== null);
  const choose = (minutes: number | null) => setShort(model, pos, dayPlan, minutes);

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
      {(options.length > 0 || active !== null) && (
        <section className="day-time" aria-labelledby="day-time-label">
          <p className="day-time-head">
            <span id="day-time-label" className="field-label">
              {t.time}
            </span>
            <span className="muted">{fmt(t.timeEstimate, { min: dayMinutes(ctx, dayPlan, pos) })}</span>
          </p>
          <div className="segmented" role="group" aria-labelledby="day-time-label">
            <button type="button" className="btn btn-small" aria-pressed={active === null} onClick={() => choose(null)}>
              {t.timeNormal}
            </button>
            {[...new Set([...options, ...(active !== null ? [active] : [])])].sort((a, b) => b - a).map((m) => (
              <button key={m} type="button" className="btn btn-small" aria-pressed={active === m} onClick={() => choose(m)}>
                {fmt(t.timeShort, { min: m })}
              </button>
            ))}
          </div>
          {active !== null && <p className="muted day-time-note">{t.shortNote}</p>}
        </section>
      )}
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
