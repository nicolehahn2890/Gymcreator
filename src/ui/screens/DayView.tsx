import { rowState } from '../../core/progression/state';
import { fmt, range, text } from '../../i18n';
import { Check } from '../components/Check';
import { StatusPill } from '../components/StatusPill';
import { exerciseName, planFor, rowContext, type AppModel } from '../state/model';
import type { Position } from '../state/actions';
import './Workout.css';

interface Props {
  model: AppModel;
  pos: Position;
  day: number;
  onBack: () => void;
  onOpenExercise: (slotId: string) => void;
}

/** Uebungsliste eines Trainingstags; Tipp auf eine Uebung oeffnet die Fokusansicht. */
export function DayView({ model, pos, day, onBack, onOpenExercise }: Props) {
  const plan = planFor(model, pos.cycle, pos.week);
  const dayPlan = plan.dayPlans[day];
  if (!dayPlan) return null;
  const ctx = rowContext(model, pos.cycle, pos.week);

  return (
    <main className="screen">
      <button type="button" className="btn-quiet back-link" onClick={onBack}>
        {text.common.back}
      </button>
      <header className="card day-head" style={{ background: `var(--day-${dayPlan.letter.toLowerCase()})` }}>
        <h1 className="next-title">{dayPlan.name}</h1>
        <p className="next-focus">{dayPlan.focus}</p>
      </header>
      <ol className="exercise-list">
        {dayPlan.rows.map((row) => {
          const st = rowState(ctx, row, pos);
          const ex = model.exercises.get(st.exerciseId);
          return (
            <li key={row.slotId}>
              <button type="button" className="exercise-row" onClick={() => onOpenExercise(row.slotId)}>
                <span className="exercise-row-main">
                  <span className="exercise-row-name">{st.exerciseId ? exerciseName(model, st.exerciseId) : text.workout.chooseExercise}</span>
                  <span className="muted">
                    {ex?.timed
                      ? fmt(text.workout.setsLineTimed, { sets: st.totalSets })
                      : fmt(text.workout.setsLine, { sets: st.totalSets, range: range(st.repRange) })}
                  </span>
                </span>
                <span className="exercise-row-side">
                  {st.once && <span className="pill pill-dashed">{text.workout.once}</span>}
                  {st.status && <StatusPill status={st.status} assisted={st.assisted} />}
                  {st.done && (
                    <span className="done-dot" aria-label={text.workout.done}>
                      <Check />
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
