import { useState } from 'react';
import { planData } from '../../core/model/data';
import { hasValues } from '../../core/progression/entries';
import { followingWeek } from '../../core/progression/position';
import { fmt, text } from '../../i18n';
import type { Position } from '../state/actions';
import type { AppModel } from '../state/model';
import { Sheet } from './Sheet';

interface Props {
  model: AppModel;
  pos: Position;
  onGoToWeek: (cycle: number, week: number) => void;
}

/** Wochenwahl: Pfeile fuer vorige/naechste Woche, Tipp auf die Mitte oeffnet das Raster des Zyklus. */
export function WeekNav({ model, pos, onGoToWeek }: Props) {
  const t = text.plan;
  const rules = planData.goals.progression;
  const [picker, setPicker] = useState(false);
  const next = followingWeek(rules, pos.cycle, pos.week);
  const prev = pos.week > 1 ? { cycle: pos.cycle, week: pos.week - 1 } : pos.cycle > 1 ? { cycle: pos.cycle - 1, week: rules.cycleWeeks } : null;
  const weeksWithEntries = new Set(model.data.entries.filter((e) => e.cycle === pos.cycle && hasValues(e)).map((e) => e.week));

  return (
    <>
      <div className="week-nav">
        <button type="button" className="btn btn-icon" aria-label={t.prevWeek} disabled={!prev} onClick={() => prev && onGoToWeek(prev.cycle, prev.week)}>
          <Arrow dir="left" />
        </button>
        <button type="button" className="btn week-label" onClick={() => setPicker(true)}>
          {fmt(text.today.weekLine, { cycle: pos.cycle, week: pos.week, weeks: rules.cycleWeeks })}
        </button>
        <button type="button" className="btn btn-icon" aria-label={t.nextWeek} onClick={() => onGoToWeek(next.cycle, next.week)}>
          <Arrow dir="right" />
        </button>
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
    </>
  );
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={dir === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
