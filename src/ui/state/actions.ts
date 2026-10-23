// Aenderungen aus der Oberflaeche: Eintraege anlegen/aendern, Wochenart festhalten, Profil uebernehmen, Kurz-Modus.
import { buildPlan } from '../../core/generator/buildPlan';
import { planData } from '../../core/model/data';
import type { DaysPerWeek, Entry, Plan, PlanDay, PlanRow, Profile, SetValue, ShortSlot, Week } from '../../core/model/types';
import { getEntry, hasValues } from '../../core/progression/entries';
import { createEntry } from '../../core/progression/inherit';
import { followingWeek, latestWeek } from '../../core/progression/position';
import type { RowState } from '../../core/progression/state';
import { carryShort, shortSets } from '../../core/progression/short';
import { pausedSlotsWithValues } from '../../core/progression/week';
import { dayRows, daysFor, planFor, rowContext, shortContext, type AppModel } from './model';
import { store } from './store';

export interface Position {
  cycle: number;
  week: number;
}

/**
 * Gespeicherter Eintrag oder ein neuer mit der aktuell angezeigten Uebung und Zusatzsaetzen. Hat der
 * gespeicherte Eintrag noch keine Werte, uebernimmt er Bereich, Saetze und Tag aus dem aktuellen Plan.
 */
export function entryForEdit(model: AppModel, row: PlanRow, pos: Position, day: number, st: RowState): Entry {
  const stored = getEntry(model.index, pos.cycle, pos.week, row.slotId);
  if (!stored) return createEntry(row, { ...pos, day }, st.exerciseId, st.extraSets);
  return hasValues(stored) ? stored : { ...stored, day, category: row.category, repRange: row.repRange, baseSets: row.sets };
}

/** Zusatzsaetze setzen; Werte entfernter Saetze werden geloescht, damit sie in spaeteren Vergleichen nicht mitzaehlen. */
export function withExtraSets(entry: Entry, extraSets: number, totalSets: number): Entry {
  return { ...entry, extraSets, sets: entry.sets.slice(0, totalSets) };
}

const isBefore = (a: Position, b: Position) => a.cycle < b.cycle || (a.cycle === b.cycle && a.week < b.week);

/** Aktuelle Woche: die angezeigte, aber nie eine vor der juengsten Woche mit Werten (der Verlauf bleibt, wie er war). */
function currentWeek(model: AppModel, pos: Position): Position {
  const latest = latestWeek(model.index);
  return isBefore(pos, latest) ? latest : pos;
}

/** Wochenart einer Woche speichern; ein Kurz-Modus bleibt fuer Tage, die es im neuen Plan genauso gibt. */
function putDays(model: AppModel, at: Position, days: DaysPerWeek, keepShort: boolean): void {
  const existing = model.data.weeks.find((w) => w.cycle === at.cycle && w.week === at.week);
  const short = keepShort ? carryShort(existing?.short, planFor(model, at.cycle, at.week).dayPlans, model.plans[days].dayPlans) : undefined;
  void store.putWeek({ cycle: at.cycle, week: at.week, days, ...(short && { short }) });
}

/**
 * Speichert ein geaendertes Profil (Einstellungen oder "Plan neu einrichten"); der Verlauf bleibt. Ein neues Ziel
 * hebt den Kurz-Modus auf, er wurde fuer den alten Plan berechnet. Gewaehlte Tage (`daysChosen`) gelten ab der
 * aktuellen Woche, auch wenn sie dem bisherigen Standard entsprechen; fielen dort Zeilen mit Werten weg, ab der
 * folgenden. Spaetere Wochen erben das. Rueckgabe: die folgende Woche, wenn die Tage erst dort gelten, sonst null.
 */
export function saveProfile(model: AppModel, pos: Position, next: Profile, daysChosen: boolean): Position | null {
  void store.saveProfile(next);
  const newGoal = next.goal !== model.profile.goal;
  if (newGoal) for (const w of model.data.weeks) if (w.short) void store.putWeek({ cycle: w.cycle, week: w.week, days: w.days });
  if (!daysChosen) return null;
  const cur = currentWeek(model, pos);
  if (next.days === daysFor(model, cur.cycle, cur.week)) return null;
  const plan = buildPlan(planData, { goal: next.goal, days: next.days });
  if (!pausedSlotsWithValues(model.data.entries, cur.cycle, cur.week, plan).length) {
    putDays(model, cur, next.days, !newGoal);
    return null;
  }
  const from = followingWeek(planData.goals.progression, cur.cycle, cur.week);
  putDays(model, from, next.days, !newGoal);
  return from;
}

/**
 * Wochenart der angezeigten Woche (Plan). Ab der aktuellen Woche wird sie auch der Standard im Profil: Folgende
 * Wochen und Zyklen behalten sie, bis sie wieder geaendert wird (wie Peach).
 */
export function saveWeekDays(model: AppModel, pos: Position, days: DaysPerWeek): void {
  putDays(model, pos, days, true);
  if (!isBefore(pos, latestWeek(model.index)) && days !== model.profile.days) void store.saveProfile({ ...model.profile, days });
}

/** Speichert den Eintrag; beim ersten Eintrag einer Woche wird die Wochenart festgehalten. */
export function saveEntry(model: AppModel, plan: Plan, entry: Entry): void {
  const known = model.data.weeks.some((w) => w.cycle === entry.cycle && w.week === entry.week);
  if (!known) void store.putWeek({ cycle: entry.cycle, week: entry.week, days: plan.days });
  void store.putEntry(entry);
}

/**
 * Setzt Gewicht oder Wiederholungen eines Satzes. Das Gewicht wandert in die folgenden Saetze ohne
 * Wiederholungen mit, wenn dort nichts oder bisher dasselbe Gewicht stand (spart Tippen; beim Tippen
 * von "27,5" kommt so nicht nur die erste Ziffer an).
 */
export function withSetValue(entry: Entry, totalSets: number, index: number, patch: Partial<SetValue>): Entry {
  const length = Math.max(totalSets, entry.sets.length, index + 1);
  const sets: SetValue[] = Array.from({ length }, (_, i) => entry.sets[i] ?? { w: '', r: null });
  const current = sets[index] ?? { w: '', r: null };
  sets[index] = { ...current, ...patch };
  if (patch.w !== undefined) {
    for (let i = index + 1; i < totalSets; i++) {
      const s = sets[i];
      if (s && s.r === null && (s.w.trim() === '' || s.w === current.w)) sets[i] = { ...s, w: patch.w };
    }
  }
  // leere Saetze am Ende nicht speichern
  while (sets.length && sets[sets.length - 1]?.w === '' && sets[sets.length - 1]?.r === null) sets.pop();
  return { ...entry, sets };
}

/** Kurz-Modus fuer einen Tag an- oder ausschalten (Auswahl: core/progression/short.ts). Gilt nur fuer diese Woche. */
export function setShort(model: AppModel, pos: Position, day: PlanDay, on: boolean): void {
  const existing = model.data.weeks.find((w) => w.cycle === pos.cycle && w.week === pos.week);
  const inDay = new Set(day.rows.map((r) => r.slotId));
  // "Normal" ohne aktiven Kurz-Modus: nichts speichern (ein Wochen-Eintrag legt sonst die Wochenart fest)
  if (!on && !Object.keys(existing?.short ?? {}).some((slotId) => inDay.has(slotId))) return;
  const short: Record<string, ShortSlot> = Object.fromEntries(Object.entries(existing?.short ?? {}).filter(([slotId]) => !inDay.has(slotId)));
  const sets = on ? shortSets(dayRows(rowContext(model, pos.cycle, pos.week), day, pos), shortContext(model)) : null;
  const minutes = planData.goals.short.minutes[1];
  if (sets) for (const [slotId, n] of Object.entries(sets)) short[slotId] = { minutes, sets: n };
  const week: Week = { cycle: pos.cycle, week: pos.week, days: existing?.days ?? daysFor(model, pos.cycle, pos.week) };
  if (Object.keys(short).length) week.short = short;
  void store.putWeek(week);
}

/** Satz von Hand hinzugefuegt: Im Kurz-Modus zaehlt er mit, statt nur freiwillig zu sein. */
export function addShortSet(model: AppModel, pos: Position, slotId: string): void {
  const week = model.data.weeks.find((w) => w.cycle === pos.cycle && w.week === pos.week);
  const s = week?.short?.[slotId];
  if (!week?.short || !s?.sets) return;
  void store.putWeek({ ...week, short: { ...week.short, [slotId]: { ...s, sets: s.sets + 1 } } });
}
