import type { ReactNode } from 'react';

interface Props {
  /** Bild aus REX_MOMENT (brand/rex.ts) */
  image: string;
  /** Ganzer Rex ueber dem Text, als Karte; sonst Rex-Kopf links neben dem Text, als Hinweis */
  pose?: boolean;
  /** Ueberschrift, nur mit titleId; h1 als Hauptueberschrift der Ansicht, sonst h2 per level */
  title?: ReactNode;
  titleId?: string;
  level?: 1 | 2;
  /** Knopf unter dem Text */
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/** Rex mit kurzem Text fuer Rueckmeldungen (Design System Rexy, RexMoment). Hoechstens einer pro Ansicht. */
export function RexMoment({ image, pose = false, title, titleId, level = 1, action, className = '', children }: Props) {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <section className={`${pose ? 'card rex-moment rex-moment-pose' : 'note rex-moment'} ${className}`.trim()} aria-labelledby={titleId}>
      <img className="rex-moment-img" src={image} alt="" />
      <div className="rex-moment-body">
        {title && (
          <Heading id={titleId} className="rex-moment-title">
            {title}
          </Heading>
        )}
        {children && <p className="rex-moment-text">{children}</p>}
        {action}
      </div>
    </section>
  );
}
