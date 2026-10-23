// Backup als Text (Kopieren/Teilen/Datei). Import prueft Form und Version, bevor etwas ueberschrieben wird.
import { DAY_COUNTS, GOAL_IDS, type Entry, type Profile, type Week } from '../core/model/types';
import { SCHEMA_VERSION, type StoredData } from './interface';
import { migrate } from './migrations';

export interface Backup extends StoredData {
  /** Interne Kennung aus der Zeit vor dem Namen Rexy; bleibt, damit vorhandene Backups gueltig sind. */
  app: 'gymcreator';
  schema: number;
  /** ISO-Datum des Exports. */
  date: string;
}

export function createBackup(data: StoredData, date: string): Backup {
  return { app: 'gymcreator', schema: SCHEMA_VERSION, date, ...data };
}

export function serializeBackup(backup: Backup): string {
  return JSON.stringify(backup);
}

/** Fehlergruende fuer den Import; die Texte dazu stehen in src/i18n. */
export type BackupError = 'json' | 'app' | 'newer' | 'shape';

export type ParseResult = { ok: true; data: StoredData; date: string } | { ok: false; error: BackupError };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isInt = (v: unknown): v is number => Number.isInteger(v);

function isProfile(v: unknown): v is Profile {
  return (
    isObj(v) &&
    GOAL_IDS.includes(v.goal as never) &&
    DAY_COUNTS.includes(v.days as never) &&
    Array.isArray(v.equipment) &&
    v.equipment.every(isStr) &&
    isObj(v.increments) &&
    Object.values(v.increments).every((n) => n === null || (typeof n === 'number' && n > 0)) &&
    (v.lang === 'de' || v.lang === 'en') &&
    isStr(v.createdAt)
  );
}

function isEntry(v: unknown): v is Entry {
  return (
    isObj(v) &&
    isInt(v.cycle) &&
    isInt(v.week) &&
    v.cycle >= 1 &&
    v.week >= 1 &&
    isInt(v.day) &&
    isStr(v.slotId) &&
    isStr(v.exerciseId) &&
    isStr(v.category) &&
    isStr(v.repRange) &&
    isInt(v.baseSets) &&
    isInt(v.extraSets) &&
    Array.isArray(v.sets) &&
    v.sets.every((s) => isObj(s) && isStr(s.w) && (s.r === null || isInt(s.r))) &&
    (v.once === undefined || typeof v.once === 'boolean') &&
    (v.baseExerciseId === undefined || isStr(v.baseExerciseId))
  );
}

function isWeek(v: unknown): v is Week {
  return (
    isObj(v) &&
    isInt(v.cycle) &&
    isInt(v.week) &&
    DAY_COUNTS.includes(v.days as never) &&
    (v.short === undefined || (isObj(v.short) && Object.values(v.short).every((s) => isObj(s) && isInt(s.minutes) && isInt(s.sets) && s.sets >= 0)))
  );
}

export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text.trim());
  } catch {
    return { ok: false, error: 'json' };
  }
  if (!isObj(raw) || raw.app !== 'gymcreator') return { ok: false, error: 'app' };
  if (!isInt(raw.schema) || raw.schema < 1) return { ok: false, error: 'shape' };
  if (raw.schema > SCHEMA_VERSION) return { ok: false, error: 'newer' };
  const { profile, entries, weeks, notes, custom } = raw;
  const valid =
    (profile === null || isProfile(profile)) &&
    Array.isArray(entries) &&
    entries.every(isEntry) &&
    Array.isArray(weeks) &&
    weeks.every(isWeek) &&
    Array.isArray(notes) &&
    notes.every((n) => isObj(n) && isStr(n.exerciseId) && isStr(n.note) && isStr(n.setting)) &&
    Array.isArray(custom) &&
    custom.every((c) => isObj(c) && isStr(c.id) && c.id.startsWith('custom_') && isStr(c.name) && isStr(c.category) && Array.isArray(c.equipment) && isStr(c.note));
  if (!valid) return { ok: false, error: 'shape' };
  const data = migrate({ profile, entries, weeks, notes, custom } as StoredData, raw.schema);
  return { ok: true, data, date: isStr(raw.date) ? raw.date : '' };
}
