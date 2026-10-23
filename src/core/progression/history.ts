// Vorwert einer Zeile. Port aus Peach (findLastExData), Regeln 1:1:
//  - Vorwerte haengen an Uebung + Wdh.-Bereich, nicht am Platz im Plan.
//  - Die laufende Woche zaehlt nie (nur fruehere Wochen).
//  1. gleicher Bereich aus dem aktuellen Zyklus,
//  2. sonst gleicher Bereich aus dem zuletzt trainierten Zyklus davor,
//  3. sonst der juengste Wert in einem anderen Bereich, nur zur Orientierung (kein Vergleich).
//  Steht die Uebung an mehreren Tagen, gewinnt die eigene Zeile (gleiche Slot-ID) aus demselben Zyklus.
// Peachs Partnerzeilen (3/4 Tage) entfallen: gleiche Slot-ID = gleiche Zeile.
import type { Entry, RepRange } from '../model/types';
import { entryOrder, type EntryIndex } from './entries';

export interface PreviousQuery {
  cycle: number;
  week: number;
  slotId: string;
  exerciseId: string;
  repRange: RepRange;
}

export interface PreviousResult {
  entry: Entry;
  /** true = anderer Wdh.-Bereich, nur Orientierung, kein Vergleich. */
  orientation: boolean;
}

export function findPrevious(index: EntryIndex, q: PreviousQuery): PreviousResult | null {
  if (!q.exerciseId) return null;
  const weekStart = entryOrder({ cycle: q.cycle, week: q.week, day: 0 });
  const before = (index.byExercise.get(q.exerciseId) ?? []).filter((e) => entryOrder(e) < weekStart);

  // Juengster passender Eintrag; bei gleichem Stand die eigene Zeile
  const latest = (match: (e: Entry) => boolean = () => true): Entry | undefined => {
    let hit: Entry | undefined;
    for (const e of before) {
      if (!match(e)) continue;
      const diff = hit ? entryOrder(e) - entryOrder(hit) : 1;
      if (diff > 0 || (diff === 0 && e.slotId === q.slotId)) hit = e;
    }
    return hit;
  };

  const any = latest();
  if (!any) return null;
  const same = latest((e) => e.repRange === q.repRange);
  let hit = any;
  if (same && same.cycle === q.cycle) {
    hit = same;
  } else if (same) {
    const lastTrainedCycle = latest((e) => e.cycle !== q.cycle);
    if (lastTrainedCycle && lastTrainedCycle.cycle === same.cycle) hit = same;
  }
  if (hit === same) {
    const cycle = hit.cycle;
    const own = latest((e) => e.repRange === q.repRange && e.cycle === cycle && e.slotId === q.slotId);
    if (own) hit = own;
  }
  return { entry: hit, orientation: hit.repRange !== q.repRange };
}
