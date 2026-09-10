import { buildRaceDebrief, exportRaceDebriefJson } from './debrief';
import { BaselineSegment, RaceRecord } from './race';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function expectThrow(fn: () => unknown, message: string) {
  let threw = false;
  try { fn(); } catch { threw = true; }
  assert(threw, message);
}

const race: RaceRecord = {
  id: 'synthetic-race',
  segments: [
    { id: 'run-1', kind: 'run', label: 'Run 1', durationSeconds: 300 },
    { id: 'station-1', kind: 'station', label: 'Station 1', durationSeconds: 180 },
    { id: 'transition-1', kind: 'transition', label: 'Transition 1', durationSeconds: 30 },
  ],
};
const baseline: BaselineSegment[] = [
  { segmentId: 'run-1', durationSeconds: 280, recoverableFraction: 0.5 },
  { segmentId: 'station-1', durationSeconds: 150, recoverableFraction: 0.5 },
  { segmentId: 'transition-1', durationSeconds: 30, recoverableFraction: 1 },
];

const debrief = buildRaceDebrief(race, baseline, 'synthetic baseline', { 'station-1': 10, 'run-1': 5 });
assert(debrief.measured.totalSeconds === 510, 'measured total must be exact');
assert(debrief.scenario.savedSeconds === 15 && debrief.scenario.projectedSeconds === 495, 'scenario conservation failed');
assert(debrief.comparison.segmentDeltas[0].segmentId === 'station-1', 'largest explicit opportunity must rank first');
assert(Object.keys(debrief.scenario.improvementsSeconds).join(',') === 'run-1,station-1', 'scenario keys must export deterministically');
assert(debrief.caveats.every((c) => !/training|medical|fitness/i.test(c) || c.includes('causal')), 'debrief must not invent causal advice');

const once = exportRaceDebriefJson(debrief);
const twice = exportRaceDebriefJson(buildRaceDebrief(race, baseline, 'synthetic baseline', { 'run-1': 5, 'station-1': 10 }));
assert(once === twice, 'equivalent inputs must serialize byte-identically');
assert(once.endsWith('\n'), 'export must have deterministic trailing newline');
expectThrow(() => buildRaceDebrief(race, baseline, '   '), 'blank baseline labels must fail closed');
expectThrow(() => buildRaceDebrief(race, baseline, 'x', { missing: 1 }), 'unknown improvement IDs must fail closed');

console.log('debrief contracts passed');
