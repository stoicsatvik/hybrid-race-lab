import { RaceRecord } from './race';
import { enumerateTargetPlans } from './target-plan';

function equal(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: expected ${e}, got ${a}`);
}

function throws(fn: () => unknown, label: string): void {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error(`${label}: expected an error`);
}

const race: RaceRecord = {
  id: 'synthetic-target-race',
  segments: [
    { id: 'run-1', kind: 'run', label: 'Run 1', durationSeconds: 420 },
    { id: 'row', kind: 'station', label: 'Row', durationSeconds: 300 },
    { id: 'transition', kind: 'transition', label: 'Transition', durationSeconds: 90 },
    { id: 'run-2', kind: 'run', label: 'Run 2', durationSeconds: 390 },
  ],
};

const options = [
  { segmentId: 'run-1', seconds: 35 },
  { segmentId: 'row', seconds: 20 },
  { segmentId: 'transition', seconds: 15 },
  { segmentId: 'run-2', seconds: 30 },
] as const;

const first = enumerateTargetPlans(race, 1140, options);
const second = enumerateTargetPlans(race, 1140, options);
equal(first, second, 'target plans must be deterministic');
equal(first.map((plan) => plan.segmentIds), [
  ['run-1', 'run-2'],
], 'minimal-cardinality feasible plan');
equal(first[0].savedSeconds, 65, 'saved seconds');
equal(first[0].projectedSeconds, 1135, 'projected seconds');
equal(first[0].excessSavingsSeconds, 5, 'excess savings');

// The declared options can save at most 100 s from this 1200 s race.
// 1100 s is therefore exactly reachable; 1099 s is the first impossible target.
equal(enumerateTargetPlans(race, 1100, options).map((plan) => plan.savedSeconds), [100], 'boundary target at maximum declared savings must be feasible');
equal(enumerateTargetPlans(race, 1099, options), [], 'target beyond maximum declared savings must return no plan');
equal(enumerateTargetPlans(race, 1200, options), [{
  segmentIds: [], improvementsSeconds: {}, savedSeconds: 0, projectedSeconds: 1200, excessSavingsSeconds: 0,
}], 'already-achieved target');
throws(() => enumerateTargetPlans(race, 1140, [...options, { segmentId: 'run-1', seconds: 1 }]), 'duplicate segment option');
throws(() => enumerateTargetPlans(race, 1140, [{ segmentId: 'missing', seconds: 1 }]), 'unknown segment option');
throws(() => enumerateTargetPlans(race, 1140, [{ segmentId: 'row', seconds: 301 }]), 'impossible segment saving');

console.log('target-plan contracts passed');
