import { useState } from 'react';
import { exercises, plans } from '../domain/catalogue';
import { activeSession, finishedSessions, nextPlan, targetsFor } from '../domain/schedule';
import type { AppData, PlanId } from '../domain/types';
import { longDate, shortDate, targetSummary } from './format';
import { Icon } from './icons';
import type { SyncStatus } from './useStore';

interface Props {
  data: AppData;
  status: SyncStatus;
  onStart: (plan: PlanId) => void;
  onResume: () => void;
  onDiscard: (id: string) => void;
  onSettings: () => void;
}

const statusText = (s: SyncStatus) =>
  ({
    off: 'Backup off',
    syncing: 'Syncing…',
    synced: 'Synced',
    offline: 'Offline, syncs later',
    error: 'Sync failed',
  })[s.kind];

export function HomeScreen({ data, status, onStart, onResume, onDiscard, onSettings }: Props) {
  const suggested = nextPlan(data);
  const [chosen, setChosen] = useState<PlanId | null>(null);
  const plan = chosen ?? suggested;
  const other: PlanId = plan === 'A' ? 'B' : 'A';
  const active = activeSession(data);
  const last = finishedSessions(data).at(-1);
  const ids = plans[plan].exercises;
  const totalSets = ids.reduce((n, id) => n + exercises[id].sets, 0);

  return (
    <main className="screen">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 4px' }}>
        <div>
          <p className="muted" style={{ margin: 0 }}>{longDate(new Date())}</p>
          <h1 className="title">{active ? 'In progress' : 'Next up'}</h1>
        </div>
        <button className="icon-btn" onClick={onSettings} aria-label="Settings">
          <Icon name="settings" />
        </button>
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

      <button className="card" onClick={onSettings} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <span className="muted">{last ? `Last: Plan ${last.plan}, ${shortDate(last.date)}` : 'No sessions yet'}</span>
        <span style={{ fontSize: 13, color: status.kind === 'error' ? 'var(--clay-text)' : status.kind === 'synced' ? 'var(--sage)' : 'var(--stone)' }}>
          ● {statusText(status)}
        </span>
      </button>
      {active ? (
        <button className="btn-primary" onClick={onResume}>Resume Plan {active.plan}</button>
      ) : (
        <button className="btn-primary" onClick={() => onStart(plan)}>Start Plan {plan}</button>
      )}
    </main>
  );
}
