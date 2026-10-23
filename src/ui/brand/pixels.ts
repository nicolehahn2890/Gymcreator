// Pixel-Muster fuer das App-Icon ("X" = gefuellt), gelesen von scripts/make-icons.mjs.

export type PixelPattern = readonly string[];

export const DUMBBELL: PixelPattern = [
  '................',
  '................',
  '................',
  '................',
  '..XX........XX..',
  '.XXX........XXX.',
  '.XXX........XXX.',
  '.XXXXXXXXXXXXXX.',
  '.XXXXXXXXXXXXXX.',
  '.XXX........XXX.',
  '.XXX........XXX.',
  '..XX........XX..',
  '................',
  '................',
  '................',
  '................',
];

/** Zerlegt ein Muster in waagerechte Streifen (weniger SVG-Elemente als ein Rechteck je Pixel). */
export function pixelRuns(pattern: PixelPattern): { x: number; y: number; w: number }[] {
  const runs: { x: number; y: number; w: number }[] = [];
  pattern.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] !== 'X') {
        x++;
        continue;
      }
      const start = x;
      while (row[x] === 'X') x++;
      runs.push({ x: start, y, w: x - start });
    }
  });
  return runs;
}
