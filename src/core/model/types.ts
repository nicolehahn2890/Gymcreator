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
export type Focus = 'vertical' | 'horizontal' | 'lateral' | 'rear' | 'press' | 'incline' | 'fly' | 'overhead' | 'pump';

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
  categoryOrder: CategoryId[];
  slots: SlotDef[];
}

export interface Limits {
  warnSetsPerSession: number;
  maxSetsPerSession: number;
  maxFractionalSetsPerMusclePerSession: number;
  maxSetsPerSlot: number;
  minFrequencyPrio3: number;
}

export interface LevelRules {
  /** Feste Satzzahl je Slot (ersetzt die Basis-Saetze aus Pool und Vorlage). */
  setsPerSlot?: number;
  /** Bereiche, die ersetzt werden (z. B. "4-8" -> "6-10"). Die Slot-ID bleibt. */
  rangeMap?: Record<RepRange, RepRange>;
  /** Kategorien mit mindestens so vielen Slots in der Woche verlieren den letzten (Pool-Reihenfolge). */
  dropLastSlotFromCategoriesWith?: number;
}

export interface GoalsData {
  schema: 1;
  ranges: RepRange[];
  limits: Limits;
  levels: Record<Level, LevelRules>;
  categories: Record<CategoryId, CategoryDef>;
  goals: Record<GoalId, GoalDef>;
}

export type TemplateSlotRef = string | { id: string; sets: number };

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
  /** Geeignet fuer schwere Saetze im Bereich 4-8. */
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
