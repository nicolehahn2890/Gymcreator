import { useEffect } from 'react';
import { latestWeek } from '../core/progression/position';
import { rowState } from '../core/progression/state';
import { text } from '../i18n';
import { TabBar } from './components/TabBar';
import { DayView } from './screens/DayView';
import { Onboarding } from './screens/Onboarding';
import { PlanScreen } from './screens/PlanScreen';
import { Progress } from './screens/Progress';
import { Settings } from './screens/Settings';
import { Today } from './screens/Today';
import { planFor, rowContext, type AppModel } from './state/model';
import { store, useAppState } from './state/store';
import { useUiState } from './state/ui';

export function App() {
  const state = useAppState();
  useEffect(() => {
    void store.init();
  }, []);

  if (state.status === 'loading') {
    return (
      <main className="screen">
        <p className="muted">{text.app.loading}</p>
      </main>
    );
  }
  if (state.status === 'error') {
    return (
      <main className="screen">
        <p className="note">{text.app.loadError}</p>
      </main>
    );
  }
  if (!state.model) {
    return (
      <Onboarding
        onDone={(profile) => {
          void store.saveProfile(profile);
          // Browser bitten, die Daten nicht bei Platzmangel zu loeschen
          void navigator.storage?.persist?.();
        }}
      />
    );
  }
  return <Shell model={state.model} saveError={state.saveError} />;
}

function Shell({ model, saveError }: { model: AppModel; saveError: boolean }) {
  const [ui, setUi] = useUiState();
  const latest = latestWeek(model.index);
  const pos = { cycle: ui.cycle ?? latest.cycle, week: ui.week ?? latest.week };
  const plan = planFor(model, pos.cycle, pos.week);
  const day = ui.day !== null && plan.dayPlans[ui.day] ? ui.day : null;
  const slot = day !== null && ui.slot && plan.dayPlans[day]?.rows.some((r) => r.slotId === ui.slot) ? ui.slot : null;

  useEffect(() => {
    document.documentElement.dataset.goal = model.profile.goal;
  }, [model.profile.goal]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ui.tab, day]);

  const goToWeek = (cycle: number, week: number) => setUi({ cycle, week, day: null, slot: null });
  // Tag oeffnen: die erste Uebung ohne alle Saetze ist gleich aufgeklappt
  const openDay = (d: number) => {
    const ctx = rowContext(model, pos.cycle, pos.week);
    const first = plan.dayPlans[d]?.rows.find((r) => !rowState(ctx, r, pos).done);
    setUi({ day: d, slot: first?.slotId ?? null });
  };

  let content;
  if (day !== null) {
    content = (
      <DayView
        model={model}
        pos={pos}
        day={day}
        openSlot={slot}
        onOpenSlot={(s) => setUi({ slot: s })}
        restEndsAt={ui.restEndsAt}
        onRest={(restEndsAt) => setUi({ restEndsAt })}
        onBack={() => setUi({ day: null, slot: null })}
      />
    );
  } else if (ui.tab === 'plan') {
    content = <PlanScreen model={model} pos={pos} onGoToWeek={goToWeek} onOpenDay={openDay} />;
  } else if (ui.tab === 'progress') {
    content = <Progress model={model} pos={pos} />;
  } else if (ui.tab === 'settings') {
    content = <Settings model={model} />;
  } else {
    content = <Today model={model} cycle={pos.cycle} week={pos.week} onOpenDay={openDay} onGoToWeek={goToWeek} />;
  }

  return (
    <>
      {saveError && (
        <p className="save-warn" role="alert">
          {text.app.saveError}
        </p>
      )}
      {content}
      <TabBar tab={ui.tab} onChange={(tab) => setUi({ tab, day: null, slot: null })} />
    </>
  );
}
