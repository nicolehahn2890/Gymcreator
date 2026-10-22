// Gewichtsangaben lesen und vergleichen. Port aus Peach (parseWeight, weightBounds, cmpWeight), Logik 1:1.
// Eingaben sind Text: "40", "27,5" (Komma), Spanne "40-45". Assistierte Uebungen (Gegengewicht)
// drehen die Richtung um: weniger ist mehr Leistung.

export type WeightInput = string | number | null | undefined;

export interface WeightBounds {
  lo: number;
  hi: number;
}

function parts(w: WeightInput): number[] {
  return String(w)
    .trim()
    .replace(/,/g, '.')
    .split('-')
    .map((x) => parseFloat(x))
    .filter((n) => !Number.isNaN(n));
}

/** Zahlenwert einer Angabe: Spanne -> oberer Wert (assistiert: unterer), Komma erlaubt, leer -> 0. */
export function parseWeight(w: WeightInput, assisted = false): number {
  if (!w && w !== 0) return 0;
  const s = String(w).trim().replace(/,/g, '.');
  if (s.includes('-')) {
    const p = parts(s);
    if (!p.length) return 0;
    return assisted ? Math.min(...p) : (p[p.length - 1] ?? 0);
  }
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

/** Untere und obere Grenze: "40-45" -> {lo:40, hi:45}, "45" -> {lo:45, hi:45}, leer -> null. */
export function weightBounds(w: WeightInput): WeightBounds | null {
  if (!w && w !== 0) return null;
  const p = parts(w);
  if (!p.length) return null;
  return { lo: Math.min(...p), hi: Math.max(...p) };
}

/**
 * 1 = mehr Leistung, -1 = weniger, 0 = gleich oder unbekannt (leeres Feld gilt nie als Abstieg).
 * Zuerst zaehlt der Bestwert (obere Grenze, assistiert die untere), bei Gleichstand die zweite Grenze:
 * 45 -> "40-45" ist weniger (ein Teil der Saetze lief mit 40), "40-45" -> 45 ist mehr.
 */
export function cmpWeight(current: WeightInput, previous: WeightInput, assisted = false): -1 | 0 | 1 {
  const c = weightBounds(current);
  const p = weightBounds(previous);
  if (!c || !p || c.hi <= 0 || p.hi <= 0) return 0;
  const cBest = assisted ? c.lo : c.hi;
  const pBest = assisted ? p.lo : p.hi;
  if (cBest !== pBest) return (assisted ? cBest < pBest : cBest > pBest) ? 1 : -1;
  const cSecond = assisted ? c.hi : c.lo;
  const pSecond = assisted ? p.hi : p.lo;
  if (cSecond !== pSecond) return (assisted ? cSecond < pSecond : cSecond > pSecond) ? 1 : -1;
  return 0;
}
