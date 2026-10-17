import type { Exercise, ExerciseId, Plan, PlanId, WeightLadder } from './types';

const plates: WeightLadder = { kind: 'step', step: 2.5 };
const bar: WeightLadder = { kind: 'step', step: 5 };
const stack: WeightLadder = { kind: 'step', step: 5 };
const cable: WeightLadder = { kind: 'step', step: 2.5 };

const DUMBBELL_ABOVE_10_STEP = 2.5;
const dumbbells: WeightLadder = {
  kind: 'list',
  values: [
    ...Array.from({ length: 10 }, (_, i) => i + 1),
    ...Array.from({ length: 16 }, (_, i) => 10 + (i + 1) * DUMBBELL_ABOVE_10_STEP),
  ],
};

const reps = { min: 5, max: 8 };

export const exercises: Record<ExerciseId, Exercise> = {
  'incline-press': {
    id: 'incline-press',
    name: 'Incline chest press',
    equipment: 'Hammer Strength · plate-loaded',
    sets: 3,
    repRange: reps,
    unit: 'kg/side',
    weights: plates,
    startWeight: 20,
  },
  'high-row': {
    id: 'high-row',
    name: 'High to low row',
    equipment: 'Hammer Strength · plate-loaded',
    sets: 3,
    repRange: reps,
    unit: 'kg/side',
    weights: plates,
    startWeight: 20,
  },
  'db-lateral-raise': {
    id: 'db-lateral-raise',
    name: 'Seated lateral raise',
    equipment: 'Dumbbells · bench',
    sets: 2,
    repRange: reps,
    unit: 'kg/hand',
    weights: dumbbells,
    startWeight: 6,
  },
  'db-curl': {
    id: 'db-curl',
    name: 'Seated dumbbell curl',
    equipment: 'Dumbbells · bench',
    sets: 2,
    repRange: reps,
    unit: 'kg/hand',
    weights: dumbbells,
    startWeight: 10,
  },
  'cable-pushdown': {
    id: 'cable-pushdown',
    name: 'Single-arm pushdown',
    equipment: 'Cable · ankle strap on wrist',
    sets: 2,
    repRange: reps,
    unit: 'kg stack',
    weights: cable,
    startWeight: 10,
  },
  'bench-press': {
    id: 'bench-press',
    name: 'Bench press',
    equipment: 'Barbell · flat bench',
    sets: 3,
    repRange: reps,
    unit: 'kg bar',
    weights: bar,
    startWeight: 40,
  },
  'lat-pulldown': {
    id: 'lat-pulldown',
    name: 'Lat pulldown',
    equipment: 'Cable stack',
    sets: 3,
    repRange: reps,
    unit: 'kg stack',
    weights: stack,
    startWeight: 40,
  },
  'machine-lateral-raise': {
    id: 'machine-lateral-raise',
    name: 'Lateral raise machine',
    equipment: 'Hammer Strength · plate-loaded',
    sets: 2,
    repRange: reps,
    unit: 'kg/side',
    weights: plates,
    startWeight: 10,
  },
  'machine-preacher-curl': {
    id: 'machine-preacher-curl',
    name: 'Preacher curl machine',
    equipment: 'Hammer Strength · plate-loaded',
    sets: 2,
    repRange: reps,
    unit: 'kg/side',
    weights: plates,
    startWeight: 10,
  },
};

export const plans: Record<PlanId, Plan> = {
  A: {
    id: 'A',
    exercises: ['incline-press', 'high-row', 'db-lateral-raise', 'db-curl', 'cable-pushdown'],
  },
  B: {
    id: 'B',
    exercises: ['bench-press', 'lat-pulldown', 'machine-lateral-raise', 'machine-preacher-curl', 'cable-pushdown'],
  },
};
