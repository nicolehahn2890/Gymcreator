// Pixel-Muster fuer Marke und Ziel-Glyphen ("X" = gefuellt). Wird auch von scripts/make-icons.mjs gelesen.
import type { GoalId } from '../../core/model/types';

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

export const GOAL_GLYPHS: Record<GoalId, PixelPattern> = {
  vform: [
    '............',
    'XXXXXXXXXXXX',
    'XXXXXXXXXXXX',
    '.XXXXXXXXXX.',
    '.XXXXXXXXXX.',
    '..XXXXXXXX..',
    '..XXXXXXXX..',
    '...XXXXXX...',
    '...XXXXXX...',
    '....XXXX....',
    '....XXXX....',
    '............',
  ],
  sanduhr: [
    '............',
    '.XXXXXXXXXX.',
    '..XXXXXXXX..',
    '...XXXXXX...',
    '....XXXX....',
    '.....XX.....',
    '.....XX.....',
    '....XXXX....',
    '...XXXXXX...',
    '..XXXXXXXX..',
    '.XXXXXXXXXX.',
    '............',
  ],
  apfel: [
    '......XX....',
    '.....XX.....',
    '..XXX..XXX..',
    '.XXXXXXXXXX.',
    'XXXXXXXXXXXX',
    'XXXXXXXXXXXX',
    'XXXXXXXXXXXX',
    'XXXXXXXXXXXX',
    '.XXXXXXXXXX.',
    '.XXXXXXXXXX.',
    '..XXX..XXX..',
    '............',
  ],
};

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
