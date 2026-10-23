// Migrations-Geruest: jede Aenderung an der Form gespeicherter Daten bekommt eine Migration mit Test.
// Vor dem Ausfuehren legt der Speicher eine Sicherheitskopie ab. Migrationen verschieben nie Eintraege
// (Schluessel sind Slot-IDs, keine Positionen) - sie ergaenzen oder benennen Felder.
import { SCHEMA_VERSION, type StoredData } from './interface';

export interface Migration {
  from: number;
  to: number;
  run(data: StoredData): StoredData;
}

/** Bisher keine: Schema 1 ist der Ausgangsstand. */
export const MIGRATIONS: Migration[] = [];

export function migrate(data: StoredData, fromVersion: number, migrations: Migration[] = MIGRATIONS, target = SCHEMA_VERSION): StoredData {
  if (fromVersion > target) throw new Error(`Daten sind neuer (Schema ${fromVersion}) als diese App (Schema ${target})`);
  let version = fromVersion;
  let result = data;
  while (version < target) {
    const step = migrations.find((m) => m.from === version);
    if (!step) throw new Error(`Keine Migration von Schema ${version}`);
    result = step.run(result);
    version = step.to;
  }
  return result;
}
