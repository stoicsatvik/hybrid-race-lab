import { decomposeRace, rankBottlenecks, simulateTarget } from './analysis';
import { BaselineSegment, RaceRecord } from './race';

export interface RaceDebrief {
  schemaVersion: 1;
  raceId: string;
  measured: ReturnType<typeof decomposeRace>;
  comparison: {
    baselineLabel: string;
    segmentDeltas: ReturnType<typeof rankBottlenecks>;
  };
  scenario: {
    improvementsSeconds: Record<string, number>;
    projectedSeconds: number;
    savedSeconds: number;
  };
  caveats: readonly string[];
}

export function buildRaceDebrief(
  race: RaceRecord,
  baseline: readonly BaselineSegment[],
  baselineLabel: string,
  improvementsSeconds: Readonly<Record<string, number>> = {},
): RaceDebrief {
  if (!baselineLabel.trim()) throw new Error('baselineLabel is required');
  const measured = decomposeRace(race);
  const segmentDeltas = rankBottlenecks(race, baseline);
  const scenario = simulateTarget(race, improvementsSeconds);
  return {
    schemaVersion: 1,
    raceId: race.id,
    measured,
    comparison: { baselineLabel, segmentDeltas },
    scenario: {
      improvementsSeconds: Object.fromEntries(
        Object.entries(improvementsSeconds).sort(([a], [b]) => a.localeCompare(b)),
      ),
      ...scenario,
    },
    caveats: [
      'Segment deltas are comparisons to the supplied baseline, not causal explanations.',
      'Recoverable time and target improvements are explicit scenario assumptions.',
    ],
  };
}

export function exportRaceDebriefJson(debrief: RaceDebrief): string {
  return `${JSON.stringify(debrief, null, 2)}\n`;
}
