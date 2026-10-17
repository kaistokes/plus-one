import type { Exercise, Load, SetLog } from '../domain/types';
import { isBelow, kg } from './format';
import { Icon } from './icons';

interface Props {
  index: number;
  set: SetLog;
  fallback: Load;
  exercise: Exercise;
  editing: boolean;
  onEdit: () => void;
  onChange: (actual: Load | null) => void;
  onStep: (field: 'weight' | 'reps', dir: 1 | -1) => void;
}

export function SetRow({ index, set, fallback, exercise, editing, onEdit, onChange, onStep }: Props) {
  const shown = set.actual ?? set.target ?? fallback;
  const done = set.actual !== null;
  const below = isBelow(set);
  const pending = done ? '' : 'var(--stone)';

  return (
    <div className={`set-row${below ? ' below' : ''}`}>
      <div className="set-grid">
        <span className="muted num">{index + 1}</span>
        <button className="set-value num" style={{ color: pending }} onClick={onEdit} aria-label={`Set ${index + 1} weight`}>
          {kg(shown.weight)}
          {below && set.target && set.actual && set.actual.weight < set.target.weight && (
            <span className="struck">{kg(set.target.weight)}</span>
          )}
        </button>
        <button
          className="set-value num"
          style={{ color: below && set.target && set.actual && set.actual.reps < set.target.reps ? 'var(--clay-text)' : pending }}
          onClick={onEdit}
          aria-label={`Set ${index + 1} reps`}
        >
          {shown.reps}
          {below && set.target && set.actual && set.actual.reps < set.target.reps && (
            <span className="struck">{set.target.reps}</span>
          )}
        </button>
        <button
          className={`tick${done ? (below ? ' below' : ' hit') : ''}`}
          onClick={() => onChange(done ? null : shown)}
          aria-label={done ? `Undo set ${index + 1}` : `Mark set ${index + 1} done`}
          aria-pressed={done}
        >
          {done && <Icon name={below ? 'pencil' : 'check'} size={below ? 18 : 22} />}
        </button>
      </div>
      {editing && (
        <div className="editor">
          <div className="stepper">
            <button onClick={() => onStep('weight', -1)} aria-label="Less weight">−</button>
            <span className="num" style={{ fontSize: 20 }}>
              {kg(shown.weight)}
              <span className="unit">{exercise.unit}</span>
            </span>
            <button onClick={() => onStep('weight', 1)} aria-label="More weight">+</button>
          </div>
          <div className="stepper">
            <button onClick={() => onStep('reps', -1)} aria-label="Fewer reps">−</button>
            <span className="num" style={{ fontSize: 20 }}>
              {shown.reps}
              <span className="unit">reps</span>
            </span>
            <button onClick={() => onStep('reps', 1)} aria-label="More reps">+</button>
          </div>
        </div>
      )}
    </div>
  );
}
