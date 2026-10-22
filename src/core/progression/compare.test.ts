// Faelle aus den Peach-Funktionstests (tests/funktion.test.js) und der Peach-Doku, 1:1 uebernommen.
import { describe, expect, it } from 'vitest';
import { progressStatus, repZone } from './compare';
import { cmpWeight, parseWeight, weightBounds } from './weight';

const p = (weight: string, ...reps: string[]) => ({ weight, reps });

describe('parseWeight', () => {
  it('Spanne -> oberer Wert, Komma -> Punkt', () => {
    expect(parseWeight('42-45')).toBe(45);
    expect(parseWeight('27,5')).toBe(27.5);
    expect(parseWeight('25')).toBe(25);
  });
  it('assistiert: aus einer Spanne zaehlt der kleinere Wert', () => {
    expect(parseWeight('20-25', true)).toBe(20);
  });
  it('leer oder unlesbar -> 0', () => {
    expect(parseWeight('')).toBe(0);
    expect(parseWeight(null)).toBe(0);
    expect(parseWeight('abc')).toBe(0);
  });
});

describe('weightBounds', () => {
  it('liest beide Grenzen', () => {
    expect(weightBounds('40-45')).toEqual({ lo: 40, hi: 45 });
    expect(weightBounds('45')).toEqual({ lo: 45, hi: 45 });
    expect(weightBounds('27,5')).toEqual({ lo: 27.5, hi: 27.5 });
    expect(weightBounds('')).toBeNull();
  });
});

describe('cmpWeight', () => {
  it('vergleicht erst den Bestwert, dann die zweite Grenze', () => {
    expect(cmpWeight('45', '42-45')).toBe(1);
    expect(cmpWeight('42-45', '40-45')).toBe(1);
    expect(cmpWeight('40-45', '45')).toBe(-1);
    expect(cmpWeight('40-45', '40-45')).toBe(0);
  });
  it('leeres Feld ist nie ein Abstieg', () => {
    expect(cmpWeight('', '100')).toBe(0);
    expect(cmpWeight('100', '')).toBe(0);
  });
  it('assistiert: weniger Gegengewicht ist mehr Leistung', () => {
    expect(cmpWeight('20', '25', true)).toBe(1);
    expect(cmpWeight('30', '25', true)).toBe(-1);
  });
});

describe('progressStatus (Peach prog)', () => {
  it.each([
    ['mehr Gewicht', p('105', '8'), p('100', '8'), false, 'w'],
    ['weniger Gewicht trotz mehr Reps', p('95', '12'), p('100', '8'), false, 'd'],
    ['gleich (Reihenfolge egal)', p('100', '8', '7'), p('100', '7', '8'), false, 's'],
    ['mehr Reps im Schnitt', p('100', '9', '8'), p('100', '8', '8'), false, 'r'],
    ['Spanne heruntergesetzt', p('40-45', '8'), p('45', '8'), false, 'd'],
    ['Spanne angezogen', p('42-45', '8'), p('40-45', '8'), false, 'w'],
    ['Komma', p('27,5', '8'), p('27', '8'), false, 'w'],
    ['assistiert weniger Hilfe', p('20', '8'), p('25', '8'), true, 'w'],
    ['assistiert mehr Hilfe', p('30', '8'), p('25', '8'), true, 'd'],
    ['leeres Gewicht kein Abstieg', p('', '8'), p('100', '8'), false, 's'],
    ['zusaetzlicher Satz verfaelscht nichts', p('100', '8', '8', '8'), p('100', '8', '8'), false, 's'],
    ['halb ausgefuellt zaehlt nur gefuellte Saetze', p('100', '9', ''), p('100', '8', '8'), false, 'r'],
  ] as const)('%s', (_name, cur, prev, assisted, expected) => {
    expect(progressStatus({ weight: cur.weight, reps: [...cur.reps] }, { weight: prev.weight, reps: [...prev.reps] }, assisted)).toBe(expected);
  });

  it('ohne Wiederholungen auf einer Seite kein Status', () => {
    expect(progressStatus(p('100'), p('100', '8'))).toBeNull();
    expect(progressStatus(p('100', '8'), p('100'))).toBeNull();
    expect(progressStatus(p('100', '0'), p('100', '8'))).toBeNull();
  });

  it('nimmt auch Zahlen als Wiederholungen', () => {
    expect(progressStatus({ weight: '100', reps: [10, 10] }, { weight: '100', reps: [9, 10] })).toBe('r');
  });
});

describe('repZone (Peach rcol)', () => {
  it('Obergrenze erreicht, im Bereich, darunter', () => {
    expect(repZone('12', '8-12')).toBe('top');
    expect(repZone(13, '8-12')).toBe('top');
    expect(repZone('8', '8-12')).toBe('in');
    expect(repZone('7', '8-12')).toBe('below');
    expect(repZone('', '8-12')).toBeNull();
  });
});
