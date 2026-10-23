import { useState } from 'react';
import { planData } from '../../core/model/data';
import { DAY_COUNTS, type DaysPerWeek } from '../../core/model/types';
import { rowState } from '../../core/progression/state';
import { pausedSlotsWithValues } from '../../core/progression/week';
import { fmt, text } from '../../i18n';
import { AppHeader } from '../components/AppHeader';
import { Sheet } from '../components/Sheet';
import { WeekNav } from '../components/WeekNav';
import { saveWeekDays, type Position } from '../state/actions';
import { dayMinutes, dayRows, daysFor, exerciseName, rowContext, setsText, slotLabel, type AppModel } from '../state/model';
import './Plan.css';

interface Props {
  model: AppModel;
  pos: Position;
  onGoToWeek: (cycle: number, week: number) => void;
  onOpenDay: (day: number) => void;
  onSetup: () => void;
}

export function PlanScreen({ model, pos, onGoToWeek, onOpenDay, onSetup }: Props) {
  const t = text.plan;
  const rules = planData.goals.progression;
  const [confirmDays, setConfirmDays] = useState<DaysPerWeek | null>(null);
  const days = daysFor(model, pos.cycle, pos.week);
  const plan = model.plans[days];
  const ctx = rowContext(model, pos.cycle, pos.week);
  const short = model.data.weeks.find((w) => w.cycle === pos.cycle && w.week === pos.week)?.short;

  const chooseDays = (d: DaysPerWeek) => {
    if (d === days) return;
    if (pausedSlotsWithValues(model.data.entries, pos.cycle, pos.week, model.plans[d]).length) setConfirmDays(d);
    else saveWeekDays(model, pos, d);
  };

  return (
    <main className="screen">
      <AppHeader />
      <h1 className="screen-title">{t.title}</h1>

      <section className="card plan-profile" aria-label={t.yourPlan}>
        <p className="plan-profile-text">
          {fmt(t.summary, { goal: planData.goals.goals[model.profile.goal].label.de, days: model.profile.days })}
        </p>
        <button type="button" className="btn btn-small" onClick={onSetup}>
          {t.setup}
        </button>
      </section>

      <WeekNav model={model} pos={pos} onGoToWeek={onGoToWeek} />

      <p className="muted plan-cycle-note">
        {fmt(t.cycleNote, { weeks: rules.cycleWeeks, from: rules.nextCycleLighterPct[0], to: rules.nextCycleLighterPct[1] })}
      </p>

      <h2 className="section-title">{t.daysThisWeek}</h2>
      <div className="segmented" role="group" aria-label={t.daysThisWeek}>
        {DAY_COUNTS.map((d) => (
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
            <span className="plan-day-meta">
              {fmt(text.today.meta, { n: dayRows(ctx, day, pos).filter((r) => r.target > 0).length, min: dayMinutes(ctx, day, pos) })}
            </span>
            {day.rows.some((r) => short?.[r.slotId]) && (
              <span className="pill plan-day-short">{fmt(t.shortActive, { from: planData.goals.short.minutes[0], to: planData.goals.short.minutes[1] })}</span>
            )}
            <span className="plan-day-rows">
              {day.rows.map((row) => {
                const st = rowState(ctx, row, pos);
                return (
                  <span key={row.slotId} className="plan-day-row">
                    <span>{st.exerciseId ? exerciseName(model, st.exerciseId) : slotLabel(row)}</span>
                    <span className="plan-day-sets">{st.skipped ? t.skippedRow : setsText(model, st)}</span>
                  </span>
                );
              })}
            </span>
          </button>
        ))}
      </div>

      {confirmDays !== null && (
        <Sheet title={fmt(t.switchTitle, { week: pos.week, days: confirmDays })} onClose={() => setConfirmDays(null)}>
          <p className="sheet-text">{t.switchText}</p>
          <div className="stack">
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                saveWeekDays(model, pos, confirmDays);
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
