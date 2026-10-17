import { useEffect, useState } from 'react';
import { exercises } from '../domain/catalogue';
import { exerciseHistory, targetsFor } from '../domain/schedule';
import type { AppData, Load, Session } from '../domain/types';
import { Illustration } from '../illustrations';
import { coachLine } from './format';
import { Icon } from './icons';
import { SetRow } from './SetRow';

interface Props {
  data: AppData;
  session: Session;
  onSet: (entry: number, set: number, actual: Load | null) => void;
  onStep: (entry: number, set: number, field: 'weight' | 'reps', dir: 1 | -1, fallback: Load) => void;
  onFinish: () => void;
  onLeave: () => void;
}

function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        if (document.visibilityState === 'visible') lock = await navigator.wakeLock?.request('screen');
      } catch {}
    };
    void acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      document.removeEventListener('visibilitychange', acquire);
      void lock?.release();
    };
  }, []);
}

export function WorkoutScreen({ data, session, onSet, onStep, onFinish, onLeave }: Props) {
  useWakeLock();
  const firstOpen = Math.max(0, session.entries.findIndex((e) => e.sets.some((s) => !s.actual)));
  const [page, setPage] = useState(firstOpen);
  const [editing, setEditing] = useState<number | null>(null);
  const entry = session.entries[page];
  if (!entry) return null;
  const exercise = exercises[entry.exercise];
  const targets = targetsFor(data, entry.exercise);
  const last = exerciseHistory(data, entry.exercise).at(-1);
  const isLast = page === session.entries.length - 1;
  const go = (p: number) => {
    setPage(p);
    setEditing(null);
  };

  const fallbackFor = (i: number): Load => {
    for (let j = i - 1; j >= 0; j--) {
      const prev = entry.sets[j]?.actual;
      if (prev) return prev;
    }
    return { weight: exercise.startWeight, reps: exercise.repRange.max };
  };

  return (
    <main className="screen">
      <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="icon-btn" onClick={onLeave} aria-label="Back to home">
          <Icon name="close" />
        </button>
        <span className={`chip chip-${session.plan}`}>Plan {session.plan}</span>
        <div className="progress" style={{ gridTemplateColumns: `repeat(${session.entries.length}, 1fr)` }}>
          {session.entries.map((e, i) => (
            <span
              key={i}
              style={{
                background:
                  i === page || e.sets.every((s) => s.actual)
                    ? session.plan === 'A'
                      ? 'var(--sage)'
                      : 'var(--dusk)'
                    : undefined,
                opacity: i === page || !e.sets.every((s) => s.actual) ? 1 : 0.45,
              }}
            />
          ))}
        </div>
        <span className="muted num">
          {page + 1}/{session.entries.length}
        </span>
      </header>

      <div className="scroll">
        <div className="art">
          <Illustration id={exercise.id} label={exercise.name} />
        </div>
        <div style={{ padding: '0 4px' }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{exercise.name}</h1>
          <p className="muted" style={{ margin: '2px 0 0' }}>{exercise.equipment}</p>
          <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.45, color: 'var(--stone)' }}>
            {coachLine(exercise.id, targets, last)}
          </p>
        </div>
        <div className="set-grid muted" style={{ padding: '0 8px 0 14px' }}>
          <span>Set</span>
          <span>{exercise.unit}</span>
          <span>Reps</span>
          <span />
        </div>
        {entry.sets.map((set, i) => (
          <SetRow
            key={`${page}-${i}`}
            index={i}
            set={set}
            fallback={fallbackFor(i)}
            exercise={exercise}
            editing={editing === i}
            onEdit={() => setEditing(editing === i ? null : i)}
            onChange={(actual) => onSet(page, i, actual)}
            onStep={(field, dir) => onStep(page, i, field, dir, fallbackFor(i))}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {page > 0 && (
          <button className="btn-secondary" style={{ width: 64, flex: 'none' }} onClick={() => go(page - 1)} aria-label="Previous exercise">
            <Icon name="back" />
          </button>
        )}
        {isLast ? (
          <button className="btn-primary" onClick={onFinish}>Finish workout</button>
        ) : (
          <button className="btn-secondary" onClick={() => go(page + 1)}>Next exercise</button>
        )}
      </div>
    </main>
  );
}
