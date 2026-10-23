import { describe, expect, it } from 'vitest';
import { exercises } from './catalogue';
import { floorTo, nextDown, nextUp } from './ladder';
import { nextTargets } from './progression';
import type { Load } from './types';

const sets = (...pairs: [number, number][]): Load[] => pairs.map(([weight, reps]) => ({ weight, reps }));
const incline = exercises['incline-press'];
const dbRaise = exercises['db-lateral-raise'];
const bench = exercises['bench-press'];

describe('ladders', () => {
  it('steps plates by 2.5 and snaps off-ladder weights', () => {
    expect(nextUp(incline.weights, 40)).toBe(42.5);
    expect(nextUp(incline.weights, 41)).toBe(42.5);
    expect(nextDown(incline.weights, 40)).toBe(37.5);
    expect(nextDown(incline.weights, 41)).toBe(40);
    expect(floorTo(incline.weights, 36)).toBe(35);
  });

  it('walks the dumbbell rack in 1 kg to 10 then 2.5 kg', () => {
    expect(nextUp(dbRaise.weights, 9)).toBe(10);
    expect(nextUp(dbRaise.weights, 10)).toBe(12.5);
    expect(nextDown(dbRaise.weights, 12.5)).toBe(10);
    expect(nextDown(dbRaise.weights, 1)).toBe(1);
  });

  it('follows the real weight stacks on the pushdown and lateral raise machine', () => {
    const pushdown = exercises['cable-pushdown'].weights;
    const raise = exercises['machine-lateral-raise'].weights;
    expect(nextUp(pushdown, 17.5)).toBe(21.25);
    expect(nextDown(pushdown, 21.25)).toBe(17.5);
    expect(nextUp(raise, 25)).toBe(32);
    expect(nextUp(raise, 32)).toBe(39);
    expect(exercises['machine-preacher-curl'].weights).toBe(raise);
  });
});

describe('nextTargets', () => {
  it('asks for a calibration session with no history', () => {
    expect(nextTargets(incline, [])).toEqual({ reason: 'baseline' });
  });

  it('gives each set its own weight, heaviest first', () => {
    const t = { reason: 'reps', sets: sets([50, 7], [45, 8], [45, 7]) };
    expect(nextTargets(incline, [sets([50, 6], [45, 7], [45, 6])])).toEqual(t);
    expect(nextTargets(incline, [sets([45, 6], [50, 6], [45, 7])])).toEqual(t);
  });

  it('moves only the sets that hit 8 up a step', () => {
    expect(nextTargets(incline, [sets([40, 8], [40, 7], [40, 6])])).toEqual({
      reason: 'weight',
      sets: sets([42.5, 5], [40, 8], [40, 7]),
    });
  });

  it('moves 40 x 8 on every set to 42.5 x 5', () => {
    expect(nextTargets(incline, [sets([40, 8], [40, 8], [40, 8])])).toEqual({
      reason: 'weight',
      sets: sets([42.5, 5], [42.5, 5], [42.5, 5]),
    });
  });

  it('never asks for more than 8 reps', () => {
    const t = nextTargets(incline, [sets([45, 10], [45, 9], [45, 8])]);
    expect(t).toEqual({ reason: 'weight', sets: sets([47.5, 7], [47.5, 6], [47.5, 6]) });
  });

  it('asks for 5 reps after a jump bigger than the estimate allows', () => {
    expect(nextTargets(dbRaise, [sets([9, 8], [9, 8])])).toEqual({ reason: 'weight', sets: sets([10, 5], [10, 5]) });
    expect(nextTargets(exercises['cable-pushdown'], [sets([15, 8], [17.5, 8])])).toEqual({
      reason: 'weight',
      sets: sets([21.25, 5], [17.5, 5]),
    });
  });

  it('deloads about 10% after three sessions at one weight without progress', () => {
    const stuck = sets([40, 6], [40, 6], [40, 5]);
    expect(nextTargets(incline, [stuck, stuck, stuck])).toEqual({
      reason: 'deload',
      sets: sets([35, 8], [35, 8], [35, 8]),
    });
  });

  it('does not deload while total reps are still climbing', () => {
    const t = nextTargets(incline, [sets([40, 6], [40, 6], [40, 5]), sets([40, 7], [40, 6], [40, 5]), sets([40, 6], [40, 6], [40, 6])]);
    expect(t.reason).toBe('reps');
  });

  it('fills a skipped set from the lightest completed one', () => {
    const t = nextTargets(bench, [sets([60, 6], [60, 5])]);
    expect(t).toEqual({ reason: 'reps', sets: sets([60, 7], [60, 6], [60, 6]) });
  });
});
