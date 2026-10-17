import type { WeightLadder } from './types';

const EPS = 1e-9;
const round = (x: number) => Math.round(x * 100) / 100;

export function nextUp(ladder: WeightLadder, w: number): number {
  if (ladder.kind === 'step') {
    return round((Math.floor(w / ladder.step + EPS) + 1) * ladder.step);
  }
  const { values } = ladder;
  const above = values.find((v) => v > w + EPS);
  if (above !== undefined) return above;
  const last = values.at(-1) ?? 0;
  const gap = last - (values.at(-2) ?? 0);
  return round(Math.max(w, last) + gap);
}

export function nextDown(ladder: WeightLadder, w: number): number {
  if (ladder.kind === 'step') {
    return Math.max(0, round((Math.ceil(w / ladder.step - EPS) - 1) * ladder.step));
  }
  const below = ladder.values.findLast((v) => v < w - EPS);
  return below ?? ladder.values[0] ?? 0;
}

export function floorTo(ladder: WeightLadder, w: number): number {
  if (ladder.kind === 'step') {
    return round(Math.floor(w / ladder.step + EPS) * ladder.step);
  }
  return ladder.values.findLast((v) => v <= w + EPS) ?? ladder.values[0] ?? 0;
}
