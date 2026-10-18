import { useState } from 'react';
import { activeSession, newEntry, startSession } from '../domain/schedule';
import { CalendarSheet } from './CalendarSheet';
import { HomeScreen } from './HomeScreen';
import { SettingsSheet } from './SettingsSheet';
import { useStore } from './useStore';
import { WorkoutScreen } from './WorkoutScreen';

export function App() {
  const store = useStore();
  const [inWorkout, setInWorkout] = useState<boolean | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  if (!store.loaded) return null;

  const active = activeSession(store.data);

  return (
    <>
      {(inWorkout ?? Boolean(active)) && active ? (
        <WorkoutScreen
          data={store.data}
          session={active}
          onSet={(entry, set, actual) => store.dispatch({ type: 'setActual', sessionId: active.id, entry, set, actual })}
          onStep={(entry, set, field, dir, fallback) =>
            store.dispatch({ type: 'step', sessionId: active.id, entry, set, field, dir, fallback })
          }
          onSwap={(entry, exercise) =>
            store.dispatch({ type: 'swap', sessionId: active.id, entry, replacement: newEntry(store.data, exercise) })
          }
          onFinish={() => {
            store.closeSession(active.id, 'finished');
            setInWorkout(false);
          }}
          onLeave={() => setInWorkout(false)}
        />
      ) : (
        <HomeScreen
          data={store.data}
          status={store.status}
          unsynced={store.unsynced}
          onStart={(plan) => {
            store.dispatch({ type: 'start', session: startSession(store.data, plan, new Date(), crypto.randomUUID()) });
            setInWorkout(true);
          }}
          onResume={() => setInWorkout(true)}
          onDiscard={(id) => {
            if (confirm('Discard this session? Its sets won’t count.')) store.closeSession(id, 'discarded');
          }}
          onSettings={() => setSettingsOpen(true)}
          onCalendar={() => setCalendarOpen(true)}
        />
      )}
      {calendarOpen && <CalendarSheet data={store.data} onClose={() => setCalendarOpen(false)} />}
      {settingsOpen && (
        <SettingsSheet
          data={store.data}
          config={store.config}
          status={store.status}
          onSave={(c) => void store.updateConfig(c)}
          onSyncNow={store.requestSync}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}
