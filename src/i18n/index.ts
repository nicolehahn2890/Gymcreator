// Alle Oberflaechen-Texte. Deutsch zuerst; Englisch folgt in Phase 2 als en.json mit gleicher Form.
import de from './de.json';

export type Strings = typeof de;
export const text: Strings = de;

/** Ersetzt {name}-Platzhalter: fmt('Woche {week}', { week: 3 }) -> 'Woche 3'. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Zahl deutsch: 27.5 -> "27,5". */
export function num(n: number): string {
  return String(Math.round(n * 100) / 100).replace('.', ',');
}

/** Wdh.-Bereich mit Halbgeviertstrich: "8-12" -> "8\u201312". */
export function range(r: string): string {
  return r.replace('-', '\u2013');
}

/** "Tag A \u2013 Po Kraft" -> "Po Kraft" (Tagesname ohne Buchstaben). */
export function shortDayName(name: string): string {
  return name.replace(/^Tag \w \u2013 /, '');
}

/** Sekunden als Minuten:Sekunden: 90 -> "1:30". */
export function mmss(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
