import { useMemo, useState, type CSSProperties } from 'react';
import { exerciseData, planData } from '../../core/model/data';
import { DAY_COUNTS, GOAL_IDS, LEVELS, type DaysPerWeek, type GoalId, type Level, type Profile } from '../../core/model/types';
import { buildPlan } from '../../core/generator/buildPlan';
import { totalSets } from '../../core/generator/validate';
import { fmt, range, shortDayName, text } from '../../i18n';
import { GOAL_GLYPHS } from '../brand/pixels';
import { PixelGlyph } from '../brand/PixelGlyph';
import { Check } from '../components/Check';
import { slotLabel } from '../state/model';
import './Onboarding.css';

const STEPS = 5;
/** Ausstattung, die man nicht abwaehlen kann. */
const ALWAYS = 'bodyweight';

export function Onboarding({ onDone }: { onDone: (profile: Profile) => void }) {
  const t = text.onboarding;
  const goals = planData.goals.goals;
  const levelText: Record<Level, string> = { beginner: t.beginnerText, advanced: t.advancedText };
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [days, setDays] = useState<DaysPerWeek | null>(null);
  const [equipment, setEquipment] = useState<string[]>(exerciseData.equipment);

  const accent = goal ? ({ '--accent': `var(--${goals[goal].accent})` } as CSSProperties) : undefined;
  const ready = [goal, level, days, equipment.length > 0, true][step];

  const profile: Profile | null = goal && level && days ? { goal, level, days, equipment, increments: {}, lang: 'de', createdAt: '' } : null;
  const preview = useMemo(() => (goal && level && days ? buildPlan(planData, { goal, level, days }) : null), [goal, level, days]);

  const toggleEquipment = (id: string) =>
    setEquipment((list) => (list.includes(id) ? list.filter((e) => e !== id) : [...list, id]));

  return (
    <main className="screen onboarding" style={accent}>
      <p className="muted">{fmt(t.step, { n: step + 1, total: STEPS })}</p>

      {step === 0 && (
        <section className="stack">
          <h1 className="screen-title">{t.goalTitle}</h1>
          <p className="muted">{t.goalHint}</p>
          {GOAL_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className="choice"
              aria-pressed={goal === id}
              style={{ '--accent': `var(--${goals[id].accent})` } as CSSProperties}
              onClick={() => setGoal(id)}
            >
              <span className="goal-glyph">
                <PixelGlyph pattern={GOAL_GLYPHS[id]} size={36} />
              </span>
              <span>
                <span className="choice-title">{goals[id].label.de}</span>
                <span className="choice-text">{goals[id].tagline.de}</span>
              </span>
            </button>
          ))}
        </section>
      )}

      {step === 1 && (
        <section className="stack">
          <h1 className="screen-title">{t.levelTitle}</h1>
          {LEVELS.map((id) => (
            <button key={id} type="button" className="choice" aria-pressed={level === id} onClick={() => setLevel(id)}>
              <span>
                <span className="choice-title">{t[id]}</span>
                <span className="choice-text">{levelText[id]}</span>
              </span>
            </button>
          ))}
        </section>
      )}

      {step === 2 && goal && (
        <section className="stack">
          <h1 className="screen-title">{t.daysTitle}</h1>
          <p className="muted">{t.daysHint}</p>
          {DAY_COUNTS.map((n) => (
            <button key={n} type="button" className="choice" aria-pressed={days === n} onClick={() => setDays(n)}>
              <span>
                <span className="choice-title">{fmt(text.common.days, { n })}</span>
                <span className="choice-text">{planData.templates.goals[goal][`${n}`].days.map((d) => shortDayName(d.name)).join(' \u00b7 ')}</span>
              </span>
            </button>
          ))}
        </section>
      )}

      {step === 3 && (
        <section className="stack">
          <h1 className="screen-title">{t.gymTitle}</h1>
          <p className="muted">{t.gymHint}</p>
          <div className="stack" role="group" aria-label={t.gymTitle}>
            {exerciseData.equipment
              .filter((id) => id !== ALWAYS)
              .map((id) => {
                const on = equipment.includes(id);
                return (
                  <button key={id} type="button" className="choice choice-compact" role="checkbox" aria-checked={on} onClick={() => toggleEquipment(id)}>
                    <span className="check-box" aria-hidden="true">
                      {on && <Check />}
                    </span>
                    <span>{text.equipment[id as keyof typeof text.equipment]}</span>
                  </button>
                );
              })}
          </div>
        </section>
      )}

      {step === 4 && preview && profile && (
        <section className="stack">
          <h1 className="screen-title">{t.planTitle}</h1>
          <p className="muted">
            {fmt(t.planSummary, { days: profile.days, sets: totalSets(preview) })}
          </p>
          <p>{t.planHint}</p>
          {preview.dayPlans.map((day) => (
            <article key={day.index} className="card day-preview" style={{ background: `var(--day-${day.letter.toLowerCase()})` }}>
              <h2 className="day-preview-title">{day.name}</h2>
              <ul className="day-preview-list">
                {day.rows.map((row) => (
                  <li key={row.slotId}>
                    <span>{slotLabel(row)}</span>
                    <span className="day-preview-sets">{fmt(text.workout.setsLine, { sets: row.sets, range: range(row.repRange) })}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <div className="note">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              {t.honestTitle}
            </h2>
            <p>{t.honestText}</p>
            <p style={{ marginTop: 8 }}>{t.effortText}</p>
          </div>
        </section>
      )}

      <div className="onboarding-actions">
        {step > 0 && (
          <button type="button" className="btn" onClick={() => setStep(step - 1)}>
            {text.common.back}
          </button>
        )}
        {step < STEPS - 1 ? (
          <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => setStep(step + 1)}>
            {text.common.next}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" disabled={!profile} onClick={() => profile && onDone({ ...profile, createdAt: new Date().toISOString().slice(0, 10) })}>
            {t.start}
          </button>
        )}
      </div>
    </main>
  );
}
