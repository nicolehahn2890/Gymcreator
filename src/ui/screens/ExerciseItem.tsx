import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { planData } from '../../core/model/data';
import type { Entry, Plan, PlanRow } from '../../core/model/types';
import { repZone } from '../../core/progression/compare';
import { combinedWeight, getEntry } from '../../core/progression/entries';
import { applyExercise, exerciseChange } from '../../core/progression/inherit';
import { suggestWeight } from '../../core/progression/rules';
import { rowState, type RowContext } from '../../core/progression/state';
import { fmt, mmss, num, range, text } from '../../i18n';
import { Check } from '../components/Check';
import { ExercisePicker, StarIcon } from '../components/ExercisePicker';
import { PlusMinus } from '../components/PlusMinus';
import { Sheet } from '../components/Sheet';
import { StatusPill } from '../components/StatusPill';
import { addShortSet, entryForEdit, saveEntry, withExtraSets, withSetValue, type Position } from '../state/actions';
import { exerciseName, incrementFor, setsText, slotLabel, type AppModel } from '../state/model';
import { store } from '../state/store';

interface Props {
  model: AppModel;
  plan: Plan;
  ctx: RowContext;
  pos: Position;
  day: number;
  row: PlanRow;
  open: boolean;
  onToggle: () => void;
  /** Naechste Uebung aufklappen; null bei der letzten. */
  onNext: (() => void) | null;
  onRest: (endsAt: number | null) => void;
}

const LETTERS = 'ABCDEFG';

/** Ende einer Pause als Zeitstempel (ausserhalb der Komponente, damit das Rendern rein bleibt). */
function restUntil(seconds: number): number {
  return Date.now() + seconds * 1000;
}

/** Eine Uebung im Trainingstag: Kopfzeile zum Auf- und Zuklappen, darunter Saetze, Vorwerte und Hinweise. */
export function ExerciseItem({ model, plan, ctx, pos, day, row, open, onToggle, onNext, onRest }: Props) {
  const t = text.workout;
  const [picker, setPicker] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const headRef = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);

  // Beim Auf- oder Weiterklappen nach oben holen, nicht beim ersten Anzeigen des Tages
  useEffect(() => {
    if (open && mounted.current) headRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    mounted.current = true;
  }, [open]);

  const st = rowState(ctx, row, pos);
  const ex = model.exercises.get(st.exerciseId);
  const timed = ex?.timed ?? false;
  const goal = model.profile.goal;
  const prev = st.previous?.entry;
  const prevWeight = prev ? combinedWeight(prev.sets) : '';
  const panelId = `panel-${row.slotId}`;

  const edit = (change: (e: Entry) => Entry) => saveEntry(model, plan, change(entryForEdit(model, row, pos, day, st)));

  const setValue = (i: number, field: 'w' | 'r', value: string) => {
    if (field === 'w') {
      edit((e) => withSetValue(e, st.totalSets, i, { w: value }));
      return;
    }
    const n = value.trim() === '' ? null : parseInt(value, 10);
    const r = n === null || Number.isNaN(n) ? null : n;
    edit((e) => withSetValue(e, st.totalSets, i, { r }));
  };

  // Pause nur auf Wunsch: Dauer je Wdh.-Bereich aus data/goals.json
  const restSeconds = planData.goals.timing.restSeconds[st.repRange] ?? 0;

  const changeSets = (delta: number) => {
    const extra = Math.max(0, st.extraSets + delta);
    const total = Math.min(planData.goals.limits.maxSetsPerSlot, st.baseSets + extra + st.autoExtra);
    edit((e) => withExtraSets(e, extra, total));
    if (delta > 0) addShortSet(model, pos, row.slotId);
  };

  const pick = (next: string) => {
    setPicker(false);
    const stored = getEntry(model.index, pos.cycle, pos.week, row.slotId);
    const decision = exerciseChange(stored, pos.week, st.inheritedExerciseId, next);
    if (decision === 'unchanged') return;
    if (decision === 'ask') setPending(next);
    else edit((e) => applyExercise(e, next, false, st.inheritedExerciseId));
    // Erste Wahl ueber die Kopfzeile: danach gleich aufklappen zum Eintragen
    if (!st.exerciseId && next && !open) onToggle();
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

  // Vorwert aus der direkten Vorwoche heisst "Vorwoche", sonst "Zuletzt" mit Herkunft
  const lastWeek = !!prev && prev.cycle === pos.cycle && prev.week === pos.week - 1;
  const showSource = !!prev && (!lastWeek || st.previous?.orientation);
  const canAdd = st.totalSets < planData.goals.limits.maxSetsPerSlot;
  const note = model.data.notes.find((n) => n.exerciseId === st.exerciseId);
  const weightLabel = st.assisted ? t.assistedWeight : t.weight;
  const repLabel = timed ? t.seconds : t.reps;

  // Ohne Uebung gibt es nichts aufzuklappen: Die Kopfzeile oeffnet direkt die Auswahl
  const chosen = !!st.exerciseId;
  const expanded = open && chosen;

  return (
    <li className={`exercise-item${expanded ? ' open' : ''}${st.skipped ? ' skipped' : ''}`} style={{ '--cat': `var(--cat-${row.category})` } as CSSProperties}>
      <button
        ref={headRef}
        type="button"
        className="exercise-row"
        aria-expanded={chosen ? open : undefined}
        aria-controls={chosen ? panelId : undefined}
        aria-haspopup={chosen ? undefined : 'dialog'}
        onClick={chosen ? onToggle : () => setPicker(true)}
      >
        <span className="exercise-row-top">
          <span className="exercise-row-cat">{slotLabel(row)}</span>
          <span className="exercise-row-side">
            {st.once && <span className="pill pill-dashed">{t.once}</span>}
            {st.status && <StatusPill status={st.status} assisted={st.assisted} timed={timed} />}
            {st.done && (
              <span className="done-dot" aria-label={t.done}>
                <Check />
              </span>
            )}
            {chosen && <Chevron open={open} />}
          </span>
        </span>
        <span className={`exercise-row-name${chosen ? '' : ' empty'}`}>
          {chosen ? exerciseName(model, st.exerciseId) : t.chooseExercise}
          {ex?.stars.includes(goal) && (
            <span className="star" aria-label={t.starred}>
              <StarIcon />
            </span>
          )}
        </span>
        <span className="muted">{setsText(model, st)}</span>
      </button>

      {expanded && (
        <div className="exercise-panel" id={panelId}>
          {(suggestion || showSource || st.assisted) && (
            <div className="exercise-info">
              {suggestion && <p className="suggestion">{suggestion}</p>}
              {showSource && prev && (
                <p className="muted">
                  {fmt(t.source, { cycle: prev.cycle, week: prev.week, day: LETTERS[prev.day] ?? '' })}
                  {st.previous?.orientation && ` \u00b7 ${fmt(t.orientation, { range: range(prev.repRange) })}`}
                </p>
              )}
              {st.assisted && <p className="muted">{t.assistedHint}</p>}
            </div>
          )}

          <div className={`sets${prev ? ' with-prev' : ''}`} role="group" aria-label={exerciseName(model, st.exerciseId)}>
            <div className="set-row set-head" aria-hidden="true">
              <span />
              <span>{weightLabel}</span>
              <span>{repLabel}</span>
              {prev && <span>{lastWeek ? t.prevWeek : t.prevLast}</span>}
              <span />
            </div>
            {Array.from({ length: st.totalSets }, (_, i) => {
              const set = st.sets[i] ?? { w: '', r: null };
              const prevSet = prev?.sets[i];
              const zone = timed ? null : repZone(set.r, st.repRange);
              const filled = set.r !== null && set.r > 0;
              // Saetze ueber dem Ziel fuer "fertig" (targetSets) sind freiwillig
              const optional = i >= st.targetSets;
              const aria = (field: string) => fmt(optional ? t.optionalSetAria : t.setAria, { n: i + 1, field });
              return (
                <div key={i} className={`set-row${optional ? ' set-optional' : ''}`}>
                  <span className="set-label">{i + 1}</span>
                  <input
                    className="input"
                    inputMode="decimal"
                    autoComplete="off"
                    aria-label={aria(weightLabel)}
                    value={set.w}
                    onChange={(e) => setValue(i, 'w', e.target.value)}
                  />
                  <input
                    className={`input${zone ? ` rep-${zone}` : ''}`}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    aria-label={aria(repLabel)}
                    value={set.r ?? ''}
                    onChange={(e) => setValue(i, 'r', e.target.value)}
                  />
                  {prev && <span className="set-prev">{prevSet ? formatSet(prevSet.w, prevSet.r) : '\u2013'}</span>}
                  <span className={`set-done${filled ? ' on' : ''}`} aria-hidden="true">
                    {filled && <Check />}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="row set-actions">
            <button type="button" className="btn btn-icon btn-add" aria-label={t.addSet} disabled={!canAdd} onClick={() => changeSets(1)}>
              <PlusMinus sign="plus" />
            </button>
            <button type="button" className="btn btn-icon" aria-label={t.removeSet} disabled={st.extraSets === 0} onClick={() => changeSets(-1)}>
              <PlusMinus sign="minus" />
            </button>
            {restSeconds > 0 && (
              <button type="button" className="btn btn-small" onClick={() => onRest(restUntil(restSeconds))}>
                {fmt(t.restStart, { time: mmss(restSeconds) })}
              </button>
            )}
          </div>
          {st.autoExtra > 0 && (
            <p className="muted">{fmt(st.autoExtra === 1 ? t.autoSet : t.autoSets, { weeks: planData.goals.progression.stagnationComparisons, sets: st.autoExtra })}</p>
          )}

          <button type="button" className="btn btn-block" onClick={() => setPicker(true)}>
            {t.swap}
          </button>

          {ex?.tip && (
            <details className="details">
              <summary>{t.tip}</summary>
              <p className="tip-text">{ex.tip}</p>
            </details>
          )}
          <details className="details" open={!!(note?.note || note?.setting)}>
            <summary>
              {t.setting} / {t.note}
            </summary>
            <label className="field-label" htmlFor={`setting-${row.slotId}`}>
              {t.setting}
            </label>
            <input
              id={`setting-${row.slotId}`}
              className="input"
              placeholder={t.settingPlaceholder}
              defaultValue={note?.setting ?? ''}
              key={`s-${st.exerciseId}`}
              onBlur={(e) => void store.putNote({ exerciseId: st.exerciseId, setting: e.target.value, note: note?.note ?? '' })}
            />
            <label className="field-label note-label" htmlFor={`note-${row.slotId}`}>
              {t.note}
            </label>
            <textarea
              id={`note-${row.slotId}`}
              className="textarea"
              rows={3}
              defaultValue={note?.note ?? ''}
              key={`n-${st.exerciseId}`}
              onBlur={(e) => void store.putNote({ exerciseId: st.exerciseId, note: e.target.value, setting: note?.setting ?? '' })}
            />
          </details>

          {onNext && (
            <button type="button" className="btn btn-primary btn-block" onClick={onNext}>
              {t.next}
            </button>
          )}
        </div>
      )}

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
    </li>
  );
}

/** Vorwert eines Satzes wie eingetippt: "40 x 10", ohne Gewicht "x 10", ohne Wiederholungen "40". */
function formatSet(w: string, r: number | null): string {
  const weight = w.trim();
  if (r === null) return weight || '\u2013';
  return weight ? `${weight} \u00d7 ${r}` : `\u00d7 ${r}`;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className="chevron" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={open ? 'M3 10l5-5 5 5' : 'M3 6l5 5 5-5'} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
