import { useContext } from 'react';
import { fmt, text } from '../../i18n';
import { HomeContext } from '../state/home';

/** Kopf mit Wortmarke, klebt oben auf jeder Seite; ein Tipp fuehrt auf die Startseite. */
export function AppHeader() {
  const goHome = useContext(HomeContext);
  return (
    <header className="app-head">
      <button type="button" className="app-home" aria-label={fmt(text.app.home, { name: text.app.name })} onClick={goHome}>
        <span className="wordmark">{text.app.name}</span>
      </button>
    </header>
  );
}
