import { useState, type CSSProperties } from 'react';
import { planData } from '../../core/model/data';
import type { Entry } from '../../core/model/types';
import { repZone } from '../../core/progression/compare';
import { combinedWeight, getEntry } from '../../core/progression/entries';
import { applyExercise, exerciseChange } from '../../core/progression/inherit';
import { suggestWeight } from '../../core/progression/rules';
import { rowState } from '../../core/progression/state';
import { fmt, num, range, text } from '../../i18n';
import { Check } from '../components/Check';
import { ExercisePicker } from '../components/ExercisePicker';
import { RestTimer } from '../components/RestTimer';
import { Sheet } from '../components/Sheet';
import { StatusPill } from '../components/StatusPill';
import { entryForEdit, saveEntry, withSetValue, type Position } from '../state/actions';
import { exerciseName, incrementFor, planFor, rowContext, type AppModel } from '../state/model';
import { store } from '../state/store';
import './Workout.css';

interface Props {
  model: AppModel;
  pos: Position;
  day: number;
  slotId: string;
  restEndsAt: number | null;
  onRest: (endsAt: number | null) => void;
  onOpenExercise: (slotId: string) => void;
  onBack: () => void;
}

const LETTERS = 'ABCDEFG';

/** Ende einer Pause als Zeitstempel (ausserhalb der Komponente, damit das Rendern rein bleibt). */
function restUntil(seconds: number): number {
  return Date.now() + seconds * 1000;
}

function formatWeight(w: string): string {
  return w
    .split('-')
    .map((p) => num(Number(p)))
    .join('–');
}

export function ExerciseView({ model, pos, day, slotId, restEndsAt, onRest, onOpenExercise, onBack }: Props) {
  const t = text.workout;
  const [picker, setPicker] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const plan = planFor(model, pos.cycle, pos.week);
  const dayPlan = plan.dayPlans[day];
  const rowIndex = dayPlan?.rows.findIndex((r) => r.slotId === slotId) ?? -1;
  const row = dayPlan?.rows[rowIndex];
  if (!dayPlan || !row) return null;

  const ctx = rowContext(model, pos.cycle, pos.week);
  const st = rowState(ctx, row, pos);
  const ex = model.exercises.get(st.exerciseId);
  const timed = ex?.timed ?? false;
  const stored = getEntry(model.index, pos.cycle, pos.week, slotId);
  const note = model.data.notes.find((n) => n.exerciseId === st.exerciseId);
  const goal = model.profile.goal;
  const prev = st.previous?.entry;
  const prevWeight = prev ? combinedWeight(prev.sets) : '';

  const edit = (change: (e: Entry) => Entry) => saveEntry(model, plan, change(entryForEdit(model, row, pos, day, st)));

  const setValue = (i: number, field: 'w' | 'r', value: string) => {
    if (field === 'w') {
      edit((e) => withSetValue(e, st.totalSets, i, { w: value }));
      return;
    }
    const n = value.trim() === '' ? null : parseInt(value, 10);
    const r = n === null || Number.isNaN(n) ? null : n;
    const before = st.sets[i]?.r ?? null;
    edit((e) => withSetValue(e, st.totalSets, i, { r }));
    // Pause startet, sobald ein Satz Wiederholungen bekommt (nicht nach dem letzten)
    if (before === null && r !== null && i < st.totalSets - 1) onRest(restUntil(planData.goals.timing.restSeconds[st.repRange] ?? 0));
  };

  const changeSets = (delta: number) => edit((e) => ({ ...e, extraSets: Math.max(0, e.extraSets + delta) }));

  const pick = (next: string) => {
    setPicker(false);
    const decision = exerciseChange(stored, pos.week, st.inheritedExerciseId, next);
    if (decision === 'unchanged') return;
    if (decision === 'ask') setPending(next);
    else edit((e) => applyExercise(e, next, false, st.inheritedExerciseId));
  };

  const confirm = (once: boolean) => {
    if (pending === null) return;
    edit((e) => applyExercise(e, pending, once, st.inheritedExerciseId));
    setPending(null);
  };

  let suggestion = '';
  if (st.increaseDue && !timed) {
    const w = suggestWeight(prevWeight, incrementFor(model, st.exerciseId), st.assisted);
    if (st.assisted) suggestion = w === null ? t.suggestAssistedStep : fmt(t.suggestAssisted, { weight: num(w) });
    else suggestion = w === null ? t.suggestStep : fmt(t.suggest, { weight: num(w) });
  }

  const prevNext = (d: number) => dayPlan.rows[rowIndex + d]?.slotId;
  const catColor = { background: `var(--cat-${row.category})` } as CSSProperties;
  const canAdd = st.totalSets < planData.goals.limits.maxSetsPerSlot;

  return (
    <main className="screen exercise">
      <div className="row-between">
        <button type="button" className="btn-quiet back-link" onClick={onBack}>
          {t.toDay}
        </button>
        <span className="muted">{fmt(t.exerciseOf, { n: rowIndex + 1, total: dayPlan.rows.length })}</span>
      </div>

      <header className="exercise-head">
        <div className="row">
          <span className="pill" style={catColor}>
            {planData.goals.categories[row.category]?.label.de}
          </span>
          {st.once && <span className="pill pill-dashed">{t.once}</span>}
        </div>
        <h1 className="exercise-title">{st.exerciseId ? exerciseName(model, st.exerciseId) : t.chooseExercise}</h1>
        <p className="muted">
          {timed ? fmt(t.setsLineTimed, { sets: st.totalSets }) : fmt(t.setsLine, { sets: st.totalSets, range: range(st.repRange) })}
        </p>
        {ex?.stars.includes(goal) && <p className="muted">{t.starred}</p>}
      </header>

      <section className="card exercise-info">
        {pos.week < planData.goals.progression.compareFromWeek && <p className="muted">{fmt(t.noCompare, { week: pos.week })}</p>}
        {prev && (
          <p>
            {fmt(t.previous, {
              value: `${prevWeight ? `${formatWeight(prevWeight)} kg × ` : ''}${prev.sets
                .map((s) => s.r)
                .filter((r) => r !== null)
                .join(' / ')}`,
            })}
            <br />
            <span className="muted">
              {fmt(t.source, { cycle: prev.cycle, week: prev.week, day: LETTERS[prev.day] ?? '' })}
              {st.previous?.orientation && ` · ${fmt(t.orientation, { range: range(prev.repRange) })}`}
            </span>
          </p>
        )}
        {suggestion && <p className="suggestion">{suggestion}</p>}
        {st.status && (
          <p>
            <StatusPill status={st.status} assisted={st.assisted} />
          </p>
        )}
        {st.assisted && <p className="muted">{t.assistedHint}</p>}
      </section>

      <section className="sets">
        {Array.from({ length: st.totalSets }, (_, i) => {
          const set = st.sets[i] ?? { w: '', r: null };
          const prevSet = prev?.sets[i];
          const zone = timed ? null : repZone(set.r, st.repRange);
          const filled = set.r !== null && set.r > 0;
          return (
            <div key={i} className="set-row">
              <span className="set-label">{fmt(t.set, { n: i + 1 })}</span>
              <label className="set-field">
                <span className="visually-hidden">{st.assisted ? t.assistedWeight : t.weight}</span>
                <input
                  className="input"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={prevSet?.w || prevWeight}
                  value={set.w}
                  onChange={(e) => setValue(i, 'w', e.target.value)}
                />
                <span className="set-unit">{st.assisted ? t.assistedWeight : t.weight}</span>
              </label>
              <label className="set-field">
                <span className="visually-hidden">{timed ? t.seconds : t.reps}</span>
                <input
                  className={`input${zone ? ` rep-${zone}` : ''}`}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  placeholder={prevSet?.r != null ? String(prevSet.r) : ''}
                  value={set.r ?? ''}
                  onChange={(e) => setValue(i, 'r', e.target.value)}
                />
                <span className="set-unit">{timed ? t.seconds : t.reps}</span>
              </label>
              <span className={`set-done${filled ? ' on' : ''}`} aria-hidden="true">
                {filled && <Check />}
              </span>
            </div>
          );
        })}
        <div className="row">
          <button type="button" className="btn btn-small" disabled={!canAdd} onClick={() => changeSets(1)}>
            {t.addSet}
          </button>
          <button type="button" className="btn btn-small" disabled={st.extraSets === 0} onClick={() => changeSets(-1)}>
            {t.removeSet}
          </button>
        </div>
        {st.autoExtra > 0 && <p className="muted">{t.autoSet}</p>}
      </section>

      {restEndsAt !== null && <RestTimer endsAt={restEndsAt} onChange={onRest} />}

      <button type="button" className="btn btn-block" onClick={() => setPicker(true)}>
        {t.swap}
      </button>

      <div className="details-stack">
        {ex?.tip && (
          <details className="card details">
            <summary>{t.tip}</summary>
            <p className="tip-text">{ex.tip}</p>
          </details>
        )}
        {st.exerciseId && (
          <details className="card details" open={!!note}>
            <summary>
              {t.note} / {t.setting}
            </summary>
            <label className="field-label" htmlFor="ex-setting">
              {t.setting}
            </label>
            <input
              id="ex-setting"
              className="input"
              placeholder={t.settingPlaceholder}
              defaultValue={note?.setting ?? ''}
              key={`s-${st.exerciseId}`}
              onBlur={(e) => void store.putNote({ exerciseId: st.exerciseId, setting: e.target.value, note: note?.note ?? '' })}
            />
            <label className="field-label" htmlFor="ex-note" style={{ marginTop: 10 }}>
              {t.note}
            </label>
            <textarea
              id="ex-note"
              className="textarea"
              rows={3}
              defaultValue={note?.note ?? ''}
              key={`n-${st.exerciseId}`}
              onBlur={(e) => void store.putNote({ exerciseId: st.exerciseId, note: e.target.value, setting: note?.setting ?? '' })}
            />
          </details>
        )}
      </div>

      <nav className="row exercise-nav">
        <button type="button" className="btn" disabled={!prevNext(-1)} onClick={() => onOpenExercise(prevNext(-1) ?? slotId)}>
          {t.prevExercise}
        </button>
        <button type="button" className="btn btn-primary" disabled={!prevNext(1)} onClick={() => onOpenExercise(prevNext(1) ?? slotId)}>
          {t.nextExercise}
        </button>
      </nav>

      {picker && (
        <ExercisePicker
          model={model}
          category={row.category}
          focus={row.focus}
          goal={goal}
          current={st.exerciseId}
          onPick={pick}
          onClose={() => setPicker(false)}
        />
      )}

      {pending !== null && (
        <Sheet title={text.change.title} onClose={() => setPending(null)}>
          <p className="sheet-text">
            {fmt(text.change.text, { next: exerciseName(model, pending), current: exerciseName(model, st.inheritedExerciseId ?? '') })}
          </p>
          <div className="stack">
            <button type="button" className="btn btn-block" onClick={() => confirm(true)}>
              {text.change.once}
            </button>
            <button type="button" className="btn btn-primary btn-block" onClick={() => confirm(false)}>
              {text.change.always}
            </button>
            <button type="button" className="btn-quiet" onClick={() => setPending(null)}>
              {text.common.cancel}
            </button>
          </div>
        </Sheet>
      )}
    </main>
  );
}
