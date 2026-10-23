import { text } from '../../i18n';
import { TABS, type Tab } from '../state/ui';

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label={text.app.name}>
      {TABS.map((t) => (
        <button key={t} type="button" className="tab" aria-current={tab === t ? 'page' : undefined} onClick={() => onChange(t)}>
          {text.tabs[t]}
        </button>
      ))}
    </nav>
  );
}
