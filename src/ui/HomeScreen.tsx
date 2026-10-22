import { useState } from 'react';
import { exercises, plans } from '../domain/catalogue';
import { activeSession, localDate, nextPlan, targetsFor } from '../domain/schedule';
import { currentStreak } from '../domain/streak';
import type { AppData, PlanId } from '../domain/types';
import { longDate, targetSummary } from './format';
import { Icon } from './icons';
import type { SyncStatus } from './useStore';

interface Props {
  data: AppData;
  status: SyncStatus;
  unsynced: boolean;
  onStart: (plan: PlanId) => void;
  onResume: () => void;
  onDiscard: (id: string) => void;
  onSettings: () => void;
  onCalendar: () => void;
  onProgress: () => void;
}

function unsyncedNote(s: SyncStatus): string | null {
  switch (s.kind) {
    case 'off':
      return 'Backup is off. Your sessions are only on this phone.';
    case 'offline':
      return "You're offline. Your latest session backs up when you're back online.";
    case 'error':
      return "Your latest session isn't backed up. Open Settings to see why.";
    default:
      return null;
  }
}

export function HomeScreen({ data, status, unsynced, onStart, onResume, onDiscard, onSettings, onCalendar, onProgress }: Props) {
  const suggested = nextPlan(data);
  const [chosen, setChosen] = useState<PlanId | null>(null);
  const plan = chosen ?? suggested;
  const other: PlanId = plan === 'A' ? 'B' : 'A';
  const active = activeSession(data);
  const streak = currentStreak(data, localDate(new Date()));
  const note = unsynced ? unsyncedNote(status) : null;
  const ids = plans[plan].exercises;
  const totalSets = ids.reduce((n, id) => n + exercises[id].sets, 0);

  return (
    <main className="screen">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 4px' }}>
        <div>
          <p className="muted" style={{ margin: 0 }}>
            {longDate(new Date())}
            {streak > 0 && <> · <span style={{ color: 'var(--cream)' }}>{streak} day streak</span></>}
          </p>
          <h1 className="title">{active ? 'In progress' : 'Next up'}</h1>
        </div>
        <div style={{ display: 'flex' }}>
          <button className="icon-btn" onClick={onProgress} aria-label="Progress">
            <Icon name="chart" />
          </button>
          <button className="icon-btn" onClick={onCalendar} aria-label="Calendar">
            <Icon name="calendar" />
          </button>
          <button className="icon-btn" onClick={onSettings} aria-label="Settings">
            <Icon name="settings" />
          </button>
        </div>
      </header>

      <div className="scroll">
        {active ? (
          <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`chip chip-${active.plan}`}>Plan {active.plan}</span>
              <span className="muted">
                {active.entries.flatMap((e) => e.sets).filter((s) => s.actual).length} of{' '}
                {active.entries.flatMap((e) => e.sets).length} sets logged
              </span>
            </div>
            <button className="btn-text" style={{ alignSelf: 'flex-start', color: 'var(--clay-text)' }} onClick={() => onDiscard(active.id)}>
              Discard this session
            </button>
          </section>
        ) : (
          <>
            <section className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className={`chip chip-${plan}`}>Plan {plan}</span>
                <span className="muted">
                  {ids.length} exercises · {totalSets} sets
                </span>
              </div>
              {ids.map((id) => {
                const t = targetSummary(targetsFor(data, id));
                return (
                  <div className="ex-row" key={id}>
                    <span>{exercises[id].name}</span>
                    {t ? (
                      <span className="num" style={{ whiteSpace: 'nowrap' }}>
                        {t.sets} <span style={{ color: 'var(--stone)', fontWeight: 400 }}>@ {t.weight}</span>{' '}
                        <span className="mark">{t.mark}</span>
                      </span>
                    ) : (
                      <span className="muted">Calibrate</span>
                    )}
                  </div>
                );
              })}
            </section>
            <div className="muted" style={{ display: 'flex', gap: 16, padding: '0 6px', flexWrap: 'wrap' }}>
              <span><span className="mark">+1</span> add a rep</span>
              <span><span className="mark">↑</span> weight goes up</span>
              <span><span className="mark">↓</span> step back</span>
            </div>
            <button className="btn-text" style={{ alignSelf: 'flex-start' }} onClick={() => setChosen(other)}>
              Do Plan {other} instead
            </button>
          </>
        )}
      </div>

      {note && (
        <p className="muted" role="status" style={{ margin: 0, padding: '0 4px', color: status.kind === 'error' ? 'var(--clay-text)' : undefined }}>
          {note}
        </p>
      )}
      {active ? (
        <button className="btn-primary" onClick={onResume}>Resume Plan {active.plan}</button>
      ) : (
        <button className="btn-primary" onClick={() => onStart(plan)}>Start Plan {plan}</button>
      )}
    </main>
  );
}
