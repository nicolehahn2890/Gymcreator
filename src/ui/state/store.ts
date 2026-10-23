// App-Zustand: gespeicherte Daten im Speicher halten, Aenderungen sofort anzeigen und im Hintergrund
// speichern. Schlaegt das Speichern fehl, zeigt die Oberflaeche einen Hinweis (saveError).
import { useSyncExternalStore } from 'react';
import type { CustomExercise, Entry, ExerciseNote, Profile, Week } from '../../core/model/types';
import { entryKey } from '../../core/progression/entries';
import { DexieStorage } from '../../storage/dexie';
import { emptyData, type Storage, type StoredData } from '../../storage/interface';
import { buildModel, type AppModel } from './model';

export interface AppState {
  status: 'loading' | 'ready' | 'error';
  data: StoredData;
  model: AppModel | null;
  saveError: boolean;
}

export class AppStore {
  private state: AppState = { status: 'loading', data: emptyData(), model: null, saveError: false };
  private listeners = new Set<() => void>();

  constructor(private storage: Storage) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = () => this.state;

  async init(): Promise<void> {
    try {
      this.set(await this.storage.loadAll());
    } catch {
      this.state = { ...this.state, status: 'error' };
      this.emit();
    }
  }

  saveProfile(profile: Profile) {
    return this.change({ ...this.state.data, profile }, () => this.storage.saveProfile(profile));
  }

  putEntry(entry: Entry) {
    const key = entryKey(entry.cycle, entry.week, entry.slotId);
    const entries = [...this.state.data.entries.filter((e) => entryKey(e.cycle, e.week, e.slotId) !== key), entry];
    return this.change({ ...this.state.data, entries }, () => this.storage.putEntry(entry));
  }

  putWeek(week: Week) {
    const weeks = [...this.state.data.weeks.filter((w) => !(w.cycle === week.cycle && w.week === week.week)), week];
    return this.change({ ...this.state.data, weeks }, () => this.storage.putWeek(week));
  }

  putNote(note: ExerciseNote) {
    const empty = !note.note.trim() && !note.setting.trim();
    const notes = [...this.state.data.notes.filter((n) => n.exerciseId !== note.exerciseId), ...(empty ? [] : [note])];
    return this.change({ ...this.state.data, notes }, () => (empty ? this.storage.deleteNote(note.exerciseId) : this.storage.putNote(note)));
  }

  putCustom(exercise: CustomExercise) {
    const custom = [...this.state.data.custom.filter((c) => c.id !== exercise.id), exercise];
    return this.change({ ...this.state.data, custom }, () => this.storage.putCustom(exercise));
  }

  deleteCustom(id: string) {
    const custom = this.state.data.custom.filter((c) => c.id !== id);
    return this.change({ ...this.state.data, custom }, () => this.storage.deleteCustom(id));
  }

  replaceAll(data: StoredData) {
    return this.change(data, () => this.storage.replaceAll(data));
  }

  lastSafetyCopy() {
    return this.storage.lastSafetyCopy();
  }

  private async change(data: StoredData, persist: () => Promise<void>): Promise<void> {
    this.set(data);
    try {
      await persist();
    } catch {
      this.state = { ...this.state, saveError: true };
      this.emit();
    }
  }

  private set(data: StoredData) {
    this.state = { status: 'ready', data, model: data.profile ? buildModel(data, data.profile) : null, saveError: this.state.saveError };
    this.emit();
  }

  private emit() {
    for (const l of this.listeners) l();
  }
}

export const store = new AppStore(new DexieStorage());

export function useAppState(): AppState {
  return useSyncExternalStore(store.subscribe, store.getState);
}
