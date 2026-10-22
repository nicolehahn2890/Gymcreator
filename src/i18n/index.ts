// Alle Oberflaechen-Texte. Deutsch zuerst; Englisch folgt in Phase 2 als en.json mit gleicher Form.
import de from './de.json';

export type Strings = typeof de;
export const text: Strings = de;
