import { useState, type ReactNode } from 'react';
import { exercises, plans } from '../domain/catalogue';
import { progressOrder, rangeStart, RANGES, timeline, windowOf, type Range, type Window } from '../domain/progress';
import { addDays, dayNumber, localDate } from '../domain/schedule';
import type { AppData, ExerciseId } from '../domain/types';
import { dayMonth, kg } from './format';
import { Icon } from './icons';
import { StepChart } from './StepChart';

interface Props {
  data: AppData;
  onClose: () => void;
}

function colorOf(id: ExerciseId): string {
  const inA = plans.A.exercises.includes(id);
  const inB = plans.B.exercises.includes(id);
  return inA && inB ? 'var(--cream)' : inA ? 'var(--sage)' : 'var(--dusk)';
}

const signed = (change: number) => (change > 0 ? `+${kg(change)}` : change < 0 ? `−${kg(-change)}` : '±0');

export function ProgressSheet({ data, onClose }: Props) {
  const today = localDate(new Date());
  const [range, setRange] = useState<Range>('All');
  const [open, setOpen] = useState<ExerciseId | null>(null);
  const lifts = progressOrder
    .map((id) => ({ id, points: timeline(data, id) }))
    .filter((l) => l.points.length > 0);
  const first = lifts.map((l) => l.points[0]?.date ?? today).sort()[0];
  const from = rangeStart(range, today, first);
  const middle = addDays(from, Math.round((dayNumber(today) - dayNumber(from)) / 2));
  const lift = lifts.find((l) => l.id === open);

  const rangePicker = (
    <div className="seg" role="group" aria-label="Time range">
      {RANGES.map((r) => (
        <button key={r} className={r === range ? 'on' : ''} aria-pressed={r === range} onClick={() => setRange(r)}>
          {r}
        </button>
      ))}
    </div>
  );

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Progress" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 36 }}>
          {lift ? (
            <button className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '8px 0' }} onClick={() => setOpen(null)}>
              <Icon name="back" size={18} /> Progress
            </button>
          ) : (
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Progress</h2>
          )}
          <button className="btn-text" onClick={onClose}>Done</button>
        </div>

        {lifts.length === 0 ? (
          <p className="muted" style={{ margin: '8px 0 16px' }}>Finish a workout and each lift's weight shows up here.</p>
        ) : lift ? (
          <Detail id={lift.id} win={windowOf(lift.points, from, today)} rangePicker={rangePicker} />
        ) : (
          <>
            {rangePicker}
            <div className="muted num" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '0 2px' }}>
              <span>{dayMonth(from)}</span>
              <span>{dayMonth(middle)}</span>
              <span>{dayMonth(today)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {lifts.map(({ id, points }) => {
                const win = windowOf(points, from, today);
                return (
                  <button key={id} className="tile" onClick={() => setOpen(id)}>
                    <span className="muted tile-name">{exercises[id].name}</span>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '2px 0 6px' }}>
                      <span className="num" style={{ fontSize: 20 }}>{kg(win.current)}</span>
                      <span className="num" style={{ fontSize: 12, color: win.change > 0 ? 'var(--cream)' : 'var(--stone)' }}>
                        {signed(win.change)}
                      </span>
                    </span>
                    <StepChart window={win} color={colorOf(id)} />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Detail({ id, win, rangePicker }: { id: ExerciseId; win: Window; rangePicker: ReactNode }) {
  const exercise = exercises[id];
  const stats: [string, string][] = [
    ['Start', kg(win.start)],
    ['Best set', win.best ? `${kg(win.best.weight)} × ${win.best.reps}` : '–'],
    ['Weight jumps', String(win.jumps.length)],
  ];
  return (
    <>
      <div>
        <div className="muted">{exercise.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="num" style={{ fontSize: 38 }}>{kg(win.current)}</span>
          <span className="muted">{exercise.unit}</span>
          <span className="num" style={{ marginLeft: 'auto', fontSize: 15, color: win.change > 0 ? 'var(--cream)' : 'var(--stone)' }}>
            {signed(win.change)} kg
          </span>
        </div>
      </div>
      {rangePicker}
      <div style={{ padding: '6px 0 2px' }}>
        <StepChart window={win} color={colorOf(id)} detailed />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {stats.map(([label, value]) => (
          <div key={label} className="card" style={{ background: 'var(--steel)', padding: '8px 10px' }}>
            <div className="muted" style={{ fontSize: 11 }}>{label}</div>
            <div className="num" style={{ fontSize: 16 }}>{value}</div>
          </div>
        ))}
      </div>
      {win.jumps.length > 0 && (
        <div>
          {[...win.jumps].reverse().map((j) => (
            <div key={j.date} className="ex-row">
              <span className="muted">{dayMonth(j.date)}</span>
              <span className="num">
                <span style={{ color: 'var(--stone)' }}>{kg(j.from)} →</span> {kg(j.to)} <span className="mark">↑</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
