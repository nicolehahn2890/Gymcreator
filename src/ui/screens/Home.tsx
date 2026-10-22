import type { CSSProperties } from 'react';
import { GOAL_IDS } from '../../core/model/types';
import { planData } from '../../core/model/data';
import { text } from '../../i18n';
import { DUMBBELL, GOAL_GLYPHS } from '../brand/pixels';
import { PixelGlyph } from '../brand/PixelGlyph';
import './Home.css';

// Platzhalter-Startseite (Phase 0): Wortmarke, die drei Ziele, Hinweis "im Aufbau".
export function Home() {
  const goals = planData.goals.goals;
  return (
    <main className="home">
      <header className="brand">
        <span className="brand-badge">
          <PixelGlyph pattern={DUMBBELL} size={40} />
        </span>
        <div>
          <h1 className="wordmark">{text.app.name}</h1>
          <p className="brand-claim">{text.app.claim}</p>
        </div>
      </header>

      <p className="status-pill">{text.home.status}</p>

      <section aria-labelledby="goals-title">
        <h2 id="goals-title" className="section-title">
          {text.home.goalsTitle}
        </h2>
        <ul className="goal-list">
          {GOAL_IDS.map((id) => {
            const goal = goals[id];
            return (
              <li key={id} className="goal-card" style={{ '--goal-color': `var(--${goal.accent})` } as CSSProperties}>
                <span className="goal-glyph">
                  <PixelGlyph pattern={GOAL_GLYPHS[id]} size={36} />
                </span>
                <div>
                  <h3 className="goal-name">{goal.label.de}</h3>
                  <p className="goal-tagline">{goal.tagline.de}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="home-note">{text.home.note}</p>

      <footer className="version-line">
        {text.app.version} {__APP_VERSION__} · {__APP_BUILD__}
      </footer>
    </main>
  );
}
