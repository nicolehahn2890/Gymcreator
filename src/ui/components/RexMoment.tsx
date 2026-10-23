import type { ReactNode } from 'react';

interface Props {
  /** Bild aus REX_MOMENT (brand/rex.ts) */
  image: string;
  /** Ganzer Rex ueber dem Text, als Karte; sonst Rex-Kopf links neben dem Text, als Hinweis */
  pose?: boolean;
  /** Hauptueberschrift der Ansicht (h1), nur mit titleId */
  title?: ReactNode;
  titleId?: string;
  /** Knopf unter dem Text */
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/** Rex mit kurzem Text fuer Rueckmeldungen (Design System Rexy, RexMoment). Hoechstens einer pro Ansicht. */
export function RexMoment({ image, pose = false, title, titleId, action, className = '', children }: Props) {
  return (
    <section className={`${pose ? 'card rex-moment rex-moment-pose' : 'note rex-moment'} ${className}`.trim()} aria-labelledby={titleId}>
      <img className="rex-moment-img" src={image} alt="" />
      <div className="rex-moment-body">
        {title && (
          <h1 id={titleId} className="rex-moment-title">
            {title}
          </h1>
        )}
        {children && <p className="rex-moment-text">{children}</p>}
        {action}
      </div>
    </section>
  );
}
