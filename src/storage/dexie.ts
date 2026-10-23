// IndexedDB-Speicher ueber Dexie. Eintraege unter ihrem Schluessel cycle:week:slotId.
import Dexie, { type Table } from 'dexie';
import type { CustomExercise, Entry, ExerciseNote, Profile, Week } from '../core/model/types';
import { entryKey } from '../core/progression/entries';
import { SCHEMA_VERSION, type Storage, type StoredData } from './interface';
import { migrate } from './migrations';

interface KeyedEntry extends Entry {
  key: string;
}
interface KeyedWeek extends Week {
  key: string;
}
interface MetaRow {
  id: 'schema' | 'safety';
  version?: number;
  date?: string;
  data?: StoredData;
}

class GymDb extends Dexie {
  profile!: Table<Profile & { id: 'me' }, 'me'>;
  entries!: Table<KeyedEntry, string>;
  weeks!: Table<KeyedWeek, string>;
  notes!: Table<ExerciseNote, string>;
  custom!: Table<CustomExercise, string>;
  meta!: Table<MetaRow, string>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      profile: 'id',
      entries: 'key, cycle, exerciseId',
      weeks: 'key, cycle',
      notes: 'exerciseId',
      custom: 'id',
      meta: 'id',
    });
  }
}

const weekKey = (w: Pick<Week, 'cycle' | 'week'>) => `${w.cycle}:${w.week}`;
const withoutKey = <T extends object>(row: T & { key: string }): T => {
  const copy: T & { key?: string } = { ...row };
  delete copy.key;
  return copy;
};
const withoutId = <T extends object>(row: T & { id: string }): T => {
  const copy: T & { id?: string } = { ...row };
  delete copy.id;
  return copy;
};

export class DexieStorage implements Storage {
  private db: GymDb;

  constructor(name = 'gymcreator') {
    this.db = new GymDb(name);
  }

  async loadAll(): Promise<StoredData> {
    const db = this.db;
    const [profileRow, entries, weeks, notes, custom, schema] = await Promise.all([
      db.profile.get('me'),
      db.entries.toArray(),
      db.weeks.toArray(),
      db.notes.toArray(),
      db.custom.toArray(),
      db.meta.get('schema'),
    ]);
    const data: StoredData = {
      profile: profileRow ? withoutId(profileRow) : null,
      entries: entries.map((e) => withoutKey(e)),
      weeks: weeks.map((w) => withoutKey(w)),
      notes,
      custom,
    };
    const version = schema?.version ?? SCHEMA_VERSION;
    if (version === SCHEMA_VERSION) {
      if (!schema) await db.meta.put({ id: 'schema', version: SCHEMA_VERSION });
      return data;
    }
    const migrated = migrate(data, version);
    await this.writeAll(migrated, data);
    return migrated;
  }

  async saveProfile(profile: Profile): Promise<void> {
    await this.db.profile.put({ ...profile, id: 'me' });
  }

  async putEntry(entry: Entry): Promise<void> {
    await this.db.entries.put({ ...entry, key: entryKey(entry.cycle, entry.week, entry.slotId) });
  }

  async deleteEntry(cycle: number, week: number, slotId: string): Promise<void> {
    await this.db.entries.delete(entryKey(cycle, week, slotId));
  }

  async putWeek(week: Week): Promise<void> {
    await this.db.weeks.put({ ...week, key: weekKey(week) });
  }

  async putNote(note: ExerciseNote): Promise<void> {
    await this.db.notes.put(note);
  }

  async deleteNote(exerciseId: string): Promise<void> {
    await this.db.notes.delete(exerciseId);
  }

  async putCustom(exercise: CustomExercise): Promise<void> {
    await this.db.custom.put(exercise);
  }

  async deleteCustom(id: string): Promise<void> {
    await this.db.custom.delete(id);
  }

  async replaceAll(data: StoredData): Promise<void> {
    await this.writeAll(data, await this.loadAll());
  }

  async lastSafetyCopy(): Promise<{ date: string; data: StoredData } | null> {
    const row = await this.db.meta.get('safety');
    return row?.date && row.data ? { date: row.date, data: row.data } : null;
  }

  /** Schreibt alles in einer Transaktion; der alte Stand wird vorher als Sicherheitskopie abgelegt. */
  private async writeAll(data: StoredData, previous: StoredData): Promise<void> {
    const db = this.db;
    await db.transaction('rw', [db.profile, db.entries, db.weeks, db.notes, db.custom, db.meta], async () => {
      await db.meta.put({ id: 'safety', date: new Date().toISOString(), data: previous });
      await Promise.all([db.profile.clear(), db.entries.clear(), db.weeks.clear(), db.notes.clear(), db.custom.clear()]);
      if (data.profile) await db.profile.put({ ...data.profile, id: 'me' });
      await db.entries.bulkPut(data.entries.map((e) => ({ ...e, key: entryKey(e.cycle, e.week, e.slotId) })));
      await db.weeks.bulkPut(data.weeks.map((w) => ({ ...w, key: weekKey(w) })));
      await db.notes.bulkPut(data.notes);
      await db.custom.bulkPut(data.custom);
      await db.meta.put({ id: 'schema', version: SCHEMA_VERSION });
    });
  }

  /** Nur fuer Tests: Datenbank schliessen und loeschen. */
  async destroy(): Promise<void> {
    this.db.close();
    await Dexie.delete(this.db.name);
  }
}
