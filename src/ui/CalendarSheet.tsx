import { useState } from 'react';
import { finishedSessions, localDate } from '../domain/schedule';
import { currentStreak } from '../domain/streak';
import type { AppData, PlanId } from '../domain/types';
import { Icon } from './icons';

interface Props {
  data: AppData;
  onClose: () => void;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function monthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const length = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length }, (_, i) => new Date(year, month, i + 1)),
  ];
}

export function CalendarSheet({ data, onClose }: Props) {
  const now = new Date();
  const today = localDate(now);
  const [offset, setOffset] = useState(0);
  const shown = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const planOn = new Map<string, PlanId>(finishedSessions(data).map((s) => [s.date, s.plan]));
  const streak = currentStreak(data, today);
  const cells = monthCells(shown.getFullYear(), shown.getMonth());
  const visits = cells.filter((d) => d && planOn.has(localDate(d))).length;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Calendar" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Calendar</h2>
          <button className="btn-text" onClick={onClose}>Done</button>
        </div>
        <div className="card" style={{ background: 'var(--steel)', display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="num" style={{ fontSize: 36, color: 'var(--cream)' }}>{streak}</span>
          <span>
            day streak
            <span className="muted" style={{ display: 'block' }}>Every gym day adds one. Three rest days in a row resets it.</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="icon-btn" onClick={() => setOffset(offset - 1)} aria-label="Previous month">
            <Icon name="back" />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>
              {shown.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
            </div>
            <div className="muted">{visits === 1 ? '1 session' : `${visits} sessions`}</div>
          </div>
          <button
            className="icon-btn"
            onClick={() => setOffset(offset + 1)}
            disabled={offset >= 0}
            style={{ opacity: offset >= 0 ? 0.3 : 1 }}
            aria-label="Next month"
          >
            <Icon name="forward" />
          </button>
        </div>
        <div className="cal-grid">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="muted">{d}</span>
          ))}
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const date = localDate(d);
            const plan = planOn.get(date);
            return (
              <span
                key={i}
                className={`cal-day num${plan ? ` cal-${plan}` : ''}${date === today ? ' today' : ''}`}
                aria-label={plan ? `${date}, Plan ${plan}` : date}
              >
                {d.getDate()}
              </span>
            );
          })}
        </div>
        <div className="muted" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <span><span className="cal-dot cal-A" /> Plan A</span>
          <span><span className="cal-dot cal-B" /> Plan B</span>
        </div>
      </div>
    </div>
  );
}
