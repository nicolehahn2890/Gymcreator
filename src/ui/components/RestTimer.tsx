import { useEffect, useState } from 'react';
import { text } from '../../i18n';

interface Props {
  endsAt: number;
  onChange: (endsAt: number | null) => void;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Pausentimer ueber einen Zeitstempel: laeuft korrekt weiter, auch wenn die App im Hintergrund war. */
export function RestTimer({ endsAt, onChange }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const left = Math.max(0, Math.ceil((endsAt - now) / 1000));

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (left === 0) navigator.vibrate?.(300);
  }, [left]);

  return (
    <div className={`rest-timer${left === 0 ? ' rest-over' : ''}`} role="timer" aria-live="polite">
      <span className="rest-label">{left === 0 ? text.workout.restOver : `${text.workout.rest} ${mmss(left)}`}</span>
      {left > 0 && (
        <button type="button" className="btn btn-small" onClick={() => onChange(endsAt + 30000)}>
          {text.workout.restPlus}
        </button>
      )}
      <button type="button" className="btn btn-small" onClick={() => onChange(null)}>
        {text.workout.restStop}
      </button>
    </div>
  );
}
