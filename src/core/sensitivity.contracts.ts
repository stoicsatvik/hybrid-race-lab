import { analyzeSensitivity } from './sensitivity';
import { RaceRecord } from './race';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectThrow(fn: () => unknown, fragment: string): void {
  try { fn(); } catch (error) {
    assert(error instanceof Error && error.message.includes(fragment), `expected error containing ${fragment}`);
    return;
  }
  throw new Error(`expected throw containing ${fragment}`);
}

const race: RaceRecord = {
  id: 'synthetic-sensitivity',
  segments: [
    { id: 'run-1', kind: 'run', label: 'Run 1', durationSeconds: 300 },
    { id: 'station-1', kind: 'station', label: 'Station 1', durationSeconds: 240 },
    { id: 'transition-1', kind: 'transition', label: 'Transition 1', durationSeconds: 60 },
  ],
};

const stable = analyzeSensitivity(race, [
  { id: 'conservative', baseline: [
    { segmentId: 'run-1', durationSeconds: 270, recoverableFraction: 0.5 },
    { segmentId: 'station-1', durationSeconds: 210, recoverableFraction: 0.25 },
    { segmentId: 'transition-1', durationSeconds: 55, recoverableFraction: 0.2 },
  ], improvementsSeconds: { 'run-1': 20 } },
  { id: 'optimistic', baseline: [
    { segmentId: 'run-1', durationSeconds: 260, recoverableFraction: 0.75 },
    { segmentId: 'station-1', durationSeconds: 200, recoverableFraction: 0.5 },
    { segmentId: 'transition-1', durationSeconds: 50, recoverableFraction: 0.5 },
  ], improvementsSeconds: { 'run-1': 30 } },
], 580);
assert(stable.topBottleneckStable, 'top bottleneck should be stable');
assert(stable.orderingStable, 'full ordering should be stable');
assert(stable.targetFeasibleInAnyScenario === true, 'target should be feasible in at least one scenario');
assert(stable.targetFeasibleInAllScenarios === true, 'target should be feasible in all scenarios');
assert(stable.segmentRankStability[0].segmentId === 'run-1', 'stable top summary mismatch');
assert(stable.segmentRankStability[0].topShare === 1, 'stable top share should be one');
assert(stable.segmentRankStability[0].bestRank === 1 && stable.segmentRankStability[0].worstRank === 1, 'stable rank range mismatch');

const reversal = analyzeSensitivity(race, [
  { id: 'run-heavy', baseline: [
    { segmentId: 'run-1', durationSeconds: 250, recoverableFraction: 1 },
    { segmentId: 'station-1', durationSeconds: 220, recoverableFraction: 0.5 },
    { segmentId: 'transition-1', durationSeconds: 55, recoverableFraction: 1 },
  ] },
  { id: 'station-heavy', baseline: [
    { segmentId: 'run-1', durationSeconds: 280, recoverableFraction: 0.5 },
    { segmentId: 'station-1', durationSeconds: 180, recoverableFraction: 1 },
    { segmentId: 'transition-1', durationSeconds: 55, recoverableFraction: 1 },
  ] },
]);
assert(!reversal.topBottleneckStable, 'rank reversal must be surfaced');
assert(!reversal.orderingStable, 'ordering reversal must be surfaced');
assert(reversal.scenarios[0].topBottleneckId === 'run-1', 'first scenario top mismatch');
assert(reversal.scenarios[1].topBottleneckId === 'station-1', 'second scenario top mismatch');
const runSummary = reversal.segmentRankStability.find((item) => item.segmentId === 'run-1')!;
const stationSummary = reversal.segmentRankStability.find((item) => item.segmentId === 'station-1')!;
assert(runSummary.topCount === 1 && runSummary.topShare === 0.5, 'run top frequency mismatch');
assert(stationSummary.topCount === 1 && stationSummary.topShare === 0.5, 'station top frequency mismatch');
assert(runSummary.bestRank === 1 && runSummary.worstRank === 2, 'run rank range mismatch');
assert(stationSummary.bestRank === 1 && stationSummary.worstRank === 2, 'station rank range mismatch');

expectThrow(() => analyzeSensitivity(race, []), 'at least one sensitivity scenario');
expectThrow(() => analyzeSensitivity(race, [{ id: 'x', baseline: [] }]), 'missing baseline');
expectThrow(() => analyzeSensitivity(race, [
  { id: 'dup', baseline: [
    { segmentId: 'run-1', durationSeconds: 300 }, { segmentId: 'station-1', durationSeconds: 240 }, { segmentId: 'transition-1', durationSeconds: 60 },
  ] },
  { id: 'dup', baseline: [
    { segmentId: 'run-1', durationSeconds: 300 }, { segmentId: 'station-1', durationSeconds: 240 }, { segmentId: 'transition-1', durationSeconds: 60 },
  ] },
]), 'duplicate scenario id');
expectThrow(() => analyzeSensitivity(race, [{ id: 'x', baseline: [
  { segmentId: 'run-1', durationSeconds: 300 }, { segmentId: 'station-1', durationSeconds: 240 }, { segmentId: 'transition-1', durationSeconds: 60 },
] }], -1), 'targetSeconds');

console.log('sensitivity contracts passed');
