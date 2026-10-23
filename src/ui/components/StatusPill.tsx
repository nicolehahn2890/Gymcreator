import type { ProgressStatus } from '../../core/progression/compare';
import { text } from '../../i18n';

/** Fortschritt als Text und Farbe (nie nur Farbe). Assistiert: "Weniger/Mehr Hilfe". */
export function StatusPill({ status, assisted }: { status: ProgressStatus; assisted: boolean }) {
  const t = text.workout.status;
  const label = assisted && status === 'w' ? t.wAssisted : assisted && status === 'd' ? t.dAssisted : t[status];
  return <span className={`pill status-${status}`}>{label}</span>;
}
