import { useContext } from 'react';
import { text } from '../../i18n';
import { DUMBBELL } from '../brand/pixels';
import { PixelGlyph } from '../brand/PixelGlyph';
import { HomeContext } from '../state/home';

/** Logo oben auf jeder Seite; ein Tipp fuehrt auf die Startseite "Heute". */
export function AppHeader({ sub }: { sub?: string }) {
  const goHome = useContext(HomeContext);
  return (
    <header className="app-head">
      <button type="button" className="app-home" aria-label={text.app.home} onClick={goHome}>
        <span className="brand-badge-small">
          <PixelGlyph pattern={DUMBBELL} size={28} />
        </span>
        <span className="wordmark-small">{text.app.name}</span>
      </button>
      {sub && <p className="muted app-sub">{sub}</p>}
    </header>
  );
}
