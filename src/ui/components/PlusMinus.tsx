/** Plus oder Minus fuer "Satz hinzufuegen/entfernen" als SVG (kein Sonderzeichen im Code). */
export function PlusMinus({ sign }: { sign: 'plus' | 'minus' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={sign === 'plus' ? 'M8 2.5v11M2.5 8h11' : 'M2.5 8h11'} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
