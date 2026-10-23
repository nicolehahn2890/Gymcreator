// Peach-Szenarien (tests/*.test.js der Trainingsapp) als Unit-Tests auf dem Kern, gleiche Faelle und
// erwartete Vorwerte/Badges, auf den Slots des Apfel-Plans. Peachs Partnerzeilen entfallen: gleiche Slot-ID = gleiche Zeile.
import { describe, expect, it } from 'vitest';
import type { Entry } from '../model/types';
import { carryOver } from './cycle';
import { combinedWeight, indexEntries } from './entries';
import { findPrevious } from './history';
import { applyExercise, createEntry, exerciseChange } from './inherit';
import { autoExtraSets, suggestWeight } from './rules';
import { rowState, weekStats } from './state';
import { context, entry, plans, rowOf } from './testing';
import { pausedSlotsWithValues, setWeekDays, weekDays } from './week';
import { buildPlan } from '../generator/buildPlan';
import { exerciseData, planData } from '../model/data';

const at = (cycle: number, week: number) => ({ cycle, week });
const prevOf = (entries: Entry[], cycle: number, week: number, slotId: string) => {
  const st = rowState(context(entries), rowOf(slotId), at(cycle, week));
  const p = st.previous?.entry;
  return p ? { w: combinedWeight(p.sets), cycle: p.cycle, week: p.week, day: p.day, orientation: st.previous?.orientation } : null;
};

describe('Vorwert: Vorwoche statt anderer Tag derselben Woche (vorwert-vorwoche)', () => {
  const EX = 'cable_crunch';
  // 4 Tage: Bauch 8-12 an Tag A (abs_8-12_a, Index 0), Tag B (abs_8-12_b, Index 1) und Tag D (abs_8-12_c, Index 3)
  const A = 'abs_8-12_a';
  const B = 'abs_8-12_b';
  const base = [
    entry(1, 12, A, EX, '19', [12, 12]),
    entry(1, 12, B, EX, '16', [12, 12]),
    entry(2, 1, A, EX, '20', [12, 12]),
    entry(2, 1, B, EX, '17', [10, 10]),
    entry(2, 2, A, EX, '21', [12, 12]),
  ];

  it('W2 Tag B: 17 aus Z2 W1 Tag B, nicht 21 aus Tag A derselben Woche', () => {
    expect(prevOf(base, 2, 2, B)).toMatchObject({ w: '17', cycle: 2, week: 1, day: 1 });
  });

  it('W2 Tag B mit 17 x 10/10 wie W1 -> gleich (nicht "weniger" gegen Tag A)', () => {
    const data = [...base, entry(2, 2, B, EX, '17', [10, 10])];
    expect(rowState(context(data), rowOf(B), at(2, 2)).status).toBe('s');
  });

  it('W2 Tag A: 20 aus Z2 W1 Tag A, nicht 17 aus dem spaeteren Tag B', () => {
    expect(prevOf(base, 2, 2, A)).toMatchObject({ w: '20', week: 1, day: 0 });
  });

  it('W3 nach ausgefallener W2 an Tag B: letzter eigener Wert 17, nicht 21 von Tag A', () => {
    expect(prevOf(base, 2, 3, B)).toMatchObject({ w: '17', week: 1, day: 1 });
  });

  it('Z2 W1: eigene Zeile aus dem Zyklus davor (Tag B 16, Tag A 19)', () => {
    expect(prevOf(base, 2, 1, B)).toMatchObject({ w: '16', cycle: 1, week: 12, day: 1 });
    expect(prevOf(base, 2, 1, A)).toMatchObject({ w: '19', cycle: 1, week: 12, day: 0 });
  });

  it('neue Zeile mit der Uebung: juengster Wert aus frueherer Woche, nicht aus dieser', () => {
    // Uebung an Tag D gewaehlt (noch ohne Werte), Tag A dieser Woche schon trainiert
    const data = [...base, entry(2, 4, 'abs_8-12_c', EX, '', []), entry(2, 4, A, EX, '25', [12, 12])];
    expect(prevOf(data, 2, 4, 'abs_8-12_c')).toMatchObject({ w: '21', week: 2, day: 0 });
  });

  it('3-Tage-Woche dazwischen: gleiche Slot-ID ist dieselbe Zeile', () => {
    const data = [
      ...base,
      entry(2, 5, B, EX, '18', [12, 12, 12], { days: 3 }),
      entry(2, 5, A, EX, '26', [12, 12], { days: 3 }),
    ];
    expect(prevOf(data, 2, 6, B)).toMatchObject({ w: '18', week: 5 });
    expect(prevOf(data, 2, 6, A)).toMatchObject({ w: '26', week: 5 });
  });
});

describe('Vorwert am Zyklusstart (vorwert-zyklusstart)', () => {
  const HT = 'hip_thrust_barbell';
  // Zyklus 1: Hip Thrust in drei Bereichen (Tag A 6-8, Tag B 12-15, Tag C 8-12), Gewicht je Woche steigend
  const z1: Entry[] = [];
  for (let w = 1; w <= 12; w++) {
    z1.push(entry(1, w, 'gmax_6-8_a', HT, String(150 + w), [5, 5, 5]));
    z1.push(entry(1, w, 'gmax_12-15_a', HT, String(140 + w), [7, 7]));
    z1.push(entry(1, w, 'gmax_8-12_a', HT, String(125 + w), [9, 9, 9]));
  }
  // Zyklus 2, Woche 1: Uebungen an Tag B und C gewaehlt; danach Tag A trainiert und an Tag B 142 kg eingetippt
  const chosen = [...z1, entry(2, 1, 'gmax_12-15_a', HT, '', []), entry(2, 1, 'gmax_8-12_a', HT, '', [])];
  const z2w1 = [
    ...z1,
    entry(2, 1, 'gmax_6-8_a', HT, '145', [8, 10, 10]),
    entry(2, 1, 'gmax_12-15_a', HT, '142', []),
    entry(2, 1, 'gmax_8-12_a', HT, '', []),
  ];

  it('Tag B 12-15: 152 aus Z1 W12 (gleicher Bereich), nicht 145 von Tag A 6-8 derselben Woche', () => {
    expect(prevOf(z2w1, 2, 1, 'gmax_12-15_a')).toMatchObject({ w: '152', cycle: 1, week: 12, orientation: false });
  });

  it('Tag C 8-12: 137 aus Z1 W12, nicht das eben getippte Gewicht von Tag B', () => {
    expect(prevOf(z2w1, 2, 1, 'gmax_8-12_a')).toMatchObject({ w: '137', cycle: 1, week: 12, orientation: false });
  });

  it('Training an anderen Tagen derselben Woche aendert keinen Vorwert', () => {
    for (const slot of ['gmax_12-15_a', 'gmax_8-12_a']) expect(prevOf(z2w1, 2, 1, slot)).toEqual(prevOf(chosen, 2, 1, slot));
  });

  it('Woche 2 vergleicht mit Woche 1 desselben Zyklus', () => {
    const data = [...z1, entry(2, 1, 'gmax_12-15_a', HT, '142', [8, 8]), entry(2, 1, 'gmax_8-12_a', HT, '130', [10, 10, 10])];
    expect(prevOf(data, 2, 2, 'gmax_12-15_a')).toMatchObject({ w: '142', cycle: 2, week: 1 });
    expect(prevOf(data, 2, 2, 'gmax_8-12_a')).toMatchObject({ w: '130', cycle: 2, week: 1 });
  });

  it('zwei Zeilen mit derselben Uebung und demselben Bereich: jede vergleicht mit ihrer Vorwoche', () => {
    const EX = 'cable_crunch';
    const data = [
      entry(2, 1, 'abs_8-12_a', EX, '15', [12, 12]),
      entry(2, 1, 'abs_8-12_b', EX, '20', [12, 12]),
      entry(2, 2, 'abs_8-12_b', EX, '22', [10, 10]),
    ];
    expect(prevOf(data, 2, 2, 'abs_8-12_a')).toMatchObject({ w: '15', week: 1 });
  });

  it('gleicher Bereich nur aus aelterem Zyklus als dem zuletzt trainierten -> Orientierung mit dem juengsten Wert', () => {
    const GB = 'glute_bridge_barbell';
    const data = [entry(1, 12, 'gmax_12-15_a', GB, '100', [8, 8]), entry(2, 2, 'gmax_6-8_a', GB, '110', [6, 6, 6]), entry(3, 1, 'gmax_12-15_a', GB, '', [])];
    expect(prevOf(data, 3, 1, 'gmax_12-15_a')).toMatchObject({ w: '110', cycle: 2, week: 2, orientation: true });
    const st = rowState(context(data), rowOf('gmax_12-15_a'), at(3, 2));
    expect(st.noCompare).toBe(true);
    expect(st.status).toBeNull();
  });
});

describe('Woche 1 und 2 zeigen denselben Vorwert (verlauf-woche1-2)', () => {
  it('fuer jede Zeile des 4-Tage-Plans', () => {
    const data: Entry[] = [];
    // wie in Peachs Test: je Tag bekommt die n-te Zeile einer Kategorie die n-te Uebung dieser Kategorie
    const exFor = (cat: string, n: number) => exerciseData.exercises.filter((e) => e.category === cat)[n]?.id ?? '';
    for (const day of plans[4].dayPlans) {
      const count: Record<string, number> = {};
      for (const row of day.rows) {
        const n = (count[row.category] = (count[row.category] ?? -1) + 1);
        for (let w = 10; w <= 12; w++) data.push(entry(1, w, row.slotId, exFor(row.category, n), String(50 + w + day.index), [9, 9]));
      }
    }
    // Zyklus 2 noch ohne Eintraege: die Uebungen kommen aus der Uebernahme
    const ctx = context(data, carryOver(data, 2, plans[4], categoryOf));
    for (const day of plans[4].dayPlans) {
      for (const row of day.rows) {
        const w1 = rowState(ctx, row, at(2, 1)).previous;
        const w2 = rowState(ctx, row, at(2, 2)).previous;
        expect(w1, row.slotId).not.toBeNull();
        expect(w2, row.slotId).toEqual(w1);
      }
    }
    const ht = rowState(ctx, rowOf('gmax_6-8_a'), at(2, 1)).previous;
    expect(ht).toMatchObject({ orientation: false, entry: { cycle: 1, week: 12, slotId: 'gmax_6-8_a' } });
  });
});

describe('Steigerungs-Hinweis (steigerung)', () => {
  const HT = 'hip_thrust_barbell';
  const w1 = [
    entry(3, 1, 'gmax_6-8_a', HT, '140', [8, 7, 6]),
    entry(3, 1, 'gmax_8-12_a', 'cable_kickback_standing', '20', [11, 12]),
    entry(3, 1, 'back_6-10_a', 'assisted_pull_up_wide', '25', [10, 9, 8]),
  ];
  const due = (data: Entry[], week: number, slot: string) => rowState(context(data), rowOf(slot), at(3, week)).increaseDue;

  it('Woche 1: kein Hinweis', () => {
    expect(due(w1, 1, 'gmax_6-8_a')).toBe(false);
  });

  it('Woche 2: Obergrenze im 1. Satz erreicht -> Hinweis; 11 von 8-12 -> keiner', () => {
    expect(due(w1, 2, 'gmax_6-8_a')).toBe(true);
    expect(due(w1, 2, 'gmax_8-12_a')).toBe(false);
  });

  it('gleiches Gewicht -> bleibt, mehr Gewicht -> weg', () => {
    expect(due([...w1, entry(3, 2, 'gmax_6-8_a', HT, '140', [])], 2, 'gmax_6-8_a')).toBe(true);
    expect(due([...w1, entry(3, 2, 'gmax_6-8_a', HT, '145', [])], 2, 'gmax_6-8_a')).toBe(false);
  });

  it('alle Saetze eingetragen -> weg und Haken; letzten Satz leeren -> wieder da', () => {
    const doneData = [...w1, entry(3, 2, 'gmax_6-8_a', HT, '140', [8, 8, 8])];
    const st = rowState(context(doneData), rowOf('gmax_6-8_a'), at(3, 2));
    expect(st.done).toBe(true);
    expect(st.increaseDue).toBe(false);
    expect(due([...w1, entry(3, 2, 'gmax_6-8_a', HT, '140', [8, 8, null])], 2, 'gmax_6-8_a')).toBe(true);
    expect(due([...w1, entry(3, 2, 'gmax_6-8_a', HT, '130', [8, 8, 8])], 2, 'gmax_6-8_a')).toBe(false);
  });

  it('assistiert: Hinweis bei Obergrenze, weg bei weniger Hilfe', () => {
    expect(due(w1, 2, 'back_6-10_a')).toBe(true);
    expect(due([...w1, entry(3, 2, 'back_6-10_a', 'assisted_pull_up_wide', '20', [])], 2, 'back_6-10_a')).toBe(false);
  });

  it('Vorblaettern: W3 ohne W2 -> kein Hinweis, Vorwert aus W1 bleibt sichtbar', () => {
    expect(due(w1, 3, 'gmax_6-8_a')).toBe(false);
    expect(prevOf(w1, 3, 3, 'gmax_6-8_a')).toMatchObject({ week: 1 });
    const w2 = [...w1, entry(3, 2, 'gmax_6-8_a', HT, '145', [8, 8, 7])];
    expect(due(w2, 3, 'gmax_6-8_a')).toBe(true);
    expect(due(w2, 4, 'gmax_6-8_a')).toBe(false);
  });
});

describe('Uebungswechsel (uebungswechsel)', () => {
  const HT = 'hip_thrust_barbell';
  const HM = 'hip_thrust_machine';
  const S = 'gmax_6-8_a';
  const w1 = [entry(3, 1, S, HT, '100', [8, 8, 7]), entry(3, 1, 'gmax_8-12_a', 'cable_kickback_standing', '20', [12, 12])];
  const state = (data: Entry[], week: number, slot = S) => rowState(context(data), rowOf(slot), at(3, week));
  const row = rowOf(S);

  it('W2 erbt die Uebung aus W1, andere Wahl fragt nach', () => {
    const st = state(w1, 2);
    expect(st.exerciseId).toBe(HT);
    expect(exerciseChange(undefined, 2, st.inheritedExerciseId, HM)).toBe('ask');
  });

  it('"nur diese Woche": W3 zeigt wieder die Standard-Uebung mit ihrem Vorwert aus W1', () => {
    const once = { ...applyExercise(createEntry(row, { cycle: 3, week: 2, day: row.day }, HT, 0), HM, true, HT), sets: [{ w: '90', r: null }] };
    expect(once).toMatchObject({ exerciseId: HM, once: true, baseExerciseId: HT });
    const data = [...w1, once];
    const st3 = state(data, 3);
    expect(st3.exerciseId).toBe(HT);
    expect(st3.previous?.entry.week).toBe(1);
  });

  it('"ab jetzt": ohne Kennzeichen, Vorwert der neuen Uebung aus W2, W4 und W6 (ueber leere W5) erben', () => {
    const once = { ...applyExercise(createEntry(row, { cycle: 3, week: 2, day: row.day }, HT, 0), HM, true, HT), sets: [{ w: '90', r: null }] };
    const w3 = applyExercise(createEntry(row, { cycle: 3, week: 3, day: row.day }, HT, 0), HM, false, HT);
    expect(w3.once).toBeUndefined();
    expect(w3.baseExerciseId).toBeUndefined();
    const data = [...w1, once, w3];
    expect(state(data, 3).previous?.entry.week).toBe(2);
    expect(state(data, 4).exerciseId).toBe(HM);
    expect(state(data, 6).exerciseId).toBe(HM);
  });

  it('einmaligen Wechsel nachtraeglich zu "ab jetzt" machen fragt erneut, Gewicht bleibt', () => {
    const once = { ...applyExercise(createEntry(row, { cycle: 3, week: 2, day: row.day }, HT, 0), HM, true, HT), sets: [{ w: '90', r: null }] };
    expect(exerciseChange(once, 2, HT, HM)).toBe('ask');
    const fixed = applyExercise(once, HM, false, HT);
    expect(fixed.once).toBeUndefined();
    expect(fixed.sets).toEqual([{ w: '90', r: null }]);
  });

  it('keine Frage: vererbte Uebung, unveraenderte Auswahl, ohne Vorgeschichte, Woche 1, Leeren', () => {
    expect(exerciseChange(undefined, 4, HM, HM)).toBe('set');
    const plain = applyExercise(createEntry(row, { cycle: 3, week: 4, day: row.day }, HM, 0), 'glute_bridge_barbell', false, HM);
    expect(exerciseChange(plain, 4, HM, 'glute_bridge_barbell')).toBe('unchanged');
    expect(exerciseChange(undefined, 4, undefined, 'abduction_machine')).toBe('set');
    expect(exerciseChange(undefined, 1, HT, HM)).toBe('set');
    expect(exerciseChange(undefined, 5, HT, '')).toBe('set');
  });

  it('naechster Zyklus uebernimmt die Standard-Uebung, nicht den einmaligen Wechsel aus W12', () => {
    const w12 = { ...applyExercise(createEntry(row, { cycle: 3, week: 12, day: row.day }, HM, 0), 'kickback_machine', true, HM), sets: [{ w: '40', r: 8 }] };
    const carried = carryOver([...w1, w12], 4, plans[4], categoryOf);
    expect(carried[S]).toBe(HM);
  });
});

const categoryOf = (id: string) => exerciseData.exercises.find((e) => e.id === id)?.category;

describe('Auto-Zusatzsatz', () => {
  const S = 'gmax_8-12_a';
  const EX = 'cable_kickback_standing';
  const flat = (weeks: number) => Array.from({ length: weeks }, (_, i) => entry(1, i + 1, S, EX, '20', [10, 10]));
  const auto = (data: Entry[], week: number) => autoExtraSets(indexEntries(data), planData.goals.progression, () => false, { cycle: 1, week, slotId: S });

  it('nach 3 stagnierenden Wochenvergleichen, fruehestens Woche 5', () => {
    expect(auto(flat(3), 4)).toBe(0);
    expect(auto(flat(4), 5)).toBe(planData.goals.progression.autoExtraSets);
  });

  it('eine Steigerung oder ein Uebungswechsel bricht die Serie', () => {
    const better = flat(4).map((e) => (e.week === 3 ? { ...e, sets: [{ w: '22.5', r: 10 }, { w: '22.5', r: 10 }] } : e));
    expect(auto(better, 5)).toBe(0);
    const swapped = flat(4).map((e) => (e.week === 2 ? { ...e, exerciseId: 'kickback_machine' } : e));
    expect(auto(swapped, 5)).toBe(0);
  });

  it('Saetze gesamt hoechstens limits.maxSetsPerSlot', () => {
    const data = [...flat(4), entry(1, 5, S, EX, '20', [], { extraSets: 4 })];
    const st = rowState(context(data), rowOf(S), at(1, 5));
    expect(st.autoExtra).toBe(1);
    expect(st.totalSets).toBe(planData.goals.limits.maxSetsPerSlot);
  });

  it('Zusatzsaetze erben nur von der direkten Vorwoche', () => {
    const data = [entry(1, 1, S, EX, '20', [10, 10], { extraSets: 1 })];
    expect(rowState(context(data), rowOf(S), at(1, 2)).extraSets).toBe(1);
    expect(rowState(context(data), rowOf(S), at(1, 3)).extraSets).toBe(0);
  });
});

describe('Flexible Woche', () => {
  it('Wochenart: Vorauswahl = letzte festgelegte Woche davor, sonst Profil', () => {
    let weeks = setWeekDays([], 1, 2, 3);
    expect(weekDays(weeks, 1, 1, 4)).toBe(4);
    expect(weekDays(weeks, 1, 2, 4)).toBe(3);
    expect(weekDays(weeks, 1, 5, 4)).toBe(3);
    weeks = setWeekDays(weeks, 1, 4, 5);
    expect(weekDays(weeks, 1, 5, 4)).toBe(5);
    expect(weekDays(weeks, 2, 1, 4)).toBe(4);
    expect(setWeekDays(weeks, 1, 4, 3).filter((w) => w.week === 4)).toEqual([{ cycle: 1, week: 4, days: 3 }]);
  });

  it('Rueckfrage nur, wenn Slots mit Werten in der neuen Wochenart pausieren', () => {
    const data = [entry(1, 3, 'gmed_12-15_b', 'abduction_machine', '40', [12, 12]), entry(1, 3, 'gmax_6-8_a', 'hip_thrust_barbell', '100', [8])];
    expect(plans[3].paused).toContain('gmed_12-15_b');
    expect(pausedSlotsWithValues(data, 1, 3, plans[3])).toEqual(['gmed_12-15_b']);
    expect(pausedSlotsWithValues(data, 1, 3, plans[4])).toEqual([]);
  });
});

describe('Uebernahme in den neuen Zyklus', () => {
  it('gleiche Slot-ID zuerst, sonst gleiche Kategorie und Bereich, pro Tag keine Dopplung', () => {
    const data = [
      entry(1, 12, 'gmax_6-8_a', 'hip_thrust_barbell', '150', [6]),
      entry(1, 12, 'gmax_8-12_a', 'kickback_machine', '40', [12]),
      entry(1, 11, 'gmed_8-12_a', 'abduction_machine', '50', [12]),
      entry(1, 12, 'gmed_8-12_a', 'cable_abduction_lying', '10', [12]),
    ];
    const carried = carryOver(data, 2, plans[4], categoryOf);
    expect(carried['gmax_6-8_a']).toBe('hip_thrust_barbell');
    expect(carried['gmax_8-12_a']).toBe('kickback_machine');
    expect(carried['gmed_8-12_a']).toBe('cable_abduction_lying');
    const dayA = plans[4].dayPlans[0]?.rows.map((r) => carried[r.slotId]).filter(Boolean) ?? [];
    expect(new Set(dayA).size).toBe(dayA.length);
  });

  it('Zeilen mit eigener Auswahl im neuen Zyklus bleiben, ihre Uebungen gelten am selben Tag als vergeben', () => {
    // V-Form 4 Tage, Tag A: zwei Ruecken-Zeilen (back_6-10_a, back_6-8_a)
    const vform = buildPlan(planData, { goal: 'vform', level: 'advanced', days: 4 });
    const own = (cycle: number, week: number, slotId: string, repRange: string): Entry => ({
      cycle, week, slotId, day: 0, exerciseId: 'barbell_row', sets: [], extraSets: 0, category: 'back', repRange, baseSets: 3,
    });
    const carried = carryOver([own(1, 12, 'back_6-8_a', '6-8'), own(2, 1, 'back_6-10_a', '6-10')], 2, vform, categoryOf);
    expect(carried['back_6-10_a']).toBeUndefined();
    expect(carried['back_6-8_a']).toBeUndefined();
  });

  it('ohne frueheren Zyklus keine Uebernahme', () => {
    expect(carryOver([entry(1, 3, 'gmax_6-8_a', 'hip_thrust_barbell', '150', [6])], 1, plans[4], categoryOf)).toEqual({});
  });
});

describe('Wochenbilanz und Hilfen', () => {
  it('zaehlt nur Uebungen mit Vergleich und Wiederholungen', () => {
    const data = [
      entry(1, 1, 'gmax_6-8_a', 'hip_thrust_barbell', '100', [8, 8, 8]),
      entry(1, 1, 'gmax_8-12_a', 'kickback_machine', '40', [12, 12]),
      entry(1, 2, 'gmax_6-8_a', 'hip_thrust_barbell', '105', [8, 8, 8]),
      entry(1, 2, 'gmax_8-12_a', 'kickback_machine', '40', [12, 11]),
    ];
    expect(weekStats(context(data), plans[4].dayPlans, at(1, 2))).toEqual({ total: 2, improved: 1, pct: 50 });
    expect(weekStats(context(data), plans[4].dayPlans, at(1, 1))).toEqual({ total: 0, improved: 0, pct: 0 });
  });

  it('Satzgewichte werden wie Peachs Gewichtsrahmen gelesen', () => {
    expect(combinedWeight([{ w: '40', r: 10 }, { w: '45', r: 8 }, { w: '', r: null }])).toBe('40-45');
    expect(combinedWeight([{ w: '27,5', r: 10 }, { w: '27.5', r: 10 }])).toBe('27.5');
    expect(combinedWeight([])).toBe('');
    // heruntergesetzter Rahmen ist weniger Leistung
    const data = [entry(1, 1, 'gmax_6-8_a', 'hip_thrust_barbell', '45', [8, 8, 8])];
    const lowered = { ...entry(1, 2, 'gmax_6-8_a', 'hip_thrust_barbell', '45', [8, 8, 8]), sets: [{ w: '45', r: 8 }, { w: '40', r: 8 }, { w: '40', r: 8 }] };
    expect(rowState(context([...data, lowered]), rowOf('gmax_6-8_a'), at(1, 2)).status).toBe('d');
  });

  it('Gewichtsvorschlag mit Schrittweite je Ausstattung', () => {
    const inc = exerciseData.increments;
    expect(suggestWeight('40', inc.barbell ?? null)).toBe(42.5);
    expect(suggestWeight('20-22', inc.dumbbell ?? null)).toBe(24);
    expect(suggestWeight('60', inc.machine ?? null)).toBeNull();
    expect(suggestWeight('25', 2.5, true)).toBe(22.5);
    expect(suggestWeight('', 2.5)).toBeNull();
  });

  it('findPrevious ohne Uebung liefert nichts', () => {
    expect(findPrevious(indexEntries([]), { cycle: 1, week: 2, slotId: 'x', exerciseId: '', repRange: '8-12' })).toBeNull();
  });
});
