import assert from 'node:assert/strict';
import { RaceRecord } from './race';
import { enumerateTargetPlans } from './target-plan';

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
assert.deepEqual(first, second, 'target plans must be deterministic');
assert.deepEqual(first.map((plan) => plan.segmentIds), [
  ['run-1', 'run-2'],
]);
assert.equal(first[0].savedSeconds, 65);
assert.equal(first[0].projectedSeconds, 1135);
assert.equal(first[0].excessSavingsSeconds, 5);

assert.deepEqual(enumerateTargetPlans(race, 1100, options), [], 'impossible target must return no plan');
assert.deepEqual(enumerateTargetPlans(race, 1200, options), [{
  segmentIds: [], improvementsSeconds: {}, savedSeconds: 0, projectedSeconds: 1200, excessSavingsSeconds: 0,
}]);
assert.throws(() => enumerateTargetPlans(race, 1140, [...options, { segmentId: 'run-1', seconds: 1 }]));
assert.throws(() => enumerateTargetPlans(race, 1140, [{ segmentId: 'missing', seconds: 1 }]));
assert.throws(() => enumerateTargetPlans(race, 1140, [{ segmentId: 'row', seconds: 301 }]));

console.log('target-plan contracts passed');
