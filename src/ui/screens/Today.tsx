import { planData } from '../../core/model/data';
import { dayProgress, followingWeek, nextDayIndex } from '../../core/progression/position';
import { weekStats } from '../../core/progression/state';
import { fmt, shortDayName, text } from '../../i18n';
import { AppHeader } from '../components/AppHeader';
import { Check } from '../components/Check';
import { WeekNav } from '../components/WeekNav';
import { dayMinutes, dayRows, planFor, rowContext, type AppModel } from '../state/model';
import './Today.css';

interface Props {
  model: AppModel;
  cycle: number;
  week: number;
  onOpenDay: (day: number) => void;
  onGoToWeek: (cycle: number, week: number) => void;
}

const standalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function Today({ model, cycle, week, onOpenDay, onGoToWeek }: Props) {
  const t = text.today;
  const rules = planData.goals.progression;
  const plan = planFor(model, cycle, week);
  const ctx = rowContext(model, cycle, week);
  const progress = plan.dayPlans.map((d) => dayProgress(ctx, d, { cycle, week }));
  const next = nextDayIndex(progress);
  const nextDay = next === null ? null : plan.dayPlans[next];
  const stats = weekStats(ctx, plan.dayPlans, { cycle, week });
  const trained = progress.filter((p) => p.started).length;
  const following = followingWeek(rules, cycle, week);

  return (
    <main className="screen today">
      <AppHeader />
      <WeekNav model={model} pos={{ cycle, week }} onGoToWeek={onGoToWeek} />

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
          <p className="next-meta">{fmt(t.meta, { n: dayRows(ctx, nextDay, { cycle, week }).filter((r) => r.target > 0).length, min: dayMinutes(ctx, nextDay, { cycle, week }) })}</p>
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

      <h2 className="section-title">{t.allDays}</h2>
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
              </button>
            </li>
          );
        })}
      </ul>

      {!standalone() && <p className="note today-note">{t.install}</p>}
    </main>
  );
}
