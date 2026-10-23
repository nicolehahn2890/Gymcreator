import { useEffect, useState, type CSSProperties } from 'react';
import { exerciseData, planData } from '../../core/model/data';
import { DAY_COUNTS, GOAL_IDS, type Profile } from '../../core/model/types';
import { fmt, num, text } from '../../i18n';
import { createBackup, parseBackup, serializeBackup } from '../../storage/backup';
import type { StoredData } from '../../storage/interface';
import { REX } from '../brand/rex';
import { AppHeader } from '../components/AppHeader';
import { Check } from '../components/Check';
import { Sheet } from '../components/Sheet';
import { saveProfile, type Position } from '../state/actions';
import type { AppModel } from '../state/model';
import { store } from '../state/store';
import './Settings.css';

/** Ausstattung mit Schrittweite in kg (Maschinen gehen in Stufen). */
const WEIGHTED = ['barbell', 'dumbbell', 'cable', 'smith'];
const today = () => new Date().toISOString().slice(0, 10);

export function Settings({ model, pos, onSetup }: { model: AppModel; pos: Position; onSetup: () => void }) {
  const t = text.settings;
  const profile = model.profile;
  const goals = planData.goals.goals;
  const [status, setStatus] = useState('');
  const [importText, setImportText] = useState('');
  const [pendingImport, setPendingImport] = useState<{ data: StoredData; date: string } | null>(null);
  const [safety, setSafety] = useState<{ date: string; data: StoredData } | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  // Neue Tageszahl gilt erst ab der naechsten Woche (diese Woche hat schon Werte in Uebungen, die wegfielen)
  const [daysLater, setDaysLater] = useState(false);

  const refreshSafety = () => void store.lastSafetyCopy().then(setSafety);
  useEffect(() => {
    void store.lastSafetyCopy().then(setSafety);
  }, []);

  const save = (patch: Partial<Profile>) => setDaysLater(saveProfile(model, pos, { ...profile, ...patch }, patch.days !== undefined) !== null);
  const backupText = () => serializeBackup(createBackup(model.data, today()));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(backupText());
      setStatus(fmt(t.copied, { n: model.data.entries.length }));
    } catch {
      setImportText(backupText());
      setStatus(t.copyFailed);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([backupText()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymcreator-backup-${today()}.json`;
    a.click();
    // Safari bricht den Download ab, wenn die Adresse sofort freigegeben wird
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const startImport = () => {
    const parsed = parseBackup(importText);
    if (!parsed.ok) {
      setStatus(t.errors[parsed.error]);
      return;
    }
    setPendingImport({ data: parsed.data, date: parsed.date });
  };

  const setIncrement = (eq: string, value: string) => {
    const n = parseFloat(value.replace(',', '.'));
    const rest = Object.fromEntries(Object.entries(profile.increments).filter(([key]) => key !== eq));
    save({ increments: value.trim() === '' || Number.isNaN(n) || n <= 0 ? rest : { ...rest, [eq]: n } });
  };

  const used = new Set(model.data.entries.flatMap((e) => [e.exerciseId, e.baseExerciseId ?? '']));

  return (
    <main className="screen settings">
      <AppHeader />
      <h1 className="screen-title">{t.title}</h1>

      <h2 className="section-title">{t.profile}</h2>
      <p className="muted">{t.changeNote}</p>
      <button type="button" className="btn btn-small settings-setup" onClick={onSetup}>
        {text.plan.setup}
      </button>

      <h3 className="field-label settings-label">{t.goal}</h3>
      <div className="segmented" role="group" aria-label={t.goal}>
        {GOAL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className="btn btn-small goal-option"
            aria-pressed={profile.goal === id}
            style={{ '--accent': `var(--${goals[id].accent})` } as CSSProperties}
            onClick={() => save({ goal: id })}
          >
            <img src={REX[id].icon} alt="" width={21} height={32} />
            {goals[id].label.de}
          </button>
        ))}
      </div>

      <h3 className="field-label settings-label">{t.days}</h3>
      <div className="segmented" role="group" aria-label={t.days}>
        {DAY_COUNTS.map((d) => (
          <button key={d} type="button" className="btn btn-small" aria-pressed={profile.days === d} onClick={() => save({ days: d })}>
            {fmt(text.common.days, { n: d })}
          </button>
        ))}
      </div>
      {daysLater && <p className="muted settings-hint">{t.daysNextWeek}</p>}

      <h3 className="field-label settings-label">{t.gym}</h3>
      <div className="chip-list" role="group" aria-label={t.gym}>
        {exerciseData.equipment
          .filter((id) => id !== 'bodyweight')
          .map((id) => {
            const on = profile.equipment.includes(id);
            return (
              <button
                key={id}
                type="button"
                className="chip"
                role="checkbox"
                aria-checked={on}
                onClick={() => save({ equipment: on ? profile.equipment.filter((e) => e !== id) : [...profile.equipment, id] })}
              >
                {on && <Check size={12} />}
                {text.equipment[id as keyof typeof text.equipment]}
              </button>
            );
          })}
      </div>

      <h2 className="section-title">{t.increments}</h2>
      <p className="muted">{t.incrementsHint}</p>
      <div className="increments">
        {WEIGHTED.map((eq) => (
          <label key={eq} className="increment">
            <span className="field-label">{text.equipment[eq as keyof typeof text.equipment]}</span>
            <input
              className="input"
              inputMode="decimal"
              placeholder={num(exerciseData.increments[eq] ?? 0)}
              key={`${eq}:${profile.increments[eq] ?? ''}`}
              defaultValue={profile.increments[eq] != null ? num(profile.increments[eq] ?? 0) : ''}
              onBlur={(e) => setIncrement(eq, e.target.value)}
            />
          </label>
        ))}
      </div>

      <h2 className="section-title">{t.custom}</h2>
      {model.data.custom.length === 0 ? (
        <p className="muted">{t.customEmpty}</p>
      ) : (
        <ul className="custom-list">
          {model.data.custom.map((c) => (
            <li key={c.id} className="row-between">
              <span>
                {c.name} <span className="muted">{planData.goals.categories[c.category]?.label.de}</span>
              </span>
              {!used.has(c.id) && (
                <button type="button" className="btn btn-small" onClick={() => void store.deleteCustom(c.id)}>
                  {t.delete}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="section-title">{t.backup}</h2>
      <div className="card stack">
        <p>{t.backupText}</p>
        <div className="row backup-actions">
          <button type="button" className="btn btn-primary" onClick={() => void copy()}>
            {t.copy}
          </button>
          <button type="button" className="btn" onClick={download}>
            {t.download}
          </button>
        </div>
        <p className="backup-status" role="status">
          {status}
        </p>
        <label className="field-label" htmlFor="backup-text">
          {t.importLabel}
        </label>
        <textarea id="backup-text" className="textarea" rows={3} value={importText} onChange={(e) => setImportText(e.target.value)} />
        <button type="button" className="btn" disabled={!importText.trim()} onClick={startImport}>
          {t.import}
        </button>
        {safety && (
          <div className="row-between safety">
            <span className="muted">{fmt(t.safety, { date: safety.date.slice(0, 10) })}</span>
            <button type="button" className="btn btn-small" onClick={() => setConfirmRestore(true)}>
              {t.restore}
            </button>
          </div>
        )}
      </div>

      <p className="version-line">{fmt(t.version, { version: __APP_VERSION__, build: __APP_BUILD__ })}</p>

      {pendingImport && (
        <Sheet title={t.importTitle} onClose={() => setPendingImport(null)}>
          <p className="sheet-text">{fmt(t.importText, { date: pendingImport.date || '?' })}</p>
          <div className="stack">
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                void store.replaceAll(pendingImport.data).then(refreshSafety);
                setPendingImport(null);
                setImportText('');
                setStatus(t.importDone);
              }}
            >
              {t.import}
            </button>
            <button type="button" className="btn-quiet" onClick={() => setPendingImport(null)}>
              {text.common.cancel}
            </button>
          </div>
        </Sheet>
      )}

      {confirmRestore && safety && (
        <Sheet title={t.restoreTitle} onClose={() => setConfirmRestore(false)}>
          <p className="sheet-text">{fmt(t.restoreText, { date: safety.date.slice(0, 10) })}</p>
          <div className="stack">
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                void store.replaceAll(safety.data).then(refreshSafety);
                setConfirmRestore(false);
              }}
            >
              {t.restore}
            </button>
            <button type="button" className="btn-quiet" onClick={() => setConfirmRestore(false)}>
              {text.common.cancel}
            </button>
          </div>
        </Sheet>
      )}
    </main>
  );
}
