import { planData } from '../../core/model/data';
import type { Entry } from '../../core/model/types';
import { combinedWeight, getEntry, hasValues } from '../../core/progression/entries';
import { weekStats } from '../../core/progression/state';
import { parseWeight } from '../../core/progression/weight';
import { fmt, num, range, shortDayName, text } from '../../i18n';
import { AppHeader } from '../components/AppHeader';
import type { Position } from '../state/actions';
import { exerciseName, planFor, rowContext, type AppModel } from '../state/model';
import './Progress.css';

interface Props {
  model: AppModel;
  pos: Position;
}

/**
 * Verlauf je Plan-Zeile im aktuellen Zyklus. Gezeigt wird die zuletzt trainierte Uebung; Wochen mit einer
 * anderen Uebung oder einem anderen Bereich sind grau und zaehlen nicht zum Zuwachs (wie Peach).
 */
export function Progress({ model, pos }: Props) {
  const t = text.progress;
  const weeks = planData.goals.progression.cycleWeeks;
  const plan = planFor(model, pos.cycle, pos.week);
  const stats = weekStats(rowContext(model, pos.cycle, pos.week), plan.dayPlans, pos);
  const anyData = model.data.entries.some((e) => e.cycle === pos.cycle && hasValues(e));

  return (
    <main className="screen">
      <AppHeader />
      <h1 className="screen-title">{t.title}</h1>
      <p className="muted">{fmt(t.cycle, { cycle: pos.cycle })}</p>
      {stats.total > 0 && <p className="note progress-balance">{fmt(t.week, { week: pos.week, improved: stats.improved, total: stats.total })}</p>}
      {!anyData && <p className="note progress-balance">{t.empty}</p>}

      {plan.dayPlans.map((day) => {
        const rows = day.rows
          .map((row) => {
            const list = Array.from({ length: weeks }, (_, i) => getEntry(model.index, pos.cycle, i + 1, row.slotId));
            const latest = [...list].reverse().find((e): e is Entry => !!e && hasValues(e));
            return latest ? { row, list, latest } : null;
          })
          .filter((x) => x !== null);
        if (!rows.length) return null;
        return (
          <section key={day.index} className="progress-day">
            <h2 className="pill progress-day-label" style={{ background: `var(--day-${day.letter.toLowerCase()})` }}>
              {day.letter} {'·'} {shortDayName(day.name)}
            </h2>
            {rows.map(({ row, list, latest }) => {
              const assisted = model.exercises.get(latest.exerciseId)?.assisted ?? false;
              const same = (e: Entry | undefined) => !!e && e.exerciseId === latest.exerciseId && e.repRange === latest.repRange;
              // Wert je Woche; null = kein Gewicht. 0 kg zaehlt nur bei Gegengewicht (ohne Hilfe = Bestwert).
              const values = list.map((e) => {
                if (!e || !hasValues(e)) return null;
                const w = combinedWeight(e.sets);
                return w === '' || (!assisted && parseWeight(w) <= 0) ? null : parseWeight(w, assisted);
              });
              const known = values.filter((v): v is number => v !== null);
              const max = Math.max(...known, 1);
              const min = Math.min(...known, max);
              const sameValues = list.flatMap((e, i) => (same(e) && values[i] != null ? [values[i] ?? 0] : []));
              const first = sameValues[0] ?? 0;
              const last = sameValues[sameValues.length - 1] ?? 0;
              const gain = sameValues.length >= 2 ? (assisted ? first - last : last - first) : 0;
              return (
                <article key={row.slotId} className="card progress-card">
                  <div className="row-between">
                    <h3 className="progress-name">{exerciseName(model, latest.exerciseId)}</h3>
                    {gain > 0 && <span className="pill status-w">{fmt(assisted ? t.gainAssisted : t.gain, { kg: num(gain) })}</span>}
                  </div>
                  <p className="muted">{range(latest.repRange)}</p>
                  <div className="bars" aria-hidden="true">
                    {values.map((v, i) => {
                      // Gegengewicht: weniger Hilfe = hoeherer Balken
                      const score = v === null ? 0 : assisted ? max + min - v : v;
                      const height = v === null ? 0 : Math.max(8, Math.round((score / max) * 100));
                      const cls = v === null ? '' : !same(list[i]) ? ' other' : i + 1 === pos.week ? ' current' : '';
                      return (
                        <span key={i} className="bar">
                          <span className={`bar-fill${cls}`} style={{ height: `${height}%` }} />
                        </span>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>
        );
      })}
    </main>
  );
}
