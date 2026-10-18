import type { Exercise, ExerciseId, Plan, PlanId, WeightLadder } from './types';

const plates: WeightLadder = { kind: 'step', step: 2.5 };
const bar: WeightLadder = { kind: 'step', step: 5 };
const stack: WeightLadder = { kind: 'step', step: 5 };
const pushdownStack: WeightLadder = {
  kind: 'list',
  values: [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 21.25, 25, 28.75, 32.5, 36.25, 40, 43.75, 47.5],
};
const lateralRaiseStack: WeightLadder = {
  kind: 'list',
  values: [5, 10, 15, 20, 25, 32, 39, 46, 53, 60, 67, 74, 81, 88, 95],
};

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
    sets: 3,
    repRange: reps,
    unit: 'kg/side',
    weights: plates,
    startWeight: 20,
  },
  'high-row': {
    id: 'high-row',
    name: 'High to low row',
    sets: 3,
    repRange: reps,
    unit: 'kg/side',
    weights: plates,
    startWeight: 20,
  },
  'db-lateral-raise': {
    id: 'db-lateral-raise',
    name: 'Seated lateral raise',
    sets: 2,
    repRange: reps,
    unit: 'kg/hand',
    weights: dumbbells,
    startWeight: 6,
  },
  'db-curl': {
    id: 'db-curl',
    name: 'Seated dumbbell curl',
    sets: 2,
    repRange: reps,
    unit: 'kg/hand',
    weights: dumbbells,
    startWeight: 10,
  },
  'cable-pushdown': {
    id: 'cable-pushdown',
    name: 'Single-arm pushdown',
    sets: 2,
    repRange: reps,
    unit: 'kg stack',
    weights: pushdownStack,
    startWeight: 10,
  },
  'bench-press': {
    id: 'bench-press',
    name: 'Bench press',
    sets: 3,
    repRange: reps,
    unit: 'kg bar',
    weights: bar,
    startWeight: 40,
  },
  'lat-pulldown': {
    id: 'lat-pulldown',
    name: 'Lat pulldown',
    sets: 3,
    repRange: reps,
    unit: 'kg stack',
    weights: stack,
    startWeight: 40,
  },
  'machine-lateral-raise': {
    id: 'machine-lateral-raise',
    name: 'Lateral raise machine',
    sets: 2,
    repRange: reps,
    unit: 'kg stack',
    weights: lateralRaiseStack,
    startWeight: 10,
  },
  'machine-preacher-curl': {
    id: 'machine-preacher-curl',
    name: 'Preacher curl machine',
    sets: 2,
    repRange: reps,
    unit: 'kg stack',
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

const swapPairs: readonly [ExerciseId, ExerciseId][] = [
  ['bench-press', 'incline-press'],
  ['lat-pulldown', 'high-row'],
  ['db-curl', 'machine-preacher-curl'],
  ['machine-lateral-raise', 'db-lateral-raise'],
];

export const alternativeOf = (id: ExerciseId): ExerciseId | undefined =>
  swapPairs.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []))[0];
