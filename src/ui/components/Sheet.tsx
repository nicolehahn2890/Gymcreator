import { useEffect, useRef, type ReactNode } from 'react';
import { text } from '../../i18n';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom-Sheet fuer Rueckfragen und Auswahl. Schliesst mit Esc und Tipp auf den Hintergrund. */
export function Sheet({ title, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="sheet-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="row-between">
          <h2 className="sheet-title">{title}</h2>
          <button type="button" className="btn-quiet" onClick={onClose}>
            {text.common.close}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
