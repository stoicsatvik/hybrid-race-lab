import { decomposeRace, rankBottlenecks, simulateTarget } from './analysis';
import { RaceRecord } from './race';

function equal(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: expected ${e}, got ${a}`);
}

function throws(fn: () => unknown, fragment: string, label: string): void {
  try {
    fn();
  } catch (error) {
    if (error instanceof Error && error.message.includes(fragment)) return;
    throw new Error(`${label}: wrong error ${String(error)}`);
  }
  throw new Error(`${label}: expected error containing ${fragment}`);
}

const race: RaceRecord = {
  id: 'synthetic-v0',
  segments: [
    { id: 'run-1', kind: 'run', label: 'Run 1', durationSeconds: 300 },
    { id: 'station-1', kind: 'station', label: 'Station 1', durationSeconds: 180 },
    { id: 'transition-1', kind: 'transition', label: 'Transition 1', durationSeconds: 30 },
    { id: 'run-2', kind: 'run', label: 'Run 2', durationSeconds: 330 },
  ],
};

equal(decomposeRace(race), {
  totalSeconds: 840,
  byKindSeconds: { run: 630, station: 180, transition: 30 },
}, 'decomposition');

const ranked = rankBottlenecks(race, [
  { segmentId: 'run-1', durationSeconds: 280, recoverableFraction: 0.5 },
  { segmentId: 'station-1', durationSeconds: 170, recoverableFraction: 1 },
  { segmentId: 'transition-1', durationSeconds: 20, recoverableFraction: 1 },
  { segmentId: 'run-2', durationSeconds: 300, recoverableFraction: 0.25 },
]);
equal(ranked.map(({ segmentId, recoverableSeconds }) => [segmentId, recoverableSeconds]), [
  ['run-1', 10], ['station-1', 10], ['transition-1', 10], ['run-2', 7.5],
], 'stable bottleneck ordering');

throws(() => rankBottlenecks(race, [{ segmentId: 'run-1', durationSeconds: 280 }]), 'missing baseline', 'missing baseline');
throws(() => rankBottlenecks(race, [
  { segmentId: 'run-1', durationSeconds: 280, recoverableFraction: 2 },
  { segmentId: 'station-1', durationSeconds: 170 },
  { segmentId: 'transition-1', durationSeconds: 20 },
  { segmentId: 'run-2', durationSeconds: 300 },
]), 'recoverableFraction', 'invalid recoverable fraction');

equal(simulateTarget(race, { 'run-1': 15, 'station-1': 20 }), { projectedSeconds: 805, savedSeconds: 35 }, 'target conservation');
throws(() => simulateTarget(race, { unknown: 1 }), 'unknown segment', 'unknown segment');
throws(() => simulateTarget(race, { 'run-1': 301 }), 'exceeds actual duration', 'impossible improvement');

console.log('core contracts passed');
