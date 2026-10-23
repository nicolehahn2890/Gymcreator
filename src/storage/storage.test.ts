import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import type { Entry, Profile } from '../core/model/types';
import { createBackup, parseBackup, serializeBackup } from './backup';
import { DexieStorage } from './dexie';
import { SCHEMA_VERSION, emptyData, type StoredData } from './interface';
import { migrate, type Migration } from './migrations';

const profile: Profile = {
  goal: 'apfel',
  level: 'advanced',
  days: 4,
  equipment: ['barbell', 'machine', 'bodyweight'],
  increments: {},
  lang: 'de',
  createdAt: '2026-10-23',
};

const entry = (week: number, slotId = 'gmax_4-8_a', w = '100'): Entry => ({
  cycle: 1,
  week,
  slotId,
  day: 0,
  exerciseId: 'hip_thrust_barbell',
  sets: [{ w, r: 8 }, { w, r: null }],
  extraSets: 0,
  category: 'gmax',
  repRange: '4-8',
  baseSets: 3,
});

const sample = (): StoredData => ({
  profile,
  entries: [entry(1), entry(2, 'gmax_4-8_a', '102,5'), { ...entry(2, 'gmax_8-12_a'), once: true, baseExerciseId: 'kickback_machine' }],
  weeks: [{ cycle: 1, week: 2, days: 3 }],
  notes: [{ exerciseId: 'hip_thrust_barbell', note: 'Polster dick', setting: 'Stufe 4' }],
  custom: [{ id: 'custom_1', name: 'Kettlebell Swing', category: 'ghams', equipment: ['bodyweight'], note: '' }],
});

let store: DexieStorage | undefined;
const open = (name = `t${Math.random()}`) => (store = new DexieStorage(name));

afterEach(async () => {
  await store?.destroy();
  store = undefined;
});

describe('DexieStorage', () => {
  it('startet leer', async () => {
    expect(await open().loadAll()).toEqual(emptyData());
  });

  it('speichert und laedt alles; ein Eintrag je cycle:week:slotId', async () => {
    const s = open();
    const data = sample();
    await s.saveProfile(data.profile as Profile);
    for (const e of data.entries) await s.putEntry(e);
    await s.putEntry({ ...entry(1), sets: [{ w: '105', r: 8 }] });
    for (const w of data.weeks) await s.putWeek(w);
    await s.putWeek({ cycle: 1, week: 2, days: 5 });
    for (const n of data.notes) await s.putNote(n);
    for (const c of data.custom) await s.putCustom(c);
    const loaded = await s.loadAll();
    expect(loaded.profile).toEqual(profile);
    expect(loaded.entries).toHaveLength(3);
    expect(loaded.entries.find((e) => e.week === 1)?.sets).toEqual([{ w: '105', r: 8 }]);
    expect(loaded.weeks).toEqual([{ cycle: 1, week: 2, days: 5 }]);
    expect(loaded.notes).toEqual(data.notes);
    expect(loaded.custom).toEqual(data.custom);
  });

  it('loescht Eintrag, Notiz und eigene Uebung', async () => {
    const s = open();
    await s.replaceAll(sample());
    await s.deleteEntry(1, 1, 'gmax_4-8_a');
    await s.deleteNote('hip_thrust_barbell');
    await s.deleteCustom('custom_1');
    const loaded = await s.loadAll();
    expect(loaded.entries.map((e) => `${e.week}:${e.slotId}`).sort()).toEqual(['2:gmax_4-8_a', '2:gmax_8-12_a']);
    expect(loaded.notes).toEqual([]);
    expect(loaded.custom).toEqual([]);
  });

  it('replaceAll legt vorher eine Sicherheitskopie ab', async () => {
    const s = open();
    await s.replaceAll(sample());
    await s.replaceAll({ ...emptyData(), profile: { ...profile, goal: 'vform' } });
    expect((await s.loadAll()).profile?.goal).toBe('vform');
    const copy = await s.lastSafetyCopy();
    expect(copy?.data.entries).toHaveLength(3);
    expect(copy?.data.profile?.goal).toBe('apfel');
  });
});

describe('Backup', () => {
  it('Rundreise: Export -> Import ergibt dieselben Daten', () => {
    const text = serializeBackup(createBackup(sample(), '2026-10-23'));
    const parsed = parseBackup(text);
    expect(parsed).toEqual({ ok: true, data: sample(), date: '2026-10-23' });
  });

  it('Rundreise ueber den Speicher', async () => {
    const s = open();
    await s.replaceAll(sample());
    const text = serializeBackup(createBackup(await s.loadAll(), '2026-10-23'));
    const target = new DexieStorage(`t${Math.random()}`);
    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error(parsed.error);
    await target.replaceAll(parsed.data);
    const loaded = await target.loadAll();
    await target.destroy();
    expect(loaded.entries.sort((a, b) => a.week - b.week || a.slotId.localeCompare(b.slotId))).toEqual(
      sample().entries.sort((a, b) => a.week - b.week || a.slotId.localeCompare(b.slotId)),
    );
    expect(loaded.profile).toEqual(profile);
  });

  it('erkennt kaputten Text, fremde Daten, neuere Version und falsche Form', () => {
    expect(parseBackup('kein json')).toEqual({ ok: false, error: 'json' });
    expect(parseBackup(JSON.stringify({ app: 'peach', v: 1, data: {} }))).toEqual({ ok: false, error: 'app' });
    const good = createBackup(sample(), '2026-10-23');
    expect(parseBackup(JSON.stringify({ ...good, schema: SCHEMA_VERSION + 1 }))).toEqual({ ok: false, error: 'newer' });
    expect(parseBackup(JSON.stringify({ ...good, entries: [{ cycle: 1 }] }))).toEqual({ ok: false, error: 'shape' });
    expect(parseBackup(JSON.stringify({ ...good, profile: { ...profile, goal: 'peach' } }))).toEqual({ ok: false, error: 'shape' });
    expect(parseBackup(JSON.stringify({ ...good, custom: [{ id: 'x', name: 'a', category: 'gmax', equipment: [], note: '' }] }))).toEqual({ ok: false, error: 'shape' });
  });

  it('nimmt Leerzeichen und Zeilenumbrueche um den Text an', () => {
    const text = `\n  ${serializeBackup(createBackup(emptyData(), '2026-10-23'))}  \n`;
    expect(parseBackup(text).ok).toBe(true);
  });
});

describe('Migrationen', () => {
  it('fuehrt Schritte der Reihe nach aus und lehnt neuere Daten ab', () => {
    const steps: Migration[] = [
      { from: 1, to: 2, run: (d) => ({ ...d, notes: [...d.notes, { exerciseId: 'a', note: 'v2', setting: '' }] }) },
      { from: 2, to: 3, run: (d) => ({ ...d, notes: d.notes.map((n) => ({ ...n, setting: 'v3' })) }) },
    ];
    expect(migrate(emptyData(), 1, steps, 3).notes).toEqual([{ exerciseId: 'a', note: 'v2', setting: 'v3' }]);
    expect(() => migrate(emptyData(), 4, steps, 3)).toThrow();
    expect(() => migrate(emptyData(), 1, [], 2)).toThrow();
    expect(migrate(sample(), SCHEMA_VERSION)).toEqual(sample());
  });
});
