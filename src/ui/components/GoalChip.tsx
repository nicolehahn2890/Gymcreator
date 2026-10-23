import { planData } from '../../core/model/data';
import type { GoalId } from '../../core/model/types';
import { REX } from '../brand/rex';

/** Ziel als Pille in der Zielfarbe, davor der freigestellte Rex (ohne Hintergrund, damit er erkennbar bleibt). */
export function GoalChip({ goal }: { goal: GoalId }) {
  return (
    <span className="goal-chip">
      <img className="goal-chip-rex" src={REX[goal].icon} alt="" width={26} height={40} />
      <span className="goal-chip-label">{planData.goals.goals[goal].label.de}</span>
    </span>
  );
}
