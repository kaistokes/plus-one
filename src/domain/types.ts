export type PlanId = 'A' | 'B';

export type ExerciseId =
  | 'incline-press'
  | 'high-row'
  | 'db-lateral-raise'
  | 'db-curl'
  | 'cable-pushdown'
  | 'bench-press'
  | 'lat-pulldown'
  | 'machine-lateral-raise'
  | 'machine-preacher-curl';

export type LoadUnit = 'kg/side' | 'kg/hand' | 'kg bar' | 'kg stack';

export type WeightLadder =
  | { kind: 'step'; step: number }
  | { kind: 'list'; values: readonly number[] };

export interface Load {
  weight: number;
  reps: number;
}

export interface Exercise {
  id: ExerciseId;
  name: string;
  sets: number;
  repRange: { min: number; max: number };
  unit: LoadUnit;
  weights: WeightLadder;
  startWeight: number;
}

export interface Plan {
  id: PlanId;
  exercises: readonly ExerciseId[];
}

export interface SetLog {
  target: Load | null;
  actual: Load | null;
}

export interface Entry {
  exercise: ExerciseId;
  sets: SetLog[];
}

export type SessionStatus = 'active' | 'finished' | 'discarded';

export interface Session {
  id: string;
  plan: PlanId;
  date: string;
  startedAt: string;
  updatedAt: string;
  status: SessionStatus;
  entries: Entry[];
}

export interface AppData {
  version: 1;
  sessions: Session[];
}

export const emptyData: AppData = { version: 1, sessions: [] };
