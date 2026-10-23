import { useEffect, useState } from 'react';
import { mmss, text } from '../../i18n';

interface Props {
  endsAt: number;
  onChange: (endsAt: number | null) => void;
}

/**
 * Pausentimer ueber einen Zeitstempel: laeuft korrekt weiter, auch wenn die App im Hintergrund war.
 * Screenreader lesen den Countdown nicht jede Sekunde vor (role="timer" ist still), das Ende wird angesagt.
 */
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
    <div className={`rest-timer${left === 0 ? ' rest-over' : ''}`} role="timer">
      {left === 0 ? (
        <span key="over" className="rest-label" role="alert">
          {text.workout.restOver}
        </span>
      ) : (
        <span key="run" className="rest-label">{`${text.workout.rest} ${mmss(left)}`}</span>
      )}
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
