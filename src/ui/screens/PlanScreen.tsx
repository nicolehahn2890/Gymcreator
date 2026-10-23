import { useState } from 'react';
import { planData } from '../../core/model/data';
import type { DaysPerWeek } from '../../core/model/types';
import { hasValues } from '../../core/progression/entries';
import { followingWeek } from '../../core/progression/position';
import { rowState } from '../../core/progression/state';
import { pausedSlotsWithValues } from '../../core/progression/week';
import { fmt, range, text } from '../../i18n';
import { AppHeader } from '../components/AppHeader';
import { Sheet } from '../components/Sheet';
import type { Position } from '../state/actions';
import { dayOptions, daysFor, exerciseName, rowContext, slotLabel, type AppModel } from '../state/model';
import { store } from '../state/store';
import './Plan.css';

interface Props {
  model: AppModel;
  pos: Position;
  onGoToWeek: (cycle: number, week: number) => void;
  onOpenDay: (day: number) => void;
}

export function PlanScreen({ model, pos, onGoToWeek, onOpenDay }: Props) {
  const t = text.plan;
  const rules = planData.goals.progression;
  const [picker, setPicker] = useState(false);
  const [confirmDays, setConfirmDays] = useState<DaysPerWeek | null>(null);
  const days = daysFor(model, pos.cycle, pos.week);
  const plan = model.plans[days];
  const ctx = rowContext(model, pos.cycle, pos.week);
  const next = followingWeek(rules, pos.cycle, pos.week);
  const prev = pos.week > 1 ? { cycle: pos.cycle, week: pos.week - 1 } : pos.cycle > 1 ? { cycle: pos.cycle - 1, week: rules.cycleWeeks } : null;
  const weeksWithEntries = new Set(model.data.entries.filter((e) => e.cycle === pos.cycle && hasValues(e)).map((e) => e.week));

  const chooseDays = (d: DaysPerWeek) => {
    if (d === days) return;
    if (pausedSlotsWithValues(model.data.entries, pos.cycle, pos.week, model.plans[d]).length) setConfirmDays(d);
    else void store.putWeek({ ...pos, days: d });
  };

  return (
    <main className="screen">
      <AppHeader />
      <h1 className="screen-title">{t.title}</h1>

      <div className="week-nav">
        <button type="button" className="btn btn-icon" aria-label={t.prevWeek} disabled={!prev} onClick={() => prev && onGoToWeek(prev.cycle, prev.week)}>
          <Arrow dir="left" />
        </button>
        <button type="button" className="btn week-label" onClick={() => setPicker(true)}>
          {fmt(t.cycleWeek, { cycle: pos.cycle, week: pos.week })}
        </button>
        <button type="button" className="btn btn-icon" aria-label={t.nextWeek} onClick={() => onGoToWeek(next.cycle, next.week)}>
          <Arrow dir="right" />
        </button>
      </div>

      <h2 className="section-title">{t.daysThisWeek}</h2>
      <div className="segmented" role="group" aria-label={t.daysThisWeek}>
        {dayOptions(model).map((d) => (
          <button key={d} type="button" className="btn btn-small" aria-pressed={d === days} onClick={() => chooseDays(d)}>
            {fmt(text.common.days, { n: d })}
          </button>
        ))}
      </div>

      <div className="stack plan-days">
        {plan.dayPlans.map((day) => (
          <button key={day.index} type="button" className="card plan-day" style={{ background: `var(--day-${day.letter.toLowerCase()})` }} onClick={() => onOpenDay(day.index)}>
            <span className="plan-day-title">{day.name}</span>
            <span className="plan-day-focus">{day.focus}</span>
            <span className="plan-day-rows">
              {day.rows.map((row) => {
                const st = rowState(ctx, row, pos);
                return (
                  <span key={row.slotId} className="plan-day-row">
                    <span>{st.exerciseId ? exerciseName(model, st.exerciseId) : slotLabel(row)}</span>
                    <span className="plan-day-sets">{fmt(text.workout.setsLine, { sets: st.totalSets, range: range(st.repRange) })}</span>
                  </span>
                );
              })}
            </span>
          </button>
        ))}
      </div>

      {picker && (
        <Sheet title={t.pickWeek} onClose={() => setPicker(false)}>
          <div className="week-grid">
            {Array.from({ length: rules.cycleWeeks }, (_, i) => i + 1).map((w) => (
              <button
                key={w}
                type="button"
                className={`week-cell${weeksWithEntries.has(w) ? ' has' : ''}`}
                aria-current={w === pos.week ? 'true' : undefined}
                aria-label={`${w}${weeksWithEntries.has(w) ? `, ${t.hasEntries}` : ''}`}
                onClick={() => {
                  setPicker(false);
                  onGoToWeek(pos.cycle, w);
                }}
              >
                {w}
              </button>
            ))}
          </div>
          <p className="muted week-legend">
            <span className="week-dot" aria-hidden="true" /> {t.hasEntries}
          </p>
        </Sheet>
      )}

      {confirmDays !== null && (
        <Sheet title={fmt(t.switchTitle, { week: pos.week, days: confirmDays })} onClose={() => setConfirmDays(null)}>
          <p className="sheet-text">{t.switchText}</p>
          <div className="stack">
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                void store.putWeek({ ...pos, days: confirmDays });
                setConfirmDays(null);
              }}
            >
              {t.switchConfirm}
            </button>
            <button type="button" className="btn-quiet" onClick={() => setConfirmDays(null)}>
              {text.common.cancel}
            </button>
          </div>
        </Sheet>
      )}
    </main>
  );
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={dir === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
