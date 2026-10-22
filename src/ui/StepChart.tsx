import type { Window } from '../domain/progress';
import { dayNumber } from '../domain/schedule';
import { dayMonth, kg } from './format';

interface Props {
  window: Window;
  color: string;
  detailed?: boolean;
}

const MINI = { w: 120, h: 34, l: 3, r: 3, t: 4, b: 4 };
const FULL = { w: 320, h: 170, l: 2, r: 40, t: 10, b: 24 };
const TICKS = 3;

/** Working weight as a step line: it holds flat between sessions and steps when the weight changes. */
export function StepChart({ window: win, color, detailed = false }: Props) {
  const box = detailed ? FULL : MINI;
  const shown = [...(win.before ? [win.before] : []), ...win.points];
  const first = shown[0];
  if (!first) return null;

  const from = dayNumber(win.from);
  const span = Math.max(1, dayNumber(win.to) - from);
  const x = (date: string) => box.l + (Math.max(0, dayNumber(date) - from) / span) * (box.w - box.l - box.r);
  const weights = shown.map((p) => p.weight);
  const lo = Math.min(...weights);
  const hi = Math.max(...weights);
  const y = (w: number) =>
    hi === lo ? box.h / 2 : box.h - box.b - ((w - lo) / (hi - lo)) * (box.h - box.t - box.b);

  let d = `M${x(first.date)},${y(first.weight)}`;
  for (const p of shown.slice(1)) d += ` H${x(p.date)} V${y(p.weight)}`;
  d += ` H${x(win.to)}`;

  const grid = hi === lo ? [lo] : [lo, (lo + hi) / 2, hi];
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) =>
    new Date((from + (span * i) / TICKS) * 86_400_000).toISOString().slice(0, 10),
  );

  return (
    <svg viewBox={`0 0 ${box.w} ${box.h}`} width="100%" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      {detailed &&
        grid.map((w) => (
          <g key={w}>
            <line x1={box.l} x2={box.w - box.r} y1={y(w)} y2={y(w)} stroke="var(--steel)" />
            <text x={box.w} y={y(w) + 4} textAnchor="end" className="chart-label num">{kg(w)}</text>
          </g>
        ))}
      {detailed &&
        ticks.map((t, i) => (
          <text
            key={t}
            x={x(t)}
            y={box.h - 4}
            textAnchor={i === 0 ? 'start' : i === TICKS ? 'end' : 'middle'}
            className="chart-label"
          >
            {dayMonth(t)}
          </text>
        ))}
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {win.points.map((p, i) => (
        <circle
          key={i}
          cx={x(p.date)}
          cy={y(p.weight)}
          r={detailed ? 4 : 2.5}
          fill={color}
          stroke={detailed ? 'var(--graphite)' : 'var(--steel)'}
          strokeWidth={detailed ? 2 : 1.5}
        />
      ))}
    </svg>
  );
}
