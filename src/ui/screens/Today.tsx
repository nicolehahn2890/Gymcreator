import { useState } from 'react';
import { planData } from '../../core/model/data';
import { DAY_COUNTS, type DaysPerWeek, type PlanDay } from '../../core/model/types';
import { dayProgress, followingWeek, nextDayIndex } from '../../core/progression/position';
import { rowState, weekStats } from '../../core/progression/state';
import { pausedSlotsWithValues } from '../../core/progression/week';
import { fmt, shortDayName, text } from '../../i18n';
import { AppHeader } from '../components/AppHeader';
import { Check } from '../components/Check';
import { Sheet } from '../components/Sheet';
import { WeekNav } from '../components/WeekNav';
import { saveWeekDays, type Position } from '../state/actions';
import { dayMinutes, dayRows, exerciseName, isShortDay, planFor, rowContext, setsText, slotLabel, type AppModel } from '../state/model';
import './Today.css';

interface Props {
  model: AppModel;
  pos: Position;
  onOpenDay: (day: number) => void;
  onGoToWeek: (cycle: number, week: number) => void;
  /** Uebungen der Woche aufgeklappt, mit Tage-Wahl und Zyklus-Hinweis */
  listOpen: boolean;
  onToggleList: () => void;
}

const standalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** Startseite, im Reiter "Plan": naechstes Training, Wochenstand und bei Bedarf alle Uebungen der Woche. */
export function Today({ model, pos, onOpenDay, onGoToWeek, listOpen, onToggleList }: Props) {
  const t = text.today;
  const rules = planData.goals.progression;
  const { cycle, week } = pos;
  const [confirmDays, setConfirmDays] = useState<DaysPerWeek | null>(null);
  const plan = planFor(model, cycle, week);
  const ctx = rowContext(model, cycle, week);
  const progress = plan.dayPlans.map((d) => dayProgress(ctx, d, pos));
  const next = nextDayIndex(progress);
  const nextDay = next === null ? null : plan.dayPlans[next];
  const stats = weekStats(ctx, plan.dayPlans, pos);
  const trained = progress.filter((p) => p.started).length;
  const following = followingWeek(rules, cycle, week);
  // Woche 12 und Woche 1 ab Zyklus 2 erklaeren den leichteren Start schon oben
  const cycleHint = week === rules.cycleWeeks || (cycle > 1 && week < rules.compareFromWeek);
  const meta = (day: PlanDay) =>
    fmt(t.meta, { n: dayRows(ctx, day, pos).filter((r) => r.target > 0).length, min: dayMinutes(ctx, day, pos) });

  const chooseDays = (d: DaysPerWeek) => {
    if (d === plan.days) return;
    if (pausedSlotsWithValues(model.data.entries, cycle, week, model.plans[d]).length) setConfirmDays(d);
    else saveWeekDays(model, pos, d);
  };

  return (
    <main className="screen today">
      <AppHeader />
      <WeekNav model={model} pos={pos} onGoToWeek={onGoToWeek} />

      {week < rules.compareFromWeek && (
        <p className="note today-note">
          {cycle > 1 ? fmt(t.firstWeekNext, { cycle, from: rules.nextCycleLighterPct[0], to: rules.nextCycleLighterPct[1] }) : t.firstWeek}
        </p>
      )}
      {week === rules.cycleWeeks && <p className="note today-note">{fmt(t.cycleEnd, { cycle, next: cycle + 1 })}</p>}

      {nextDay ? (
        <section
          className="card next-day"
          data-day={nextDay.letter.toLowerCase()}
          style={{ background: `var(--day-${nextDay.letter.toLowerCase()})` }}
          aria-labelledby="next-day-title"
        >
          <p className="next-label">{t.nextUp}</p>
          <h1 id="next-day-title" className="next-title">
            {nextDay.name}
          </h1>
          <p className="next-focus">{nextDay.focus}</p>
          <p className="next-meta">{meta(nextDay)}</p>
          <button type="button" className="btn btn-primary btn-large btn-block" onClick={() => onOpenDay(nextDay.index)}>
            {t.start}
          </button>
        </section>
      ) : (
        <section className="card next-day" aria-labelledby="week-done-title">
          <h1 id="week-done-title" className="next-title">
            {fmt(t.weekDone, { week })}
          </h1>
          <p className="next-focus">{t.weekDoneText}</p>
          <button type="button" className="btn btn-primary btn-large btn-block" onClick={() => onGoToWeek(following.cycle, following.week)}>
            {t.nextWeek}
          </button>
        </section>
      )}

      <p className="today-stats">
        {fmt(t.daysDone, { done: trained, total: plan.dayPlans.length })}
        {stats.total > 0 && (
          <>
            <br />
            {fmt(t.balance, { improved: stats.improved, total: stats.total })}
          </>
        )}
      </p>

      <div className="row-between today-week-head">
        <h2 className="section-title">{t.allDays}</h2>
        <button type="button" className="btn btn-small" aria-expanded={listOpen} onClick={onToggleList}>
          {listOpen ? t.hideList : t.showList}
        </button>
      </div>

      {listOpen && (
        <>
          <h3 className="field-label">{text.plan.daysThisWeek}</h3>
          <div className="segmented today-days" role="group" aria-label={text.plan.daysThisWeek}>
            {DAY_COUNTS.map((d) => (
              <button key={d} type="button" className="btn btn-small" aria-pressed={d === plan.days} onClick={() => chooseDays(d)}>
                {fmt(text.common.days, { n: d })}
              </button>
            ))}
          </div>
        </>
      )}

      <ul className="day-list">
        {plan.dayPlans.map((day, i) => {
          const p = progress[i];
          const color = `var(--day-${day.letter.toLowerCase()})`;
          return (
            <li key={day.index}>
              <button type="button" className="day-row" onClick={() => onOpenDay(day.index)}>
                <span className="day-letter" style={{ background: color }}>
                  {day.letter}
                </span>
                <span className="day-row-name">{shortDayName(day.name)}</span>
                <span className="count-pill" style={{ color }}>
                  {p?.done ?? 0}/{p?.total ?? 0}
                </span>
                {p && p.total > 0 && p.done === p.total && (
                  <span className="done-dot">
                    <Check />
                  </span>
                )}
                {listOpen && (
                  <span className="day-row-plan">
                    <span className="day-row-focus">{day.focus}</span>
                    <span className="muted">{meta(day)}</span>
                    {isShortDay(ctx, day) && (
                      <span className="pill day-row-short">{fmt(text.plan.shortActive, { from: planData.goals.short.minutes[0], to: planData.goals.short.minutes[1] })}</span>
                    )}
                    <span className="day-row-exercises">
                      {day.rows.map((row) => {
                        const st = rowState(ctx, row, pos);
                        return (
                          <span key={row.slotId} className="day-row-exercise">
                            <span>{st.exerciseId ? exerciseName(model, st.exerciseId) : slotLabel(row)}</span>
                            <span className="day-row-sets">{st.skipped ? text.plan.skippedRow : setsText(model, st)}</span>
                          </span>
                        );
                      })}
                    </span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {listOpen && !cycleHint && (
        <p className="muted today-cycle-note">
          {fmt(text.plan.cycleNote, { weeks: rules.cycleWeeks, from: rules.nextCycleLighterPct[0], to: rules.nextCycleLighterPct[1] })}
        </p>
      )}

      {!standalone() && <p className="note today-note">{t.install}</p>}

      {confirmDays !== null && (
        <Sheet title={fmt(text.plan.switchTitle, { week, days: confirmDays })} onClose={() => setConfirmDays(null)}>
          <p className="sheet-text">{text.plan.switchText}</p>
          <div className="stack">
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                saveWeekDays(model, pos, confirmDays);
                setConfirmDays(null);
              }}
            >
              {text.plan.switchConfirm}
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
