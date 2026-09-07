import { BaselineSegment, RaceRecord, validateRace } from './race';

export interface SegmentDelta {
  segmentId: string;
  actualSeconds: number;
  baselineSeconds: number;
  deltaSeconds: number;
  recoverableSeconds: number;
}

export interface RaceDecomposition {
  totalSeconds: number;
  byKindSeconds: Record<'run' | 'station' | 'transition', number>;
}

export function decomposeRace(race: RaceRecord): RaceDecomposition {
  validateRace(race);
  const byKindSeconds = { run: 0, station: 0, transition: 0 };
  let totalSeconds = 0;
  for (const segment of race.segments) {
    totalSeconds += segment.durationSeconds;
    byKindSeconds[segment.kind] += segment.durationSeconds;
  }
  return { totalSeconds, byKindSeconds };
}

export function rankBottlenecks(
  race: RaceRecord,
  baseline: readonly BaselineSegment[],
): SegmentDelta[] {
  validateRace(race);
  const baselineById = new Map(baseline.map((item) => [item.segmentId, item]));
  if (baselineById.size !== baseline.length) throw new Error('duplicate baseline segment id');

  const deltas = race.segments.map((segment) => {
    const reference = baselineById.get(segment.id);
    if (!reference) throw new Error(`missing baseline for ${segment.id}`);
    if (!Number.isFinite(reference.durationSeconds) || reference.durationSeconds < 0) {
      throw new Error(`invalid baseline duration for ${segment.id}`);
    }
    const fraction = reference.recoverableFraction ?? 1;
    if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) {
      throw new Error(`recoverableFraction must be in [0, 1] for ${segment.id}`);
    }
    const deltaSeconds = segment.durationSeconds - reference.durationSeconds;
    return {
      segmentId: segment.id,
      actualSeconds: segment.durationSeconds,
      baselineSeconds: reference.durationSeconds,
      deltaSeconds,
      // This is an explicit scenario assumption, not a causal training claim.
      recoverableSeconds: Math.max(0, deltaSeconds) * fraction,
    };
  });

  return deltas.sort(
    (a, b) => b.recoverableSeconds - a.recoverableSeconds || a.segmentId.localeCompare(b.segmentId),
  );
}

export function simulateTarget(
  race: RaceRecord,
  improvementsSeconds: Readonly<Record<string, number>>,
): { projectedSeconds: number; savedSeconds: number } {
  const { totalSeconds } = decomposeRace(race);
  const ids = new Set(race.segments.map((segment) => segment.id));
  let savedSeconds = 0;
  for (const [id, seconds] of Object.entries(improvementsSeconds)) {
    if (!ids.has(id)) throw new Error(`unknown segment: ${id}`);
    if (!Number.isFinite(seconds) || seconds < 0) throw new Error(`invalid improvement for ${id}`);
    const actual = race.segments.find((segment) => segment.id === id)!.durationSeconds;
    if (seconds > actual) throw new Error(`improvement exceeds actual duration for ${id}`);
    savedSeconds += seconds;
  }
  return { projectedSeconds: totalSeconds - savedSeconds, savedSeconds };
}
