// Speicher-Schnittstelle. Die Web-App nutzt IndexedDB (dexie.ts), die Store-App spaeter SQLite/Dateien
// hinter derselben Schnittstelle (docs/konzept.md 4.6). UI-Kleinkram (offene Ansicht) bleibt in localStorage.
import type { CustomExercise, Entry, ExerciseNote, Profile, Week } from '../core/model/types';

/** Version der gespeicherten Daten; steigt nur mit einer Migration (migrations.ts). */
export const SCHEMA_VERSION = 1;

export interface StoredData {
  profile: Profile | null;
  entries: Entry[];
  weeks: Week[];
  notes: ExerciseNote[];
  custom: CustomExercise[];
}

export function emptyData(): StoredData {
  return { profile: null, entries: [], weeks: [], notes: [], custom: [] };
}

export interface Storage {
  loadAll(): Promise<StoredData>;
  saveProfile(profile: Profile): Promise<void>;
  putEntry(entry: Entry): Promise<void>;
  deleteEntry(cycle: number, week: number, slotId: string): Promise<void>;
  putWeek(week: Week): Promise<void>;
  putNote(note: ExerciseNote): Promise<void>;
  deleteNote(exerciseId: string): Promise<void>;
  putCustom(exercise: CustomExercise): Promise<void>;
  deleteCustom(id: string): Promise<void>;
  /** Ersetzt alles (Backup-Import). Vorher wird eine Sicherheitskopie des alten Stands abgelegt. */
  replaceAll(data: StoredData): Promise<void>;
  /** Letzte Sicherheitskopie vor einem Import oder einer Migration, falls vorhanden. */
  lastSafetyCopy(): Promise<{ date: string; data: StoredData } | null>;
}
