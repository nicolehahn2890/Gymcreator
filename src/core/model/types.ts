// Datenmodell (docs/konzept.md 4.3). Trainingswissen steht nur in data/*.json; hier stehen nur Formen.

export const GOAL_IDS = ['vform', 'sanduhr', 'apfel'] as const;
export type GoalId = (typeof GOAL_IDS)[number];

export const LEVELS = ['beginner', 'advanced'] as const;
export type Level = (typeof LEVELS)[number];

export const DAY_COUNTS = [3, 4, 5] as const;
export type DaysPerWeek = (typeof DAY_COUNTS)[number];

/** Kategorie-ID aus data/goals.json (z. B. "gmax", "back"). */
export type CategoryId = string;
/** Wdh.-Bereich als "min-max" aus data/goals.json `ranges` (z. B. "8-12"). */
export type RepRange = string;
export type Priority = 0 | 1 | 2 | 3;
export const FOCI = ['vertical', 'horizontal', 'lateral', 'rear', 'press', 'incline', 'fly', 'overhead', 'pump'] as const;
export type Focus = (typeof FOCI)[number];

export interface Localized {
  de: string;
  en: string;
}

// ---------- Rohdaten (Form von data/goals.json und data/templates.json) ----------

export interface CategoryDef {
  label: Localized;
  color: string;
  /** Anteilige Zaehlung je Muskel (Hauptmuskel 1, Mitarbeit 0,5). */
  muscles: Record<string, number>;
}

export interface SlotDef {
  id: string;
  cat: CategoryId;
  range: RepRange;
  sets: number;
  focus?: Focus;
}

export interface GoalDef {
  label: Localized;
  tagline: Localized;
  /** Name eines Farb-Tokens (z. B. "pink" fuer var(--pink)). */
  accent: string;
  priorities: Record<CategoryId, Priority>;
  /** Hauptmuskelgruppe: darf zweimal am Tag vorkommen, alle anderen einmal. */
  mainCategory: CategoryId;
  /** Wochenziele je Muskel und Stufe; jeder Plan muss darin liegen. */
  targets: Record<Level, MuscleTargets>;
  slots: SlotDef[];
}

export interface Limits {
  maxFractionalSetsPerMusclePerSession: number;
  maxSetsPerSlot: number;
  minFrequencyPrio3: number;
  /** Zeilen je Kategorie und Tag (Hauptmuskelgruppe: maxSlotsMainCategoryPerDay). */
  maxSlotsPerCategoryPerDay: number;
  maxSlotsMainCategoryPerDay: number;
}

export interface LevelRules {
  minExercisesPerSession: number;
  maxExercisesPerSession: number;
  maxSetsPerSession: number;
  /** Feste Satzzahl je Slot (ersetzt die Basis-Saetze aus Pool und Vorlage). */
  setsPerSlot?: number;
  /** Bereiche, die ersetzt werden (z. B. "6-8" -> "8-12"). Die Slot-ID bleibt. */
  rangeMap?: Record<RepRange, RepRange>;
}

/** Wochenvolumen je Muskel (anteilig gezaehlt) als [min, max]. */
export type MuscleTargets = Record<string, [number, number]>;

export interface ProgressionRules {
  /** Wochen je Zyklus. */
  cycleWeeks: number;
  /** Ab dieser Woche wird mit dem Vorwert verglichen (davor leichter Einstieg ohne Badge). */
  compareFromWeek: number;
  /** So viele stagnierende Wochenvergleiche derselben Uebung loesen den Auto-Zusatzsatz aus. */
  stagnationComparisons: number;
  /** Saetze, die der Auto-Zusatzsatz hinzufuegt. */
  autoExtraSets: number;
}

export interface Timing {
  /** Geschaetzte Dauer eines Satzes in Sekunden (ohne Pause). */
  setSeconds: number;
  /** Pausenvorgabe je Wdh.-Bereich in Sekunden. */
  restSeconds: Record<RepRange, number>;
}

export interface GoalsData {
  schema: 1;
  ranges: RepRange[];
  limits: Limits;
  levels: Record<Level, LevelRules>;
  progression: ProgressionRules;
  timing: Timing;
  categories: Record<CategoryId, CategoryDef>;
  goals: Record<GoalId, GoalDef>;
}

/** Slot-ID oder Objekt mit abweichenden Saetzen; beginner: false = faellt fuer Einsteiger weg. */
export type TemplateSlotRef = string | { id: string; sets?: number; beginner?: boolean };

export interface TemplateDayDef {
  name: string;
  focus: string;
  slots: TemplateSlotRef[];
}

export interface TemplatesData {
  schema: 1;
  goals: Record<GoalId, Record<`${DaysPerWeek}`, { days: TemplateDayDef[] }>>;
}

export interface PlanData {
  goals: GoalsData;
  templates: TemplatesData;
}

// ---------- Vom Generator erzeugt ----------

/** Eine Zeile im Plan. Die Slot-ID ist der stabile Schluessel fuer Eintraege (cycle:week:slotId). */
export interface PlanRow {
  slotId: string;
  category: CategoryId;
  repRange: RepRange;
  sets: number;
  priority: Priority;
  focus?: Focus;
}

export interface PlanDay {
  /** 0-basiert; Buchstabe A-E fuer Tagesfarbe und Anzeige. */
  index: number;
  letter: string;
  name: string;
  focus: string;
  rows: PlanRow[];
}

export interface PlanIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
}

export interface Plan {
  version: 1;
  goal: GoalId;
  level: Level;
  days: DaysPerWeek;
  dayPlans: PlanDay[];
  /** Slots des Pools, die in dieser Wochenart pausieren. */
  paused: string[];
}

// ---------- Uebungsbibliothek (data/exercises.json) ----------

export interface Exercise {
  /** Stabile ID, wird in Eintraegen gespeichert. Nie umbenennen. */
  id: string;
  name: Localized;
  category: CategoryId;
  /** Mitarbeitende Kategorien (nur Info, keine Volumenzaehlung). */
  secondary: CategoryId[];
  /** Benoetigte Ausstattung (alle Eintraege noetig). */
  equipment: string[];
  pattern: string;
  /** Passt zu Slot-Hinweisen (z. B. "vertical" fuer Latzug). */
  focus: Focus[];
  /** Ziele, fuer die die Uebung eine Top-Wahl ist (Stern). */
  stars: GoalId[];
  /** Geeignet fuer schwere Saetze im schwersten Bereich (ranges[0]). */
  heavy: boolean;
  /** Last in der gedehnten Position (Stretch-Bias). */
  stretch: boolean;
  unilateral: boolean;
  /** Gegengewicht: weniger Gewicht = schwerer (Vergleich dreht sich um). */
  assisted: boolean;
  /** Haltezeit statt Wiederholungen (Sekunden ins Wdh.-Feld). */
  timed: boolean;
  /** "Einstellung: ...\nAusfuehrung: ...", geraeteneutral. Englisch folgt in Phase 2. */
  tip: { de: string; en?: string };
}

export interface ExercisesData {
  schema: 1;
  equipment: string[];
  /** Standard-Schrittweite in kg je Ausstattung; null = eine Stufe bzw. kein Vorschlag. */
  increments: Record<string, number | null>;
  patterns: string[];
  exercises: Exercise[];
}

// ---------- Gespeicherte Daten (Phase 1, Form schon festgelegt) ----------

export interface SetValue {
  /** Gewicht als Text: "40", "27,5", Spanne "40-45". */
  w: string;
  r: number | null;
}

/** Eintrag unter dem Schluessel `cycle:week:slotId`. Kontext steht im Eintrag, nie in der Position. */
export interface Entry {
  cycle: number;
  week: number;
  slotId: string;
  /** Tag (0-basiert), an dem der Slot in dieser Woche lag. Nur Kontext fuer Herkunft und Reihenfolge, kein Schluessel. */
  day: number;
  exerciseId: string;
  sets: SetValue[];
  extraSets: number;
  category: CategoryId;
  repRange: RepRange;
  baseSets: number;
  /** "Nur diese Woche" getauscht: Uebung der Zeile davor. */
  once?: boolean;
  baseExerciseId?: string;
}

export interface Week {
  cycle: number;
  week: number;
  days: DaysPerWeek;
}

export interface Profile {
  goal: GoalId;
  level: Level;
  /** Standard-Wochenart; je Woche umstellbar (Week). */
  days: DaysPerWeek;
  /** Vorhandene Ausstattung ("Mein Gym"). */
  equipment: string[];
  /** Eigene Schrittweiten je Ausstattung; fehlt ein Eintrag, gilt data/exercises.json increments. */
  increments: Record<string, number | null>;
  lang: 'de' | 'en';
  /** ISO-Datum der Einrichtung. */
  createdAt: string;
}

/** Notiz und Geraete-Einstellung je Uebung, gilt fuer alle Wochen und Zyklen (Peach tip__ex__ / set__ex__). */
export interface ExerciseNote {
  exerciseId: string;
  note: string;
  setting: string;
}

/** Eigene Uebung; laeuft in Progression und Verlauf wie jede andere, ohne Stern und Tipp. */
export interface CustomExercise {
  /** Beginnt mit "custom_". */
  id: string;
  name: string;
  category: CategoryId;
  equipment: string[];
  note: string;
}
