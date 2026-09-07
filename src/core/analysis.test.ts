import { decomposeRace, rankBottlenecks, simulateTarget } from './analysis';
import { RaceRecord } from './race';

const race: RaceRecord = {
  id: 'synthetic-v0',
  segments: [
    { id: 'run-1', kind: 'run', label: 'Run 1', durationSeconds: 300 },
    { id: 'station-1', kind: 'station', label: 'Station 1', durationSeconds: 180 },
    { id: 'transition-1', kind: 'transition', label: 'Transition 1', durationSeconds: 30 },
    { id: 'run-2', kind: 'run', label: 'Run 2', durationSeconds: 330 },
  ],
};

describe('V0 race analysis contracts', () => {
  test('decomposition exactly preserves measured total and segment kinds', () => {
    expect(decomposeRace(race)).toEqual({
      totalSeconds: 840,
      byKindSeconds: { run: 630, station: 180, transition: 30 },
    });
  });

  test('bottlenecks rank by explicit recoverable-time scenario with stable id tie-break', () => {
    const ranked = rankBottlenecks(race, [
      { segmentId: 'run-1', durationSeconds: 280, recoverableFraction: 0.5 },
      { segmentId: 'station-1', durationSeconds: 170, recoverableFraction: 1 },
      { segmentId: 'transition-1', durationSeconds: 20, recoverableFraction: 1 },
      { segmentId: 'run-2', durationSeconds: 300, recoverableFraction: 0.25 },
    ]);
    expect(ranked.map(({ segmentId, recoverableSeconds }) => [segmentId, recoverableSeconds])).toEqual([
      ['station-1', 10],
      ['transition-1', 10],
      ['run-1', 10],
      ['run-2', 7.5],
    ]);
  });

  test('missing and malformed baselines fail closed', () => {
    expect(() => rankBottlenecks(race, [{ segmentId: 'run-1', durationSeconds: 280 }])).toThrow(
      'missing baseline',
    );
    expect(() =>
      rankBottlenecks(race, [
        { segmentId: 'run-1', durationSeconds: 280, recoverableFraction: 2 },
        { segmentId: 'station-1', durationSeconds: 170 },
        { segmentId: 'transition-1', durationSeconds: 20 },
        { segmentId: 'run-2', durationSeconds: 300 },
      ]),
    ).toThrow('recoverableFraction');
  });

  test('target simulation conserves total minus explicit improvements', () => {
    expect(simulateTarget(race, { 'run-1': 15, 'station-1': 20 })).toEqual({
      projectedSeconds: 805,
      savedSeconds: 35,
    });
    expect(() => simulateTarget(race, { unknown: 1 })).toThrow('unknown segment');
    expect(() => simulateTarget(race, { 'run-1': 301 })).toThrow('exceeds actual duration');
  });
});
